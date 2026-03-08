# RAVIVE - Revive Your Life

RAVIVE is a life RPG app where real-world habits convert into XP, levels, streaks, and achievements.

## Tech
- Mobile + Web: Expo React Native + NativeWind + Redux Toolkit + React Navigation + Victory Charts
- Backend: Node.js + Express + PostgreSQL + JWT + OAuth-ready
- AI: OpenAI API integration for an in-app coach

## Folder Structure
```text
ravive/
  apps/
    backend/
      db/schema.sql
      migrations/
      src/
        config/
        controllers/
        data/
        middleware/
        routes/
        services/
        utils/
    mobile/
      App.js
      src/
        api/
        components/
        navigation/
        screens/
        store/
        theme/
        utils/
```

## Quick Start
1. Create PostgreSQL database (example: `ravive`).
2. Copy env files:
   - `cp apps/backend/.env.example apps/backend/.env`
   - `cp apps/mobile/.env.example apps/mobile/.env`
3. Install dependencies:
   - `npm install`
4. Run migrations + seed:
   - `npm run migrate -w apps/backend`
   - `npm run seed -w apps/backend`
5. Start app (backend + mobile/web):
   - `npm start`

## This Machine Setup
- Local Node runtime has been placed in `.tools/node`.
- Local PostgreSQL 16 binaries are in `.tools/postgres16`.
- Convenience starter:
  - `./dev.sh`
  - This script now auto-cleans stale Expo/API processes and ports before starting.

## Run Without Mac (Always-On, Free)
To run independently from your Mac, deploy backend + DB to a free cloud VM.

Deployment files added:
- `apps/backend/Dockerfile`
- `deploy/docker-compose.yml`
- `deploy/README.md`
- `render.yaml` (Render free backend)
- `FREE_DEPLOY_STEPS.md` (Neon + Render + EAS easiest path)

Recommended: Oracle Cloud Always Free VM (24x7 in free limits).
After deploy, set mobile API URL to your VM IP:
- `EXPO_PUBLIC_API_URL=http://<VM_PUBLIC_IP>:4000/api`

## Default URLs
- Backend API: `http://localhost:4000/api`
- Expo: launched by Expo CLI for iOS/Android/Web

## API Endpoints
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/google` and `GET /api/auth/google/callback`
- `GET /api/dashboard`
- `GET /api/nutrition/foods`
- `POST /api/nutrition/meals`
- `GET /api/nutrition/daily`
- `GET /api/exercises`
- `POST /api/exercises/workouts`
- `POST /api/trackers/habits`
- `POST /api/trackers/mood`
- `POST /api/trackers/reading`
- `POST /api/trackers/sleep`
- `POST /api/trackers/negative`
- `GET /api/profile`
- `PUT /api/profile`
- `GET /api/analytics`
- `GET /api/achievements`
- `GET /api/ai/coach`

## Demo Login
After seeding:
- Email: `demo@ravive.app`
- Password: `Demo@123`

Buddy demo account:
- Email: `buddy@ravive.app`
- Password: `Demo@123`

## Game Loop
- Positive actions => XP gain
- Negative actions => XP loss + recovery mission suggestions
- Stats: Health, Strength, Focus, Discipline, Knowledge
- Levels: Beginner -> Active -> Disciplined -> Elite -> Master

## Included Example Data
- Indian food database with macros and micronutrient fields for:
  Roti, Dal, Rajma, Chole, Paneer, Rice, Poha, Upma, Idli, Dosa, Sambar, Khichdi, Paratha, Sabzi.
- Street foods:
  Samosa, Kachori, Jalebi, Pani Puri, Bhel Puri.
- Exercise library:
  Strength (Pushups, Squats, Deadlifts, Pullups, Bench Press, Lunges, Planks),
  Yoga (Surya Namaskar, Bhujangasana, Padmasana, Trikonasana, Tadasana),
  Cardio (Running, Cycling, Swimming, Skipping, Walking).

## Free Friend Competition (Zero Fees)
- Fully self-hosted on your existing Express + PostgreSQL stack.
- No paid APIs or subscriptions required.
- Features included:
  - Friend code connect (`Social Arena` screen)
  - Incoming friend requests (accept/reject)
  - Weekly leaderboard among friends
  - 7-day XP challenges (create/join)

## Import Meals from Excel (INDB.xlsx)
You can import Indian nutrition data directly from your spreadsheet:

```bash
npm run import:foods -w apps/backend -- /Users/ravisingh/Downloads/INDB.xlsx
```

This upserts meal records into `food_items` and is now used by in-app nutrition search.
