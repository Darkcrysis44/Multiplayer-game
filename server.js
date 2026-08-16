const path = require('path');
const fs = require('fs');
const http = require('http');
const express = require('express');
const { WebSocketServer } = require('ws');
const { Pool } = require('pg');

const PORT = Number(process.env.PORT || 10000);
const app = express();
app.use(express.json({ limit: '256kb' }));
app.use(express.static(path.join(__dirname)));
app.get('/health', (_req, res) => res.json({ ok: true, service: 'nicoleta-love-server', time: Date.now() }));
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

const pool = process.env.DATABASE_URL ? new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false }
}) : null;
const localFile = path.join(__dirname, 'data', 'players.json');
const rooms = new Map();
const clients = new Map();

function ensureLocalStore(){
  if(pool) return;
  fs.mkdirSync(path.dirname(localFile), { recursive: true });
  if(!fs.existsSync(localFile)) fs.writeFileSync(localFile, '{}');
}
function readLocal(){ ensureLocalStore(); try { return JSON.parse(fs.readFileSync(localFile,'utf8')); } catch { return {}; } }
function writeLocal(data){ ensureLocalStore(); fs.writeFileSync(localFile, JSON.stringify(data,null,2)); }
async function initDb(){
  if(!pool) return;
  await pool.query(`CREATE TABLE IF NOT EXISTS player_saves (
    player_id TEXT PRIMARY KEY,
    profile JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
}
async function loadProfile(id){
  if(pool){ const r=await pool.query('SELECT profile FROM player_saves WHERE player_id=$1',[id]); return r.rows[0]?.profile || null; }
  return readLocal()[id] || null;
}
async function saveProfile(id, profile){
  if(!id || !profile) return;
  if(pool){
    await pool.query(`INSERT INTO player_saves(player_id,profile,updated_at) VALUES($1,$2,NOW())
      ON CONFLICT(player_id) DO UPDATE SET profile=EXCLUDED.profile, updated_at=NOW()`,[id,profile]);
    return;
  }
  const all=readLocal(); all[id]=profile; writeLocal(all);
}

function code(){
  const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let c=''; do { c=''; for(let i=0;i<6;i++) c+=chars[Math.floor(Math.random()*chars.length)]; } while(rooms.has(c));
  return c;
}
function send(ws,msg){ if(ws.readyState===1) ws.send(JSON.stringify(msg)); }
function broadcast(room,msg,except){ for(const p of room.players.values()) if(p.ws!==except) send(p.ws,msg); }
function roomSnapshot(room){
  return { code:room.code, hostId:room.hostId, started:room.started, paused:room.paused,
    players:[...room.players.values()].map(p=>({id:p.id,name:p.name,x:p.x,y:p.y,hp:p.hp,maxHp:p.maxHp,angle:p.angle,weapon:p.weapon})) };
}
function leave(ws){
  const c=clients.get(ws); if(!c) return;
  const room=rooms.get(c.room); if(room){ room.players.delete(c.id); if(room.hostId===c.id){ room.hostId=room.players.keys().next().value || null; if(!room.hostId){ rooms.delete(room.code); } else broadcast(room,{type:'hostChanged',hostId:room.hostId}); }
    if(rooms.has(room.code)) broadcast(room,{type:'roomState',state:roomSnapshot(room)});
  }
  clients.delete(ws);
}

wss.on('connection',(ws)=>{
  const id = Math.random().toString(36).slice(2,10)+'-'+Date.now().toString(36);
  clients.set(ws,{id,room:null,name:'Player',x:400,y:300,hp:100,maxHp:100,angle:0,weapon:'sword'});
  send(ws,{type:'welcome',playerId:id,serverTime:Date.now()});
  ws.on('message',async raw=>{
    let m; try{m=JSON.parse(raw.toString())}catch{return}
    const c=clients.get(ws); if(!c) return;
    try{
      if(m.type==='identify'){
        if(typeof m.playerId==='string' && m.playerId.length<100){ c.id=m.playerId; clients.delete(ws); clients.set(ws,c); const profile=await loadProfile(c.id); send(ws,{type:'profile',profile}); }
      }
      else if(m.type==='createRoom'){
        if(c.room) return send(ws,{type:'error',message:'Already in a room.'});
        const r={code:code(),hostId:c.id,started:false,paused:false,players:new Map()};
        c.room=r.code; r.players.set(c.id,c); rooms.set(r.code,r); send(ws,{type:'roomCreated',code:r.code,hostId:c.id}); send(ws,{type:'roomState',state:roomSnapshot(r)});
      }
      else if(m.type==='joinRoom'){
        const r=rooms.get(String(m.code||'').toUpperCase()); if(!r) return send(ws,{type:'error',message:'Room not found.'});
        if(r.players.size>=4) return send(ws,{type:'error',message:'Room is full.'});
        if(r.started) return send(ws,{type:'error',message:'Game already started.'});
        c.room=r.code; r.players.set(c.id,c); send(ws,{type:'joined',code:r.code,hostId:r.hostId}); broadcast(r,{type:'roomState',state:roomSnapshot(r)});
      }
      else if(m.type==='leaveRoom'){ leave(ws); }
      else if(m.type==='startGame'){
        const r=rooms.get(c.room); if(!r || r.hostId!==c.id) return;
        r.started=true; r.paused=false; broadcast(r,{type:'gameState',started:true,paused:false});
      }
      else if(m.type==='pauseGame'){
        const r=rooms.get(c.room); if(!r || r.hostId!==c.id || !r.started) return;
        r.paused=!!m.paused; broadcast(r,{type:'gameState',started:true,paused:r.paused});
      }
      else if(m.type==='state'){
        const r=rooms.get(c.room); if(!r || !r.started || r.paused) return;
        if(Number.isFinite(m.x)) c.x=m.x; if(Number.isFinite(m.y)) c.y=m.y; if(Number.isFinite(m.hp)) c.hp=m.hp;
        if(Number.isFinite(m.maxHp)) c.maxHp=m.maxHp; if(Number.isFinite(m.angle)) c.angle=m.angle; if(typeof m.weapon==='string') c.weapon=m.weapon.slice(0,60);
        broadcast(r,{type:'playerState',player:{id:c.id,x:c.x,y:c.y,hp:c.hp,maxHp:c.maxHp,angle:c.angle,weapon:c.weapon}},ws);
      }
      else if(m.type==='profile'){
        await saveProfile(c.id,m.profile);
      }
      else if(m.type==='requestProfile'){
        send(ws,{type:'profile',profile:await loadProfile(c.id)});
      }
      else if(m.type==='ping') send(ws,{type:'pong',t:m.t});
    }catch(err){ console.error(err); send(ws,{type:'error',message:'Server error. Check the server log.'}); }
  });
  ws.on('close',()=>leave(ws));
});

setInterval(()=>{
  const now=Date.now();
  for(const ws of wss.clients) if(ws.readyState===1) send(ws,{type:'ping',t:now});
},15000);

initDb().then(()=>server.listen(PORT,'0.0.0.0',()=>console.log(`Nicoleta Love server listening on port ${PORT}`))).catch(err=>{console.error('Database initialization failed:',err);process.exit(1)});
