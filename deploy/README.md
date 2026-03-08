# Ravive Zero-Fee Always-On Setup

Goal: run backend + DB on a free cloud VM, so your iPhone and your friend's iPhone work without your Mac running.

## Best free option
Use **Oracle Cloud Always Free VM** (ARM).
It can run 24x7 with zero fee if you stay in free limits.

## One-time setup on VM
1. Install Docker + Docker Compose plugin.
2. Copy `ravive/deploy` folder and `ravive/apps/backend` to the VM.
3. Start services:
   ```bash
   cd deploy
   docker compose up -d --build
   ```
4. Run migrations + seed:
   ```bash
   docker exec -it ravive_api npm run migrate
   docker exec -it ravive_api npm run seed
   ```
5. Open firewall/security group for TCP `4000`.

## Test backend
```bash
curl http://<VM_PUBLIC_IP>:4000/health
```

## Point mobile app to cloud backend
In `apps/mobile/.env`, set:
```env
EXPO_PUBLIC_API_URL=http://<VM_PUBLIC_IP>:4000/api
```

## Use app on iPhone without Mac
1. Publish/update app bundle via Expo account (free):
   - `npx expo login`
   - `npx expo export --platform all` (or use EAS Update free tier)
2. Open app in Expo Go on both phones.
3. Login and use Social tab.

## Notes
- If you want HTTPS + custom domain for free, use Cloudflare Tunnel + Cloudflare DNS (free plan).
- For full App Store install without Expo Go, Apple Developer Program is paid; avoid that to stay zero-fee.
