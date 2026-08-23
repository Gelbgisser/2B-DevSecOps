# Day 9 — Mobile clients (Flutter & React Native)

**Timebox:** ~6 hours (half-day workshop after the capstone is fine)  
**Where:** Windows laptop + **physical phone on the same Wi‑Fi**  
**Prerequisites:** Day 2 stack running (`make up`). Git on **your fork**. Cursor for edits.

> **Start here (15 minutes):** `make up` → firewall rule below → phone browser `http://<PC-LAN-IP>:3080/api/hello` → JSON. If that fails, skip Expo/Flutter and fix the network first ([lab sheet](labs/01-lan-before-sdk.md)).

## What this day is about

A store app is **not** the API. Google Play and the App Store ship a **binary**. The binary talks to **your** backend over HTTPS. Today you wire a phone to the Secure Demo API the same way production will: **a URL the phone can actually route to**.

`http://localhost:3080` on the phone means “the phone itself” — it never reaches Docker on your PC.

```text
Lab (same Wi‑Fi)
  Phone  ──HTTP──►  http://192.168.x.x:3080  (Windows LAN IP, NGINX edge)
                      └─ /api/hello → api container

Production
  Phone  ──HTTPS─►  https://api.yourcompany.com  (Ingress / API gateway / TLS)
                      └─ same /api/hello, PVC or RDS in the cluster
```

You pick **one** client stack in class (Expo is fastest on Windows). The other is there so you can talk to either mobile team at work.

## Learning objectives

- Explain why **localhost is wrong** on a device
- Hit the class API from a phone via **LAN IP + published edge port**
- Allow **cleartext HTTP** for lab only (Android / iOS)
- Contrast **Expo / React Native** vs **Flutter**
- Map lab traffic to **Play Store / App Store** + real Kubernetes (signing, secrets, TLS, review)

## Agenda

| Block | Minutes | What |
|------:|--------:|------|
| 0 | 30 | Origin rule + Windows firewall |
| 1 | 40 | Prove the API from another device (phone browser) |
| 2 | 90 | React Native (Expo Go) |
| 3 | 90 | Flutter (optional if you already did Expo well) |
| 4 | 50 | Stores, CI, Kubernetes, secrets |
| Debug | 20 | Phone cannot connect |
| Self-check | 15 | |

---

## Dependencies (install only what you will demo)

You do **not** need both toolchains. **Expo Go** is enough for the learning objective.

### Always (every learner)

| Piece | Version / notes |
|-------|-----------------|
| Day 2 Compose | `make up`, edge on **3080** (or `NGINX_HTTP_PORT` in `.env`) |
| Same Wi‑Fi | Phone and PC. Guest / “client isolation” APs often **block** phone→PC |
| Windows Firewall | Inbound TCP on that port, profile **Private** |
| Phone browser | Chrome / Safari — used before any SDK |

```powershell
# PowerShell as Administrator. Change 3080 if NGINX_HTTP_PORT changed.
New-NetFirewallRule -DisplayName "Secure Demo edge (lab)" -Direction Inbound -Protocol TCP -LocalPort 3080 -Action Allow -Profile Private
```

Find the PC LAN IPv4 (PowerShell):

```powershell
Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.PrefixOrigin -ne "WellKnown" } | Format-Table IPAddress, InterfaceAlias
```

Use `192.168.*` or `10.*`, **not** `127.0.0.1`.

```bash
# Ubuntu, repo root — replace with YOUR IP
export LAN_URL=http://192.168.1.42:3080
curl -sS "$LAN_URL/api/hello"
```

Expected: JSON (`message`, `requestId`). If this fails using the LAN IP from Ubuntu, the phone will fail too.

### React Native — Expo Go (recommended on Windows)

| Piece | Why |
|-------|-----|
| Node.js **20+** | Same as the API. Check: `node -v` |
| npm | Comes with Node |
| [Expo Go](https://expo.dev/go) on the phone | Runs the JS bundle; **no** Android Studio required |
| This sample | [`apps/mobile-demo/expo`](../../apps/mobile-demo/expo) — Expo SDK **~52** (install the Expo Go version that matches SDK 52) |

```bash
cd apps/mobile-demo/expo
npm install
npx expo start
```

Scan the QR code with Expo Go (Android) or Camera (iOS, same Wi‑Fi). In the app, set **API base URL** to `http://192.168.1.42:3080` and tap **Hello**.

`app.json` allows **cleartext HTTP** for lab. Store builds must use **HTTPS** and drop that exception.

`npx expo start --tunnel` only tunnels the **JS bundle**. The API URL must still be a host the phone can route to (LAN IP or a Cloudflare Tunnel hostname from Day 7).

### Flutter (optional second stack)

| Piece | Why |
|-------|-----|
| [Flutter SDK](https://docs.flutter.dev/get-started/install/windows) | `flutter doctor` |
| JDK **17** | Android builds |
| Android Studio | SDK, emulator, USB drivers |
| This sample | [`apps/mobile-demo/flutter`](../../apps/mobile-demo/flutter) — Dart 3.5+, `http` package in `pubspec.yaml` |

```powershell
flutter --version
cd apps/mobile-demo/flutter
flutter create --project-name secure_demo_mobile --org lab.secure .
git checkout -- lib/main.dart   # create may overwrite the lab UI
flutter pub get
flutter run --dart-define=API_BASE=http://192.168.1.42:3080
```

Enable cleartext on Android as in the Flutter README. iOS lab: ATS local-network exception (Mac only).

### Device vs emulator

| Client | API base URL |
|--------|----------------|
| Physical phone | `http://<PC-LAN-IPv4>:3080` |
| Android emulator (on this PC) | `http://10.0.2.2:3080` (alias for the **host** loopback) |
| iOS Simulator (Mac only) | `http://127.0.0.1:3080` often works (shares the Mac network) |
| Phone on **cellular** | RFC1918 LAN IPs will not route — same Wi‑Fi, or HTTPS tunnel |

### iOS physical device / App Store (honest limits)

Shipping iOS needs a **Mac**, **Xcode**, and an **Apple Developer** membership. On a Windows class you can still use **Expo Go on an iPhone** for the LAN lab and talk through TestFlight (Lab 4). Do not pretend `flutter build ipa` works here.

---

## Lab 0 — mental model (10 minutes)

| Client | What `localhost` means |
|--------|-------------------------|
| Browser on the PC | Your PC — `http://localhost:3080` works |
| Browser **on the phone** | The **phone** — does not reach Docker |
| Flutter / React Native | Same as the phone: pass a **reachable** base URL |

CORS: **native** HTTP clients ignore CORS. CORS only matters for a **web view** or Expo **web**. Native Day 9 does not need `Access-Control-Allow-Origin`.

The public-origin rule from Day 2 still applies: the URL in the app must match TLS and OIDC later (`https://api.example.com`, no invented `:80`).

---

## Lab 1 — phone browser before any SDK

Follow [`labs/01-lan-before-sdk.md`](labs/01-lan-before-sdk.md).

**Pass:** JSON on the phone. If shop HTML loads but `/api/hello` fails, you are not going through the edge or the IP is wrong.

Windows **Public** Wi‑Fi profile often blocks inbound. Set the network to **Private**.

---

## Lab 2 — Expo (React Native)

Follow [`apps/mobile-demo/expo/README.md`](../../apps/mobile-demo/expo/README.md).

You should see `message` from `/api/hello` and `requestId` on screen.

**Security habit:** the API URL is **configuration**, not a secret. **Tokens** must not be hardcoded in the JS bundle (anyone can unpack an APK). Lab uses no user token; production uses OIDC / Play Integrity / App Attest / short-lived tokens from **your** backend.

---

## Lab 3 — Flutter

Follow [`apps/mobile-demo/flutter/README.md`](../../apps/mobile-demo/flutter/README.md).

Same API, same LAN URL, different toolchain. Teams pick one for product; class shows both so you can talk to either mobile guild.

---

## Lab 4 — Real stores and real clusters (discussion + checklist)

You will not publish to the stores in class. You **will** leave with a checklist.

### What the store actually hosts

| Artifact | Who ships it | Contains |
|----------|----------------|----------|
| APK / AAB (Play) | You, via Play Console | Flutter/RN **client** |
| IPA (App Store) | You, via App Store Connect + Mac | Same |
| API + Postgres + PVC (or RDS) | You, via k8s/Helm/GitOps | **Not** inside the store binary |

Updating the API (Helm / Argo) does **not** need a store review. Changing UI in the binary **does**. That is why the API URL should be **build-time config** or **remote config**, not a hardcoded IP.

### TLS and hostname

| Lab | Production |
|-----|------------|
| `http://192.168.x.x:3080` | `https://api.example.com` (Ingress TLS, cert-manager, or cloud cert) |
| Cleartext in `app.json` / ATS exceptions | **Rejected** on review if you ship cleartext to the internet |
| Windows Firewall | Security groups / NSG: **443** only to the load balancer |

Day 7 Cloudflare Tunnel can expose the lab API with HTTPS for a **remote** phone. The app’s base URL must be that `https://….trycloudflare.com` (or your hostname). Same `APP_URL` rule as OIDC.

Deep links / Universal Links / App Links also need that **HTTPS origin** — another reason not to invent `:80`.

### Secrets and API keys

- Maps / Firebase / revenue SDKs: restrict by bundle ID / SHA-1 in the **vendor console**; still treat them as leakable.
- Backend URLs: `--dart-define` / Expo `extra` / Firebase Remote Config — **different values per environment**.
- Never put Vault tokens or DB passwords in the mobile app.
- Optional hardening at work: Play Integrity / App Check so the API can tell “our signed app” from a random script. That check lives **on the server**.

### Kubernetes mapping

Same Helm chart as Day 4. Mobile does not talk to `ClusterIP` names like `api:3001`. It talks to **Ingress host**. Set:

```text
APP_URL=https://api.example.com
```

in the API (OIDC, links) **and** in the mobile build. Mismatch = login loops (same bug as Keycloak `:80`).

Uploads: `POST /api/upload` through the edge; ClamAV still runs **server-side** (Day 7). Do not “scan on device” as your only malware control.

Data: the store binary has **no** Postgres. PVCs / RDS live in the cluster or the cloud account. See [`docs/02-lab-to-cloud.md`](../../docs/02-lab-to-cloud.md).

### Play Console / App Store Connect (high level)

**Google Play**

1. Developer account (one-time fee).
2. Play App Signing (Google holds the app-signing key after enroll; you keep an upload key).
3. Upload **AAB**, privacy questionnaire, Data safety form.
4. Internal testing track → production.
5. Backend can already be live on k8s before the listing is approved.

**Apple**

1. Apple Developer Program.
2. Certificates + provisioning (Xcode manages much of this).
3. Archive → upload → TestFlight → App Review.
4. ATS: HTTPS required except documented exceptions (lab only).

**CI split (best practice):**

| Pipeline | Builds | Secrets |
|----------|--------|---------|
| Jenkins (Day 5) | API image | Registry, Vault |
| GitHub Actions / Codemagic / Bitrise + Fastlane | AAB / IPA | Store API keys, keystores — **not** in the API Jenkinsfile |

---

## Debug challenge

The Expo app on the phone spins then errors `Network request failed`. PC browser `http://localhost:3080/api/hello` works.

List **three** distinct causes (at least one “localhost vs LAN”, at least one firewall/profile, at least one cleartext/ATS).

[`solutions/README.md`](solutions/README.md)

---

## Self-check

- [ ] Phone browser shows `/api/hello` via `http://<LAN-IP>:<port>`
- [ ] I can explain why `localhost` fails on device
- [ ] Expo **or** Flutter displayed the hello JSON
- [ ] I know cleartext is a **lab** exception, not a store strategy
- [ ] I can say what lives in the store vs what lives in Kubernetes
- [ ] No API secrets committed in `apps/mobile-demo`

## Security takeaway

The phone is an **untrusted** client on a hostile network. TLS, short-lived auth, server-side validation, and ClamAV on uploads still matter. The store is a **distribution** channel, not your security boundary.
