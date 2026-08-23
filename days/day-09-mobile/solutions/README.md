# Day 9 solutions

> Try the debug challenge first.

`Network request failed` while the PC browser works against localhost usually means **the phone never reached the PC**.

Typical trio:

1. **Wrong host:** app still uses `localhost` / `127.0.0.1` — that is the phone. Use `http://<PC-LAN-IPv4>:3080`.
2. **Firewall / Wi‑Fi:** Windows profile **Public**, or AP client isolation (guest Wi‑Fi). Allow TCP inbound on the edge port; use private LAN.
3. **Cleartext blocked:** Android 9+ / iOS ATS. Lab manifests must allow HTTP to that IP; production uses HTTPS instead.

Also: Compose published only `127.0.0.1:3080` would block LAN (we publish `0.0.0.0` via `"3080:80"`). Phone on **cellular** cannot use a RFC1918 address — same Wi‑Fi, or a tunnel with HTTPS.
