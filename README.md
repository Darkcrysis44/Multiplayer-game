# Love Sword Arena — Cloudflare Online Co-op

GitHub + Cloudflare Workers deployment.

## Co-op behavior
- Clicking **CO-OP immediately stops the solo battle**; the solo run does not continue behind the lobby.
- Host creates a room; friend joins with the same room code.
- The arena shows a **START BATTLE** overlay after connecting.
- Only the host can start.
- Cloudflare Durable Objects schedule the start ~2.5 seconds in the future using a server timestamp so clients begin on the same synchronized start time.
- The host is authoritative for enemy simulation and broadcasts enemy state; player positions and attacks are synchronized through WebSockets.

## Deploy
Cloudflare Workers Builds:
- Build command: leave blank
- Deploy command: `npx wrangler deploy`
- Root directory: `/`

The Worker name is `multiplayer-game1` to match the Cloudflare project name.
