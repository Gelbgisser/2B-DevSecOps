/**
 * Day 2 worker: BRPOP a Redis list named scan-jobs.
 * Day 7 can extend this to call ClamAV. For Compose labs it is enough
 * that the process stays up and logs each payload.
 */
import net from "node:net";

const REDIS_URL = process.env.REDIS_URL || "redis://redis:6379";
const parsed = new URL(REDIS_URL);

function redisCommand(cmd) {
  return new Promise((resolve, reject) => {
    const socket = net.connect({ host: parsed.hostname, port: Number(parsed.port || 6379) });
    let buf = "";
    socket.setTimeout(0);
    socket.on("error", reject);
    socket.on("data", (d) => {
      buf += d.toString("utf8");
      if (buf.includes("\n")) {
        socket.end();
        resolve(buf);
      }
    });
    socket.write(cmd);
  });
}

async function loop() {
  process.stdout.write(
    JSON.stringify({ ts: new Date().toISOString(), msg: "worker-start", redis: REDIS_URL }) + "\n"
  );
  while (true) {
    try {
      // BLPOP scan-jobs 5
      const raw = await redisCommand("BLPOP scan-jobs 5\r\n");
      if (raw.startsWith("$-1") || raw.startsWith("*-1")) {
        continue;
      }
      process.stdout.write(
        JSON.stringify({ ts: new Date().toISOString(), msg: "job", raw: raw.trim() }) + "\n"
      );
    } catch (err) {
      process.stderr.write(
        JSON.stringify({ ts: new Date().toISOString(), level: "error", msg: err.message }) + "\n"
      );
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

loop();
