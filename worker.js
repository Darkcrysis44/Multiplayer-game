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
  constructor(state) { this.state=state; this.sockets=new Map(); this.names=new Map(); this.started=false; }
  async fetch(request) {
    if (request.headers.get("Upgrade") !== "websocket") return new Response("Room online");
    const pair=new WebSocketPair(), [client,server]=Object.values(pair); server.accept();
    const id=crypto.randomUUID(); this.sockets.set(id,server); this.names.set(id,"Player");
    server.send(JSON.stringify({type:"welcome",id,started:this.started,serverNow:Date.now()}));
    this.broadcastPlayers();
    server.addEventListener("message",event=>{
      try {
        const msg=JSON.parse(event.data);
        if(msg.type==="join") { this.names.set(id,String(msg.name||"Player").slice(0,20)); this.broadcastPlayers(); return; }
        if(msg.type==="start") {
          if(!this.sockets.has(id)) return;
          // Future timestamp gives every client enough time to receive the command and start on the same server clock.
          const startAt=Date.now()+2500; this.started=true; this.broadcast({type:"gameStart",from:id,startAt}); return;
        }
        if(msg.type==="stop") { this.started=false; this.broadcast({type:"gameStop",from:id}); return; }
        this.broadcast({...msg,from:id});
      } catch {}
    });
    const cleanup=()=>{this.sockets.delete(id);this.names.delete(id);if(this.sockets.size===0)this.started=false;this.broadcastPlayers()};
    server.addEventListener("close",cleanup); server.addEventListener("error",cleanup);
    return new Response(null,{status:101,webSocket:client});
  }
  broadcastPlayers(){this.broadcast({type:"players",players:[...this.sockets.keys()].map(id=>({id,name:this.names.get(id)||"Player"}))});}
  broadcast(msg){const data=JSON.stringify(msg);for(const [id,ws] of this.sockets){try{ws.send(data)}catch{this.sockets.delete(id);this.names.delete(id)}}}
}
