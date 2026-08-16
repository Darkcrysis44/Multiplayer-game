export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/ws') {
      if (request.headers.get('Upgrade') !== 'websocket') return new Response('WebSocket endpoint', {status:426});
      const room = url.searchParams.get('room') || crypto.randomUUID().slice(0,6).toUpperCase();
      const id = crypto.randomUUID();
      const stub = env.GAME_ROOM.get(env.GAME_ROOM.idFromName(room));
      return stub.fetch(new Request('https://room/ws?id='+encodeURIComponent(id)+'&room='+encodeURIComponent(room)+'&name='+encodeURIComponent(url.searchParams.get('name')||'Player'), request));
    }
    return env.ASSETS.fetch(request);
  }
};

export class GameRoom {
  constructor(state) { this.state=state; this.clients=new Map(); this.players=new Map(); this.enemies=[]; this.tick=null; }
  async fetch(request) {
    const url=new URL(request.url);
    if(request.headers.get('Upgrade')!=='websocket') return new Response('room',{status:426});
    if(this.clients.size>=2) return new Response('Room full',{status:409});
    const pair=new WebSocketPair(); const [client,server]=Object.values(pair); server.accept();
    const id=url.searchParams.get('id'); const name=(url.searchParams.get('name')||'Player').slice(0,16);
    this.clients.set(id,server); this.players.set(id,{id,name,x:300+this.clients.size*100,y:300,hp:100});
    if(!this.enemies.length) this.enemies=[{id:1,x:600,y:300,hp:100},{id:2,x:750,y:450,hp:100},{id:3,x:450,y:500,hp:100}];
    server.send(JSON.stringify({type:'welcome',id,room:url.searchParams.get('room')})); this.broadcast();
    server.addEventListener('message',e=>this.onMessage(id,e.data));
    server.addEventListener('close',()=>{this.clients.delete(id);this.players.delete(id);this.broadcast();});
    if(!this.tick)this.tick=setInterval(()=>this.broadcast(),100);
    return new Response(null,{status:101,webSocket:client});
  }
  onMessage(id,data){let m;try{m=JSON.parse(data)}catch{return};const p=this.players.get(id);if(!p)return;
    if(m.type==='move'){p.x=Math.max(20,Math.min(1180,Number(m.x)||p.x));p.y=Math.max(80,Math.min(680,Number(m.y)||p.y));}
    if(m.type==='attack'){const e=this.enemies.find(e=>Math.hypot(e.x-p.x,e.y-p.y)<90);if(e)e.hp-=25;if(e&&e.hp<=0)this.enemies=this.enemies.filter(x=>x.id!==e.id);}
  }
  broadcast(){const players=Object.fromEntries(this.players);const enemies=this.enemies;for(const ws of this.clients.values())try{ws.send(JSON.stringify({type:'state',players,enemies}))}catch{}}
}
