import net from "node:net";

const url = process.env.REDIS_URL || "";

function parseRedis() {
  if (!url) return null;
  try {
    const u = new URL(url);
    return { host: u.hostname, port: Number(u.port || 6379) };
  } catch {
    return null;
  }
}

function send(cmd) {
  const parsed = parseRedis();
  if (!parsed) return Promise.resolve(null);
  return new Promise((resolve, reject) => {
    const socket = net.connect(parsed);
    let buf = "";
    socket.setTimeout(3000);
    socket.on("timeout", () => {
      socket.destroy();
      reject(new Error("redis timeout"));
    });
    socket.on("error", reject);
    socket.on("data", (d) => {
      buf += d.toString("utf8");
    });
    socket.on("end", () => resolve(buf));
    socket.write(cmd);
  });
}

export async function pingRedis() {
  if (!parseRedis()) return { status: "skipped" };
  try {
    const res = await send("PING\r\n");
    return { status: res && res.includes("PONG") ? "ok" : "error" };
  } catch (err) {
    return { status: "error", error: err.message };
  }
}

export async function enqueueScan(id) {
  if (!parseRedis()) return { queued: false };
  const payload = JSON.stringify({ id, ts: Date.now() });
  const cmd = `RPUSH scan-jobs ${payload.length}\r\n${payload}\r\n`;
  try {
    await send(cmd);
    return { queued: true };
  } catch {
    return { queued: false };
  }
}
