const ROOM_RE = /^[A-Z0-9]{4,8}$/;
const MAX_PLAYERS = 2;
const ARENA = { w: 1200, h: 700 };

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/ws") {
      if (request.headers.get("Upgrade") !== "websocket") {
        return new Response("WebSocket endpoint", { status: 426 });
      }
      let room = (url.searchParams.get("room") || "").toUpperCase();
      if (!ROOM_RE.test(room)) room = randomRoom();
      const id = env.ROOM.idFromName(room);
      const stub = env.ROOM.get(id);
      return stub.fetch(new Request(`https://room.internal/ws?room=${room}`, request));
    }
    if (url.pathname === "/health") return Response.json({ ok: true, service: "love-sword-arena-coop" });
    return env.ASSETS.fetch(request);
  }
};

function randomRoom(){
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s=""; for(let i=0;i<6;i++) s += chars[Math.floor(Math.random()*chars.length)];
  return s;
}

export class GameRoom {
  constructor(state) {
    this.state = state;
    this.clients = new Map();
    this.players = new Map();
    this.enemies = [];
    this.wave = 1;
    this.nextEnemyId = 1;
    this.lastTick = Date.now();
    this.started = false;
    this.tickTimer = null;
  }

  async fetch(request) {
    const url = new URL(request.url);
    if (request.headers.get("Upgrade") !== "websocket") return new Response("Expected WebSocket", {status:426});
    const room = url.searchParams.get("room") || "ROOM";
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    server.accept();
    const id = crypto.randomUUID().slice(0,8);
    this.clients.set(id, server);
    server._id = id;
    server._room = room;
    server.addEventListener("message", e => this.onMessage(server, e));
    server.addEventListener("close", () => this.onClose(server));
    server.addEventListener("error", () => this.onClose(server));
    this.ensureTick();
    return new Response(null, {status:101, webSocket:client});
  }

  ensureTick(){
    if(this.tickTimer) return;
    this.tickTimer = setInterval(()=>this.tick(),50);
  }

  onMessage(ws, e){
    let m; try{m=JSON.parse(e.data)}catch{return}
    const id=ws._id;
    if(m.type === "join"){
      if(this.players.size >= MAX_PLAYERS && !this.players.has(id)) return this.send(ws,{type:"error",message:"Room is full (2/2)."});
      const name=String(m.name||"Player").replace(/[^a-zA-Z0-9 _.-]/g,"").slice(0,16)||"Player";
      this.players.set(id,{id,name,x:this.players.size?900:300,y:350,hp:100,maxHp:100,keys:{},attackCooldown:0,alive:true});
      if(!this.enemies.length) this.spawnWave();
      this.send(ws,{type:"welcome",id,room:ws._room});
      this.broadcast({type:"snapshot",...this.snapshot()});
    } else if(m.type === "input"){
      const p=this.players.get(id); if(p) p.keys={up:!!m.keys?.up,down:!!m.keys?.down,left:!!m.keys?.left,right:!!m.keys?.right};
    } else if(m.type === "attack"){
      const p=this.players.get(id); if(!p||!p.alive||p.attackCooldown>0)return;
      const a=Number(m.angle)||0; p.attackCooldown=.35;
      for(const e of this.enemies){const dx=e.x-p.x,dy=e.y-p.y,d=Math.hypot(dx,dy);if(d<125){const dot=(dx*Math.cos(a)+dy*Math.sin(a))/Math.max(d,1);if(dot>.35){e.hp-=25;e.hit=.12;}}}
    } else if(m.type === "leave") this.closePlayer(id);
  }

  tick(){
    const now=Date.now(),dt=Math.min(.1,(now-this.lastTick)/1000);this.lastTick=now;
    for(const p of this.players.values()){
      if(!p.alive) continue;
      const sp=220; let dx=(p.keys.right?1:0)-(p.keys.left?1:0),dy=(p.keys.down?1:0)-(p.keys.up?1:0);const l=Math.hypot(dx,dy)||1;
      p.x=Math.max(25,Math.min(ARENA.w-25,p.x+dx/l*sp*dt));p.y=Math.max(25,Math.min(ARENA.h-25,p.y+dy/l*sp*dt));p.attackCooldown=Math.max(0,p.attackCooldown-dt);
    }
    for(const e of this.enemies){
      e.hit=Math.max(0,e.hit-dt);
      let target=null,best=1e9;for(const p of this.players.values()){if(!p.alive)continue;const d=Math.hypot(p.x-e.x,p.y-e.y);if(d<best){best=d;target=p}}
      if(target){const dx=target.x-e.x,dy=target.y-e.y,d=Math.hypot(dx,dy)||1;if(d>35){e.x+=dx/d*e.speed*dt;e.y+=dy/d*e.speed*dt}else{e.attack-=dt;if(e.attack<=0){target.hp=Math.max(0,target.hp-e.damage);e.attack=.8;if(target.hp<=0)target.alive=false}}}
    }
    this.enemies=this.enemies.filter(e=>e.hp>0);
    if(this.enemies.length===0 && this.players.size){this.wave++;this.spawnWave()}
    this.broadcast({type:"snapshot",...this.snapshot()});
  }

  spawnWave(){
    const count=Math.min(18,3+this.wave*2);
    for(let i=0;i<count;i++){const side=i%4;let x=side===0?50:side===1?ARENA.w-50:Math.random()*ARENA.w;let y=side===2?50:side===3?ARENA.h-50:Math.random()*ARENA.h;this.enemies.push({id:this.nextEnemyId++,x,y,hp:45+this.wave*8,maxHp:45+this.wave*8,speed:55+this.wave*2,damage:6+this.wave,attack:.5,hit:0});}
  }

  snapshot(){return {players:[...this.players.values()].map(p=>({id:p.id,name:p.name,x:p.x,y:p.y,hp:p.hp,maxHp:p.maxHp,alive:p.alive})),enemies:this.enemies.map(e=>({id:e.id,x:e.x,y:e.y,hp:e.hp,maxHp:e.maxHp,hit:e.hit})),wave:this.wave,arena:ARENA};}
  send(ws,m){try{ws.send(JSON.stringify(m))}catch{}}
  broadcast(m){const s=JSON.stringify(m);for(const ws of this.clients.values()){try{ws.send(s)}catch{}}}
  onClose(ws){this.closePlayer(ws._id)}
  closePlayer(id){this.clients.delete(id);this.players.delete(id);this.broadcast({type:"peer-left"});this.broadcast({type:"snapshot",...this.snapshot()});}
}
