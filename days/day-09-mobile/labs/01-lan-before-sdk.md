# Lab: prove the phone can reach the PC (no SDK yet)

Do this **before** Expo or Flutter. If this fails, the native app will fail too.

1. `make up` from Ubuntu at the repo root. Wait until `curl -sS http://localhost:3080/api/hello` returns JSON on the PC.
2. Find the PC LAN IPv4 (`Get-NetIPAddress` — Day 9 README). Not `127.0.0.1`.
3. Allow inbound TCP on `NGINX_HTTP_PORT` (default **3080**) for the **Private** Windows profile.
4. On the **phone browser** (same Wi‑Fi, not guest/client-isolation): open `http://<LAN-IP>:3080/api/hello`.

**Pass:** JSON on the phone.  
**Fail:** PC browser works, phone does not → firewall, Public Wi‑Fi profile, wrong IP, or AP isolation — not a Flutter/React Native bug.
