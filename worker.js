export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/ws") {
      if (request.headers.get("Upgrade") !== "websocket") {
        return new Response("WebSocket endpoint", { status: 426 });
      }
      const room = (url.searchParams.get("room") || "LOVE").toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 24) || "LOVE";
      const id = env.ROOM.idFromName(room);
      const stub = env.ROOM.get(id);
      return stub.fetch(request);
    }
    return env.ASSETS.fetch(request);
  }
};

export class Room {
  constructor(state) {
    this.state = state;
    this.sockets = new Map();
    this.names = new Map();
  }

  async fetch(request) {
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Room online", { status: 200 });
    }
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    server.accept();
    const id = crypto.randomUUID();
    this.sockets.set(id, server);
    this.names.set(id, "Player");

    server.send(JSON.stringify({ type: "welcome", id }));
    this.broadcast({ type: "players", players: [...this.sockets.keys()].map(x => ({ id:x, name:this.names.get(x) || "Player" })) });

    server.addEventListener("message", event => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "join") {
          this.names.set(id, String(msg.name || "Player").slice(0, 20));
          this.broadcast({ type:"players", players:[...this.sockets.keys()].map(x=>({id:x,name:this.names.get(x)||"Player"})) });
        } else {
          this.broadcast({ ...msg, from:id });
        }
      } catch {}
    });

    const cleanup = () => {
      this.sockets.delete(id);
      this.names.delete(id);
      this.broadcast({ type:"players", players:[...this.sockets.keys()].map(x=>({id:x,name:this.names.get(x)||"Player"})) });
    };
    server.addEventListener("close", cleanup);
    server.addEventListener("error", cleanup);
    return new Response(null, { status: 101, webSocket: client });
  }

  broadcast(msg) {
    const data = JSON.stringify(msg);
    for (const [id, ws] of this.sockets) {
      try { ws.send(data); } catch { this.sockets.delete(id); this.names.delete(id); }
    }
  }
}
