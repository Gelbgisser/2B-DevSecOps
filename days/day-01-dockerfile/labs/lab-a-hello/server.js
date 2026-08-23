const http = require("node:http");
const port = Number(process.env.PORT || 3000);
http
  .createServer((_req, res) => {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ message: "hello from lab A", ts: new Date().toISOString() }));
  })
  .listen(port, "0.0.0.0", () => console.log("listen", port));
