# @tfit/mobile

Expo React Native app for TFIT (iOS/Android). See the repo root [`README.md`](../../README.md) and [`docs/`](../../docs) for architecture and design system decisions.

## Run locally

```bash
cp .env.example .env.local   # fill in Clerk publishable key + backend API URL
npx expo start
```

Requires `apps/backend` running (or deployed) and reachable from your device/simulator — `localhost` won't resolve from a physical device, use your machine's LAN IP or the deployed Vercel URL.
