# Nicoleta Love — new multiplayer server

This package starts a separate Node.js HTTP + WebSocket server. The game is served by the same process.

## Render
- Runtime: Node
- Build: `npm install`
- Start: `npm start`
- WebSocket endpoint: `/ws`
- Health check: `/health`

## Persistent saves
Set `DATABASE_URL` to a PostgreSQL connection string. The server creates `player_saves` automatically.

For a free database with no fixed expiration, Neon Free currently advertises $0, no time limit, and 0.5 GB storage per project. Render's own free Postgres expires after 30 days, so it should NOT be used for permanent player saves.

Without `DATABASE_URL`, local development falls back to `data/players.json`. On Render Free that local file is ephemeral, so configure `DATABASE_URL` before relying on saves.
