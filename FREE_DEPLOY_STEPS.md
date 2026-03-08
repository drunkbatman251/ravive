# Ravive Free Deployment (No Mac Always-On)

This is the easiest low-cost flow for your current project.

## Important truth (iPhone)
- A permanent App Store `.ipa` distribution requires Apple Developer Program (paid).
- Fully free option for iPhone users is:
  - Backend on free cloud
  - Use Expo Go during development OR web/PWA link.

## What is already prepared
- Render blueprint: `render.yaml`
- EAS config: `eas.json`
- Mobile production env template: `apps/mobile/.env.production.example`

## 1) Create free Neon database
1. Sign up at https://neon.tech/
2. Create project `ravive-db`
3. Copy the connection string (this is `DATABASE_URL`).

## 2) Deploy backend free on Render
1. Push this repo to GitHub.
2. Sign up at https://render.com/
3. New -> Blueprint
4. Select your GitHub repo.
5. Render will detect `render.yaml` and create `ravive-api`.
6. In Render service env vars, set:
   - `DATABASE_URL` = Neon connection string
   - `JWT_SECRET` = any long random string
   - `FRONTEND_URL` = `https://expo.dev`
7. Deploy.
8. Open:
   - `https://YOUR_RENDER_URL/health`
   - Should return: `{ "status": "ok", "app": "RAVIVE API" }`

## 3) Run DB schema + seed once
Use any PostgreSQL client (or local terminal with `psql`).

### Option A: psql
```bash
psql "YOUR_NEON_DATABASE_URL" -f apps/backend/db/schema.sql
```
Then run seed from local once:
```bash
cd apps/backend
DATABASE_URL="YOUR_NEON_DATABASE_URL" npm install
DATABASE_URL="YOUR_NEON_DATABASE_URL" npm run seed
```

## 4) Point mobile app to cloud backend
Update:
- `apps/mobile/.env`
```env
EXPO_PUBLIC_API_URL=https://YOUR_RENDER_URL/api
```

Restart Expo:
```bash
cd apps/mobile
npx expo start --tunnel
```

Now your friend in another city can use same QR/link while your Expo is running.

## 5) Truly independent app without your Mac running (free-ish constraints)
- Backend is now independent (Render + Neon).
- Frontend still needs one of:
  1. Expo Go session for development
  2. Web/PWA hosting (free static host) for always-on use

## 6) Optional EAS setup (prepared)
Login and initialize:
```bash
npx eas login
npx eas build:configure
```

Build profiles are already in `eas.json`.
