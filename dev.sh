#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
export PATH="$ROOT/.tools/node/bin:$PATH"
export npm_config_cache="/tmp/ravive-npm-cache"
cd "$ROOT"

# Prevent common iPhone startup crashes due stale processes/ports
pkill -f "expo start" >/dev/null 2>&1 || true
pkill -f "node src/server.js" >/dev/null 2>&1 || true
pkill -f "nodemon --legacy-watch src/server.js" >/dev/null 2>&1 || true
(lsof -tiTCP:4000 -sTCP:LISTEN || true) | xargs -r kill >/dev/null 2>&1 || true
(lsof -tiTCP:8081 -sTCP:LISTEN || true) | xargs -r kill >/dev/null 2>&1 || true

echo "Starting Ravive backend (4000) and Expo (8081, cache cleared)..."
npx concurrently "npm run start -w apps/backend" "npm run start -w apps/mobile -- --port 8081 -c"
