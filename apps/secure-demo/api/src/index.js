import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import express from "express";
import multer from "multer";
import { pingDb } from "./db.js";
import { scanBuffer } from "./clamav.js";
import { enqueueScan, pingRedis } from "./redis.js";

const PORT = Number(process.env.PORT || 3001);
const APP_URL = process.env.APP_URL || "http://localhost:3080";
const DATA_DIR = process.env.DATA_DIR || "/data";
const QUARANTINE = path.join(DATA_DIR, "quarantine");
const CLEAN = path.join(DATA_DIR, "clean");
const META = path.join(DATA_DIR, "meta");
const MOCK_USER_HEADER = process.env.MOCK_USER_HEADER || "X-Demo-User";

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "1mb" }));

app.use((req, res, next) => {
  const requestId = req.header("x-request-id") || crypto.randomUUID();
  req.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);
  const start = Date.now();
  res.on("finish", () => {
    const line = JSON.stringify({
      ts: new Date().toISOString(),
      level: "info",
      msg: "request",
      requestId,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      ms: Date.now() - start,
      user: req.header(MOCK_USER_HEADER) || "anonymous",
    });
    process.stdout.write(line + "\n");
  });
  next();
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

async function ensureDirs() {
  await fs.mkdir(QUARANTINE, { recursive: true });
  await fs.mkdir(CLEAN, { recursive: true });
  await fs.mkdir(META, { recursive: true });
}

async function writeMeta(id, data) {
  await fs.writeFile(path.join(META, `${id}.json`), JSON.stringify(data, null, 2));
}

async function readMeta(id) {
  try {
    const raw = await fs.readFile(path.join(META, `${id}.json`), "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

app.get(["/health/live", "/health/live"], (_req, res) => {
  res.json({ status: "live" });
});

app.get(["/health/ready", "/health/ready"], async (_req, res) => {
  const db = await pingDb();
  const redis = await pingRedis();
  const body = { status: "ready", db: db.status, redis: redis.status, appUrl: APP_URL };
  const ok = db.status !== "error";
  res.status(ok ? 200 : 503).json(body);
});

app.get("/api/hello", (req, res) => {
  res.json({
    message: "hello from secure-demo",
    requestId: req.requestId,
    appUrl: APP_URL,
    hint: "Browsers should call this via the edge origin (APP_URL), not the container port.",
  });
});

app.get("/api/whoami", (req, res) => {
  res.json({
    user: req.header(MOCK_USER_HEADER) || "anonymous",
    note: "This header is a lab mock. WAF and headers are not authorization.",
  });
});

app.post("/api/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "multipart field 'file' is required" });
  }
  await ensureDirs();
  const id = crypto.randomUUID();
  const safeName = path.basename(req.file.originalname).replace(/[^\w.\-]+/g, "_");
  const quarantined = path.join(QUARANTINE, `${id}__${safeName}`);
  await fs.writeFile(quarantined, req.file.buffer);

  const meta = {
    id,
    filename: safeName,
    bytes: req.file.size,
    mime: req.file.mimetype,
    status: "quarantined",
    owner: req.header(MOCK_USER_HEADER) || "anonymous",
    createdAt: new Date().toISOString(),
  };
  await writeMeta(id, meta);
  await enqueueScan(id);

  // Best-effort inline scan when ClamAV is configured (worker may also scan).
  if (process.env.CLAMAV_HOST) {
    try {
      const result = await scanBuffer(req.file.buffer);
      meta.scan = result;
      if (result.infected) {
        meta.status = "denied";
      } else {
        meta.status = "clean";
        await fs.copyFile(quarantined, path.join(CLEAN, `${id}__${safeName}`));
      }
      await writeMeta(id, meta);
    } catch (err) {
      meta.status = "scan_error";
      meta.scan = { error: String(err.message || err) };
      await writeMeta(id, meta);
    }
  }

  res.status(202).json({
    id,
    status: meta.status,
    statusUrl: `/api/uploads/${id}`,
    requestId: req.requestId,
  });
});

app.get("/api/uploads/:id", async (req, res) => {
  const meta = await readMeta(req.params.id);
  if (!meta) return res.status(404).json({ error: "not found" });
  res.json(meta);
});

app.get("/api/uploads/:id/download", async (req, res) => {
  const meta = await readMeta(req.params.id);
  if (!meta) return res.status(404).json({ error: "not found" });
  const caller = req.header(MOCK_USER_HEADER) || "anonymous";
  if (meta.owner !== caller && caller !== "admin") {
    return res.status(403).json({
      error: "forbidden",
      lesson: "ClamAV CLEAN is not authorization to read another tenant's object.",
    });
  }
  if (meta.status !== "clean") {
    return res.status(409).json({ error: "not clean", status: meta.status });
  }
  const filePath = path.join(CLEAN, `${meta.id}__${meta.filename}`);
  res.download(filePath, meta.filename);
});

app.use((err, req, res, _next) => {
  process.stderr.write(
    JSON.stringify({
      ts: new Date().toISOString(),
      level: "error",
      msg: err.message,
      requestId: req.requestId,
    }) + "\n"
  );
  res.status(500).json({ error: "internal", requestId: req.requestId });
});

const server = app.listen(PORT, "0.0.0.0", () => {
  process.stdout.write(
    JSON.stringify({
      ts: new Date().toISOString(),
      level: "info",
      msg: "listen",
      port: PORT,
      appUrl: APP_URL,
    }) + "\n"
  );
});

async function shutdown() {
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 5000).unref();
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
