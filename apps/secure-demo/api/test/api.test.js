import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { setTimeout as sleep } from "node:timers/promises";

function startServer(port) {
  const child = spawn(process.execPath, ["src/index.js"], {
    cwd: new URL("..", import.meta.url),
    env: { ...process.env, PORT: String(port), APP_URL: `http://127.0.0.1:${port}` },
    stdio: ["ignore", "pipe", "pipe"],
  });
  return child;
}

async function waitLive(port) {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/health/live`);
      if (res.ok) return;
    } catch {
      /* retry */
    }
    await sleep(50);
  }
  throw new Error("server did not become live");
}

test("hello returns message and request id", async (t) => {
  const port = 18081;
  const child = startServer(port);
  t.after(() => child.kill("SIGTERM"));
  await waitLive(port);
  const res = await fetch(`http://127.0.0.1:${port}/api/hello`, {
    headers: { "X-Request-Id": "test-req-1" },
  });
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("x-request-id"), "test-req-1");
  const body = await res.json();
  assert.equal(body.message, "hello from secure-demo");
  assert.equal(body.requestId, "test-req-1");
});

test("ready is 200 when DATABASE_URL is unset", async (t) => {
  const port = 18082;
  const child = startServer(port);
  t.after(() => child.kill("SIGTERM"));
  await waitLive(port);
  const res = await fetch(`http://127.0.0.1:${port}/health/ready`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.db, "skipped");
});

test("missing upload file is 400", async (t) => {
  const port = 18083;
  const child = startServer(port);
  t.after(() => child.kill("SIGTERM"));
  await waitLive(port);
  const res = await fetch(`http://127.0.0.1:${port}/api/upload`, { method: "POST" });
  assert.equal(res.status, 400);
});

await once(process, "beforeExit").catch(() => undefined);
