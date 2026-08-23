const http = require("node:http");
http.createServer((_q, s) => s.end("non-root\n")).listen(3000, "0.0.0.0");
