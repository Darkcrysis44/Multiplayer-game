# Love Sword Arena — Cloudflare Online Co-op

This build keeps the existing Love Sword Arena and adds a Cloudflare Durable Object WebSocket room system.

## Deploy

1. Install Node.js.
2. In this folder run:
   npm install -g wrangler
   wrangler login
3. Deploy:
   wrangler deploy

Wrangler will create the Durable Object binding defined in wrangler.toml and serve the site from `public/`.

## How to play online

- Open the deployed site.
- Enter Love Sword Arena.
- Click `🌐 CO-OP`.
- One player clicks `Create / Host Room` and shares the room code.
- The other player enters the same code and clicks `Join Room`.
- Up to 4 players can join a room.

The host is authoritative for the arena enemy state; guests send movement/attack events and receive synchronized enemy snapshots. Player positions are shown to everyone in the room.

## Important

The original game's progression/balance remains client-side/localStorage. The online room is a live co-op session, not an account/cloud-save system.
