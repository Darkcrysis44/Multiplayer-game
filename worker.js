export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/ws") {
      if (request.headers.get("Upgrade") !== "websocket") return new Response("WebSocket endpoint", {status:426});
      const room=(url.searchParams.get("room")||"LOVE").toUpperCase().replace(/[^A-Z0-9_-]/g,"").slice(0,24)||"LOVE";
      return env.ROOM.get(env.ROOM.idFromName(room)).fetch(request);
    }
    return env.ASSETS.fetch(request);
  }
};

const MAX_PLAYERS=4, TICK=50, WIDTH=1200, HEIGHT=700;
const TYPES={broken:[.55,1,1,21,'Broken Heart','Common'],charger:[.10,.8,1.8,19,'Heart Charger','Uncommon'],duelist:[.06,1.15,1.2,22,'Heart Duelist','Uncommon'],archer:[.06,.9,.72,20,'Cupid Archer','Uncommon'],lancer:[.05,1.25,.95,24,'Rose Lancer','Uncommon'],tank:[.04,2.2,.55,27,'Grief Tank','Rare'],mage:[.03,1,.58,22,'Heart Mage','Rare'],splitter:[.03,1.5,.8,23,'Split Heart','Rare'],sentinel:[.02,1.65,.46,25,'Rose Sentinel','Rare'],guard:[.02,1.15,.62,24,'Cupid Guard','Uncommon'],mimic:[.02,1.4,.7,24,'Heart Mimic','Rare'],assassin:[.01,.72,1.65,18,'Love Assassin','Epic'],brute:[.01,2.7,.38,31,'Heart Brute','Epic'],berserker:[.01,1.35,1.3,24,'Love Berserker','Epic'],lovebreaker:[.01,2,.95,27,'Love Breaker','Epic'],witch:[.005,1.05,.5,22,'Heart Witch','Legendary']};
function clamp(v,a,b){return Math.max(a,Math.min(b,v))} function dist(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
export class Room{
  constructor(state){this.state=state;this.sockets=new Map();this.players=new Map();this.phase='lobby';this.wave=1;this.enemies=[];this.spawned=0;this.last=Date.now();this.offer=null;this.picks=new Map();this.nextEnemy=1;this.alarmSet=false}
  async fetch(request){
    if(request.headers.get('Upgrade')!=='websocket')return new Response('Room online');
    const pair=new WebSocketPair(),client=pair[0],server=pair[1];server.accept();
    const id=crypto.randomUUID();this.sockets.set(id,server);this.players.set(id,{id,name:'Player',x:WIDTH/2,y:HEIGHT/2,hp:100,maxHp:100,atk:14,spd:3.2,armor:0,crit:.08,ix:0,iy:0,angle:0,lastAttack:0});
    server.send(JSON.stringify({type:'welcome',id,serverNow:Date.now(),phase:this.phase,state:this.snapshotFor(id)}));this.broadcastPlayers();this.ensureAlarm();
    server.addEventListener('message',e=>{try{this.message(id,JSON.parse(e.data))}catch{}});
    const cleanup=()=>{this.sockets.delete(id);this.players.delete(id);this.picks.delete(id);this.broadcastPlayers();if(this.players.size===0){this.phase='lobby';this.enemies=[];this.offer=null;this.picks.clear();}};
    server.addEventListener('close',cleanup);server.addEventListener('error',cleanup);return new Response(null,{status:101,webSocket:client});
  }
  async ensureAlarm(){if(this.alarmSet)return;this.alarmSet=true;try{await this.state.storage.setAlarm(Date.now()+TICK)}catch{this.alarmSet=false}}
  async alarm(){this.alarmSet=false;this.tick();if(this.sockets.size)await this.state.storage.setAlarm(Date.now()+TICK),this.alarmSet=true}
  message(id,m){const p=this.players.get(id);if(!p)return;
    if(m.type==='join'){p.name=String(m.name||'Player').slice(0,20);this.setStats(p,m.stats);this.broadcastPlayers();return}
    if(m.type==='startRequest'){if(this.phase!=='lobby')return;this.setStats(p,m.stats);this.phase='countdown';this.enemies=[];this.spawned=0;this.wave=1;this.broadcast({type:'serverStart',startAt:Date.now()+2000});setTimeout(()=>{if(this.phase==='countdown'){this.phase='battle';this.broadcastState()}},2000);return}
    if(m.type==='input'){p.ix=clamp(Number(m.x)||0,-1,1);p.iy=clamp(Number(m.y)||0,-1,1);p.angle=Number(m.angle)||p.angle;return}
    if(m.type==='attack'&&this.phase==='battle'){this.serverAttack(p,m);return}
    if(m.type==='upgradePick'&&this.phase==='upgrade'&&this.offer&&m.offerId===this.offer.id&&!this.picks.has(id)){this.picks.set(id,String(m.choice||''));this.broadcast({type:'upgradeProgress',picked:this.picks.size,total:this.players.size});this.broadcast({type:'upgradePicked',playerId:id,choice:String(m.choice||'')});if(this.picks.size>=this.players.size){this.phase='countdown';const wave=this.wave+1;this.broadcast({type:'upgradeReady',wave,startAt:Date.now()+900});setTimeout(()=>{if(this.phase==='countdown'){this.wave=wave;this.spawned=0;this.enemies=[];this.phase='battle';this.broadcastState()}},900)}return}
  }
  setStats(p,s){if(!s)return;p.atk=clamp(Number(s.atk)||14,1,10000);p.spd=clamp(Number(s.spd)||3.2,.5,20);p.maxHp=clamp(Number(s.maxHp)||100,20,100000);p.hp=p.maxHp;p.armor=clamp(Number(s.armor)||0,0,1000);p.crit=clamp(Number(s.crit)||0,0,1)}
  spawn(){const side=Math.floor(Math.random()*4);let x,y;if(side===0){x=Math.random()*WIDTH;y=-40}else if(side===1){x=WIDTH+40;y=Math.random()*HEIGHT}else if(side===2){x=Math.random()*WIDTH;y=HEIGHT+40}else{x=-40;y=Math.random()*HEIGHT}
    let roll=Math.random(),type='broken';if(this.wave%5===0&&this.spawned===0)type='boss';else{let acc=0;for(const [k,v] of Object.entries(TYPES)){acc+=v[0];if(roll<acc){type=k;break}}}
    let mult=1+this.wave*.15,hp=(34+this.wave*15)*mult,spd=.55+this.wave*.045+Math.random()*.35,atk=7+this.wave*1.7,r=21;
    if(type==='boss'){hp*=8;spd*=.7;atk*=2.5;r=44}
    else {const t=TYPES[type]||TYPES.broken;hp*=t[1];spd*=t[2];r=t[3];if(type==='charger'){atk*=1.15}else if(type==='tank'){atk*=1.35}else if(type==='duelist'){atk*=1.65}else if(type==='assassin'){atk*=2}else if(type==='brute'){atk*=1.7}else if(type==='lovebreaker'){atk*=3}else if(type==='berserker'){atk*=2.35}else if(type==='lancer'){atk*=1.9}else if(type==='witch'){atk*=1.45}}
    this.enemies.push({id:'e'+this.nextEnemy++,x,y,hp,maxHp:hp,r,speed:spd,atk,hit:0,attack:.7+Math.random(),type,boss:type==='boss',bossIndex:type==='boss'?Math.floor(this.wave/5)-1:-1,bossDef:type==='boss'?{name:'Broken Heart Lord'}:null,name:type==='boss'?'Broken Heart Lord':(TYPES[type]?.[4]||'Broken Heart'),rarity:type==='boss'?'Legendary':(TYPES[type]?.[5]||'Common')});this.spawned++}
  serverAttack(p,m){const now=Date.now();if(now-p.lastAttack<180)return;p.lastAttack=now;const angle=Number(m.angle)||p.angle;let best=null,bestD=Infinity;for(const e of this.enemies){const d=Math.hypot(e.x-p.x,e.y-p.y);const range=m.weapon==='bow'?220:125;if(d>range)continue;let da=Math.atan2(e.y-p.y,e.x-p.x)-angle;da=Math.atan2(Math.sin(da),Math.cos(da));if(Math.abs(da)<(m.weapon==='bow'?.45:.95)&&d<bestD){best=e;bestD=d}}
    if(best){let dmg=clamp(Number(m.stats?.atk)||p.atk,1,10000);if(Math.random()<p.crit)dmg*=2;best.hp-=dmg;best.hit=.12;if(best.hp<=0){const reward=best.boss?80+this.wave*8:3+Math.floor(this.wave*.9);this.enemies=this.enemies.filter(e=>e.id!==best.id);this.send(idOf(this.players,p.id),{type:'reward',reward,xp:(best.boss?180:25)+this.wave*6})}}
    this.broadcast({type:'fx',kind:'attack',from:p.id,x:p.x,y:p.y,angle,weapon:m.weapon});
  }
  tick(){if(this.phase!=='battle')return;const dt=.05;for(const p of this.players.values()){const l=Math.hypot(p.ix,p.iy)||1;p.x=clamp(p.x+p.ix/l*p.spd*60*dt,30,WIDTH-30);p.y=clamp(p.y+p.iy/l*p.spd*60*dt,62,HEIGHT-30)}
    for(const e of this.enemies){let target=null,bd=Infinity;for(const p of this.players.values()){const d=dist(e,p);if(d<bd){bd=d;target=p}}if(!target)continue;const dx=target.x-e.x,dy=target.y-e.y,d=Math.hypot(dx,dy)||1,contact=e.boss?72:46;if(d>contact){e.x+=dx/d*e.speed*60*dt;e.y+=dy/d*e.speed*60*dt}else{e.attack-=dt;if(e.attack<=0){e.attack=e.boss?1.5:.9;const dmg=Math.max(1,e.atk-target.armor*.7);target.hp=Math.max(0,target.hp-dmg);if(target.hp<=0)target.hp=target.maxHp}}e.x=clamp(e.x,-60,WIDTH+60);e.y=clamp(e.y,-60,HEIGHT+60);e.hit=Math.max(0,e.hit-dt)}
    const targetCount=this.wave%5===0?1:this.wave*3+4;if(this.spawned<targetCount&&this.enemies.length<Math.min(6+this.wave,15))this.spawn();
    if(this.spawned>=targetCount&&this.enemies.length===0){this.phase='upgrade';this.offer={id:Date.now(),choices:[{id:'hp',icon:'❤️',name:'Vitality',desc:'Max HP +25'},{id:'atk',icon:'⚔️',name:'Sharpness',desc:'Attack +4'},{id:'spd',icon:'💨',name:'Grace',desc:'Speed +0.35'},{id:'crit',icon:'✨',name:'True Love',desc:'Crit +5%'},{id:'armor',icon:'🛡️',name:'Protection',desc:'Armor +3'},{id:'heal',icon:'💗',name:'Second Heart',desc:'Heal 35% HP'}].sort(()=>Math.random()-.5).slice(0,3)};this.picks.clear();this.broadcast({type:'upgradeOffer',offerId:this.offer.id,choices:this.offer.choices});return}
    this.broadcastState();
  }
  snapshotFor(id){const p=this.players.get(id);return {phase:this.phase,wave:this.wave,player:p?{x:p.x,y:p.y,hp:p.hp,maxHp:p.maxHp,angle:p.angle}:null,players:[...this.players.values()].map(q=>({id:q.id,name:q.name,x:q.x,y:q.y,hp:q.hp,maxHp:q.maxHp,angle:q.angle})),enemies:this.enemies}}
  broadcastState(){for(const [id] of this.sockets){const p=this.players.get(id);this.send(id,{type:'state',serverNow:Date.now(),phase:this.phase,wave:this.wave,player:p?{x:p.x,y:p.y,hp:p.hp,maxHp:p.maxHp,angle:p.angle}:null,players:[...this.players.values()].map(q=>({id:q.id,name:q.name,x:q.x,y:q.y,hp:q.hp,maxHp:q.maxHp,angle:q.angle})),enemies:this.enemies})}}
  broadcastPlayers(){this.broadcast({type:'players',players:[...this.players.values()].map(p=>({id:p.id,name:p.name,x:p.x,y:p.y,hp:p.hp,maxHp:p.maxHp,angle:p.angle}))})}
  send(id,msg){const ws=this.sockets.get(id);if(ws)try{ws.send(JSON.stringify(msg))}catch{}}
  broadcast(msg){const d=JSON.stringify(msg);for(const [id,ws] of this.sockets){try{ws.send(d)}catch{this.sockets.delete(id);this.players.delete(id)}}}
}
function idOf(map,id){return id}
