# Expo (React Native) lab client

Talks to the class **edge** (`APP_URL` / LAN IP + port), not to `api:3001` on the Compose network.

**Need:** Node.js 20+, npm, [Expo Go](https://expo.dev/go) matching SDK 52.

## Run

```bash
cd apps/mobile-demo/expo
npm install
npx expo start
```

Install **Expo Go** on the phone. Same Wi‑Fi as the PC. Type `http://<PC-LAN-IP>:3080` in the app (see [Day 9](../../../days/day-09-mobile/README.md)).

`npx expo start --tunnel` if phone and PC cannot see each other (uses Expo’s tunnel for the **JS bundle** only — the **API URL** must still be a host the phone can route to: LAN IP or a Cloudflare Tunnel hostname).

## Lab vs store

`usesCleartextTraffic` / ATS exceptions are **lab only**. Production: `https://` only, no arbitrary loads.
