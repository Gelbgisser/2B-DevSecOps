# STRIDE for Secure Demo (short lab)

Work in pairs. 25–40 minutes. App: `apps/secure-demo`.

Draw one data-flow: **Browser → NGINX → web/API → Postgres/Redis/files → ClamAV**.

For each STRIDE category, write **one** realistic abuse and **one** control you already have or will add by Day 8.

| STRIDE | Example question |
|--------|------------------|
| Spoofing | If I set `X-Demo-User: admin`, what should still fail? |
| Tampering | Can I change another user’s upload id in the URL? |
| Repudiation | Do logs include `requestId` end-to-end? |
| Information disclosure | Is Postgres on a host port? Can I read `/data` from another container user? |
| Denial of service | What does `limit_req` do? What if ClamAV is down? |
| Elevation of privilege | Does WAF DetectionOnly grant access? Does CLEAN grant cross-tenant download? |

**Rule:** controls must map to a file in this repo (header, probe, PVC, scanner, RBAC). “We will use Keycloak later” is a stretch note, not a control you deployed.

Share one finding with the class. Optional: add a ticket-style exception in `security/policies/exceptions.md` (fake CVE) to practice the process.
