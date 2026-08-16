export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/ws") {
      if (request.headers.get("Upgrade") !== "websocket") return new Response("WebSocket endpoint", { status: 426 });
      const room = (url.searchParams.get("room") || "LOVE").toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 24) || "LOVE";
      return env.ROOM.get(env.ROOM.idFromName(room)).fetch(request);
    }
    return env.ASSETS.fetch(request);
  }
};

export class Room {
  constructor(state) {
    this.state = state;
    this.sockets = new Map();
    this.names = new Map();
    this.started = false;
    this.upgradeOffer = null;
    this.upgradePicks = new Set();
  }
  async fetch(request) {
    if (request.headers.get("Upgrade") !== "websocket") return new Response("Room online");
    const pair = new WebSocketPair(), [client, server] = Object.values(pair);
    server.accept();
    const id = crypto.randomUUID();
    this.sockets.set(id, server);
    this.names.set(id, "Player");
    server.send(JSON.stringify({type:"welcome",id,started:this.started,serverNow:Date.now()}));
    this.broadcastPlayers();
    server.addEventListener("message", event => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "join") {
          this.names.set(id, String(msg.name || "Player").slice(0,20));
          this.broadcastPlayers();
          return;
        }
        if (msg.type === "start") {
          // First connected player is the host in the client UI. The server simply schedules a shared start.
          if (!this.sockets.has(id)) return;
          const startAt = Date.now() + 2500;
          this.started = true;
          this.upgradeOffer = null;
          this.upgradePicks.clear();
          this.broadcast({type:"gameStart",from:id,startAt});
          return;
        }
        if (msg.type === "upgradeOffer") {
          this.upgradeOffer = { id: msg.offerId, choices: msg.choices || [] };
          this.upgradePicks.clear();
          this.broadcast({type:"upgradeOffer",from:id,offerId:this.upgradeOffer.id,choices:this.upgradeOffer.choices});
          this.broadcast({type:"upgradeProgress",picked:0,total:this.sockets.size});
          return;
        }
        if (msg.type === "upgradePick") {
          if (!this.upgradeOffer || msg.offerId !== this.upgradeOffer.id) return;
          this.upgradePicks.add(id);
          this.broadcast({type:"upgradeProgress",picked:this.upgradePicks.size,total:this.sockets.size});
          if (this.upgradePicks.size >= this.sockets.size && this.sockets.size > 0) {
            this.started = true;
            this.broadcast({type:"upgradeReady",wave:msg.wave || undefined});
            // The clients already know the current wave; their UI advances it locally.
            this.upgradeOffer = null;
            this.upgradePicks.clear();
          }
          return;
        }
        if (msg.type === "stop") {
          this.started = false;
          this.upgradeOffer = null;
          this.upgradePicks.clear();
          this.broadcast({type:"gameStop",from:id});
          return;
        }
        // All gameplay messages are relayed to every other client. The host remains authoritative for enemy state.
        this.broadcast({...msg,from:id});
      } catch {}
    });
    const cleanup = () => {
      this.sockets.delete(id);
      this.names.delete(id);
      this.upgradePicks.delete(id);
      if (this.sockets.size === 0) {
        this.started = false;
        this.upgradeOffer = null;
        this.upgradePicks.clear();
      } else if (this.upgradeOffer) {
        this.broadcast({type:"upgradeProgress",picked:this.upgradePicks.size,total:this.sockets.size});
        if (this.upgradePicks.size >= this.sockets.size) {
          this.broadcast({type:"upgradeReady"});
          this.upgradeOffer = null;
          this.upgradePicks.clear();
        }
      }
      this.broadcastPlayers();
    };
    server.addEventListener("close", cleanup);
    server.addEventListener("error", cleanup);
    return new Response(null,{status:101,webSocket:client});
  }
  broadcastPlayers(){
    this.broadcast({type:"players",players:[...this.sockets.keys()].map(id=>({id,name:this.names.get(id)||"Player"}))});
  }
  broadcast(msg){
    const data=JSON.stringify(msg);
    for(const [id,ws] of this.sockets){
      try{ws.send(data)}catch{this.sockets.delete(id);this.names.delete(id);this.upgradePicks.delete(id)}
    }
  }
}
