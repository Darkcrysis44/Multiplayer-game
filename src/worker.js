const ROOM_RE = /^[A-Z0-9]{6}$/;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return json({ ok: true, service: "multiplayer-game", multiplayer: true });
    }

    if (url.pathname.startsWith("/room/")) {
      const room = decodeURIComponent(url.pathname.slice("/room/".length)).toUpperCase();
      if (!ROOM_RE.test(room)) return json({ ok: false, error: "Invalid room code" }, 400);
      if (request.headers.get("Upgrade") !== "websocket") {
        return json({ ok: true, room, websocket: true });
      }
      const id = env.ROOMS.idFromName(room);
      return env.ROOMS.get(id).fetch(request);
    }

    return env.ASSETS.fetch(request);
  }
};

export class GameRoom {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
  }

  async fetch(request) {
    if (request.headers.get("Upgrade") !== "websocket") {
      return json({ ok: true, service: "game-room" });
    }

    const sockets = this.ctx.getWebSockets();
    if (sockets.length >= 2) return json({ ok: false, error: "Room is full" }, 409);

    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];
    const id = crypto.randomUUID();

    this.ctx.acceptWebSocket(server);
    server.serializeAttachment({ id, player: { x: 0, y: 0, angle: 0, hp: 100 } });

    const players = this.getPlayers();
    server.send(JSON.stringify({ type: "welcome", id, count: players.length + 1, players: Object.fromEntries(players.map(p => [p.id, p.player])) }));
    this.broadcastPlayers();

    return new Response(null, { status: 101, webSocket: client });
  }

  getPlayers() {
    return this.ctx.getWebSockets().map(ws => {
      const a = ws.deserializeAttachment() || {};
      return { id: a.id, player: a.player || { x: 0, y: 0, angle: 0, hp: 100 } };
    }).filter(p => p.id);
  }

  broadcast(message, except = null) {
    const text = typeof message === "string" ? message : JSON.stringify(message);
    for (const ws of this.ctx.getWebSockets()) {
      if (ws === except) continue;
      try { ws.send(text); } catch (_) {}
    }
  }

  broadcastPlayers() {
    const players = this.getPlayers();
    this.broadcast({
      type: "players",
      count: players.length,
      players: Object.fromEntries(players.map(p => [p.id, p.player]))
    });
  }

  webSocketMessage(ws, message) {
    let data;
    try { data = JSON.parse(message); } catch (_) { return; }
    const attachment = ws.deserializeAttachment() || {};

    if (data.type === "join") {
      this.broadcastPlayers();
      return;
    }

    if (data.type === "start") {
      if (this.ctx.getWebSockets().length < 2) {
        ws.send(JSON.stringify({ type: "error", message: "Waiting for player 2..." }));
        return;
      }
      this.broadcast({ type: "start" });
      return;
    }

    if (data.type === "state") {
      const p = data.player || {};
      const player = {
        x: Number.isFinite(p.x) ? Math.max(-1000, Math.min(5000, p.x)) : 0,
        y: Number.isFinite(p.y) ? Math.max(-1000, Math.min(5000, p.y)) : 0,
        angle: Number.isFinite(p.angle) ? p.angle : 0,
        hp: Number.isFinite(p.hp) ? Math.max(0, Math.min(100000, p.hp)) : 100
      };
      ws.serializeAttachment({ id: attachment.id, player });
      this.broadcast({ type: "state", id: attachment.id, player }, ws);
    }
  }

  webSocketClose(ws) {
    const a = ws.deserializeAttachment() || {};
    this.broadcast({ type: "leave", id: a.id });
    this.broadcastPlayers();
  }

  webSocketError(ws) {
    const a = ws.deserializeAttachment() || {};
    this.broadcast({ type: "leave", id: a.id });
    this.broadcastPlayers();
  }
}
