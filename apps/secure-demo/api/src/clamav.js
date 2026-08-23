import net from "node:net";

const HOST = process.env.CLAMAV_HOST || "";
const PORT = Number(process.env.CLAMAV_PORT || 3310);

/**
 * ClamAV INSTREAM. Buffer stays in-process so host AV does not lock an
 * on-disk EICAR file (Day 7 warning).
 */
export async function scanBuffer(buffer) {
  if (!HOST) {
    return { skipped: true, infected: false };
  }
  return new Promise((resolve, reject) => {
    const socket = net.connect({ host: HOST, port: PORT });
    const chunks = [];
    socket.setTimeout(15000);
    socket.on("timeout", () => {
      socket.destroy();
      reject(new Error("clamav timeout"));
    });
    socket.on("error", reject);
    socket.on("data", (d) => chunks.push(d));
    socket.on("end", () => {
      const text = Buffer.concat(chunks).toString("utf8").trim();
      const infected = /FOUND$/.test(text) && !/OK$/.test(text);
      resolve({ skipped: false, infected, raw: text });
    });
    socket.write("nINSTREAM\n");
    const header = Buffer.alloc(4);
    header.writeUInt32BE(buffer.length, 0);
    socket.write(header);
    socket.write(buffer);
    const z = Buffer.alloc(4);
    z.writeUInt32BE(0, 0);
    socket.write(z);
  });
}
