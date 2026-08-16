
const messages=["I love your eyes","I love your smile","I love your cheek","I love your whole bodyy","I love your personality","I love your kindness","I love how much you care about me","I love your cuteness","I love everything about you","I cant even explain my love to you","I love your soul","I love your hair","I love your eyes","I love your arms hehehe","I love you how you are","I love how you be majestic","I love how you be so angelic","I love how you cute","I love how you think about us","I love because I love you","I love spend time with you","I love how u treat me","I love how you can be perfect like this","I can find anything to love you","I love you sooo sooooo muchhhhhhh"];
let i=0;
const msg=document.getElementById("message"),num=document.getElementById("number"),prev=document.getElementById("prev"),next=document.getElementById("next"),progress=document.getElementById("progress");
messages.forEach((_,x)=>{const d=document.createElement("span");d.className="dot"+(!x?" active":"");progress.appendChild(d)});
function render(){
 msg.classList.remove("fade");void msg.offsetWidth;msg.classList.add("fade");
 msg.textContent=messages[i];num.textContent=(i+1)+" / "+messages.length;
 [...progress.children].forEach((d,x)=>d.classList.toggle("active",x===i));
 prev.disabled=i===0;
 next.classList.toggle("final-glow", i===messages.length-1);
}
function go(n){
 if(i===messages.length-1 && n>0){
   document.getElementById("bday").classList.remove("hidden");
   return;
 }
 i=Math.max(0,Math.min(messages.length-1,i+n));render()
}
prev.onclick=()=>go(-1);next.onclick=()=>go(1);
document.addEventListener("keydown",e=>{if(e.key==="ArrowLeft")go(-1);if(e.key==="ArrowRight")go(1)});
const audio=document.getElementById("audio"),music=document.getElementById("music");
document.getElementById("start").onclick=async()=>{document.getElementById("intro").classList.add("hidden");try{await audio.play();music.classList.add("active")}catch(e){}};
music.onclick=async()=>{if(audio.paused){try{await audio.play();music.classList.add("active")}catch(e){}}else{audio.pause();music.classList.remove("active")}};
document.getElementById("birthdayBtn").onclick=()=>document.getElementById("bday").classList.remove("hidden");
document.getElementById("close").onclick=()=>document.getElementById("bday").classList.add("hidden");

const gameModal=document.getElementById("gameModal"),gameArea=document.getElementById("gameArea"),gameScore=document.getElementById("gameScore"),gameMessage=document.getElementById("gameMessage"),catchProgress=document.getElementById("catchProgress");
let score=0,gameTimer=null;
function startGame(){score=0;gameScore.textContent="0";catchProgress.style.width="0%";gameMessage.classList.remove("show");gameArea.innerHTML="";clearInterval(gameTimer);gameTimer=setInterval(spawnHeart,560);for(let x=0;x<4;x++)setTimeout(spawnHeart,x*160)}
function spawnHeart(){if(score>=15)return;const h=document.createElement("div");h.className="falling-heart";h.textContent=Math.random()>.18?"♥":"♡";h.style.left=(4+Math.random()*88)+"%";const d=Math.max(1.8,3.4+Math.random()*1.8-score*.06);h.style.animationDuration=d+"s";h.onclick=()=>{if(h.dataset.caught)return;h.dataset.caught=1;score++;gameScore.textContent=score;catchProgress.style.width=Math.min(100,score/15*100)+"%";h.style.opacity="0";h.style.transform="scale(1.7)";setTimeout(()=>h.remove(),120);if(score>=15){addLove(score);clearInterval(gameTimer);setTimeout(()=>gameMessage.classList.add("show"),250)}};gameArea.appendChild(h);setTimeout(()=>{if(h.parentNode&&!h.dataset.caught)h.remove()},d*1000+100)}

let loveBalance=parseInt(localStorage.getItem("nicoletaLoveBalance")||"0",10);
const balanceEl=document.getElementById("balance");
function updateBalance(){balanceEl.textContent=loveBalance;localStorage.setItem("nicoletaLoveBalance",String(loveBalance))}
function addLove(amount){loveBalance+=amount;updateBalance()}
function showToast(text){const t=document.getElementById("shopToast");t.textContent=text;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),1800)}
updateBalance();


const inventoryModal=document.getElementById("inventoryModal"),inventoryGrid=document.getElementById("inventoryGrid");
const inventoryItems=[
 {name:"Pink Heart",icon:"💗"},
 {name:"Forever Rose",icon:"🌹"},
 {name:"Cute Ribbon",icon:"🎀"},
 {name:"Love Diamond",icon:"💎"}
];
let inventory=JSON.parse(localStorage.getItem("nicoletaLoveInventory")||"{}");
function saveInventory(){localStorage.setItem("nicoletaLoveInventory",JSON.stringify(inventory))}
function renderInventory(){
 inventoryGrid.innerHTML="";
 inventoryItems.forEach(item=>{
  const count=Number(inventory[item.name]||0);
  const div=document.createElement("div");div.className="inventory-item"+(count?" owned":"");
  div.innerHTML='<div class="inv-icon">'+item.icon+'</div><div class="inv-name">'+item.name+'</div><div class="inv-count">'+(count?"Owned ×"+count:"Not owned")+'</div>';
  inventoryGrid.appendChild(div);
 });
}
document.getElementById("inventoryOpen").onclick=()=>{renderInventory();inventoryModal.classList.remove("hidden")};
document.getElementById("inventoryClose").onclick=()=>inventoryModal.classList.add("hidden");
renderInventory();

const shopModal=document.getElementById("shopModal");
document.getElementById("shopOpen").onclick=()=>shopModal.classList.remove("hidden");
document.getElementById("shopClose").onclick=()=>shopModal.classList.add("hidden");
document.querySelectorAll(".shop-buy").forEach(btn=>{
 btn.onclick=()=>{
  const cost=Number(btn.dataset.cost),item=btn.dataset.item;
  if(loveBalance<cost){showToast("Not enough hearts yet ♡");return}
  loveBalance-=cost;updateBalance();inventory[item]=(Number(inventory[item]||0)+1);saveInventory();renderInventory();showToast("You bought "+item+" ♡");
 };
});

const gameMenu=document.getElementById("gameMenu");
document.getElementById("gamesOpen").onclick=()=>gameMenu.classList.remove("hidden");
document.getElementById("gameMenuClose").onclick=()=>gameMenu.classList.add("hidden");
document.getElementById("catchChoice").onclick=()=>{gameMenu.classList.add("hidden");gameModal.classList.remove("hidden");startGame()};
document.getElementById("memoryChoice").onclick=()=>{gameMenu.classList.add("hidden");gameModal.classList.add("hidden");memoryModal.classList.remove("hidden");startMemory()};
document.getElementById("gameClose").onclick=()=>{gameModal.classList.add("hidden");clearInterval(gameTimer)};
document.getElementById("gameAgain").onclick=startGame;


const memoryModal=document.getElementById("memoryModal"),memoryGrid=document.getElementById("memoryGrid"),memoryScore=document.getElementById("memoryScore"),memoryMessage=document.getElementById("memoryMessage");
let firstCard=null,secondCard=null,lockMemory=false,matches=0;
function startMemory(){
 memoryGrid.innerHTML="";memoryMessage.classList.remove("show");firstCard=null;secondCard=null;lockMemory=false;matches=0;memoryScore.textContent="0";
 const symbols=[
 {icon:"💗",name:"pink heart"},{icon:"🌹",name:"rose"},{icon:"🎀",name:"ribbon"},
 {icon:"💎",name:"diamond"},{icon:"🌙",name:"moon"},{icon:"✨",name:"sparkles"},
 {icon:"💗",name:"pink heart"},{icon:"🌹",name:"rose"},{icon:"🎀",name:"ribbon"},
 {icon:"💎",name:"diamond"},{icon:"🌙",name:"moon"},{icon:"✨",name:"sparkles"}
].sort(()=>Math.random()-.5);
 symbols.forEach((s,index)=>{
  const c=document.createElement("button");c.className="memory-card";
  c.innerHTML='<span class="memory-card-inner"><span class="memory-face memory-back"></span><span class="memory-face memory-front">'+s.icon+'</span></span>';
  c.dataset.symbol=s.name;c.dataset.index=index;c.setAttribute("aria-label","Love memory card");
  c.onclick=()=>flipMemory(c);memoryGrid.appendChild(c);
 });
}
function flipMemory(c){
 if(lockMemory||c===firstCard||c.classList.contains("matched"))return;
 c.classList.add("flipped");
 if(!firstCard){firstCard=c;return}
 secondCard=c;lockMemory=true;
 if(firstCard.dataset.symbol===secondCard.dataset.symbol){
  firstCard.classList.add("matched");secondCard.classList.add("matched");matches++;memoryScore.textContent=matches;firstCard=null;secondCard=null;lockMemory=false;
  if(matches===6){addLove(matches*5);setTimeout(()=>memoryMessage.classList.add("show"),500);}
 }else{
  setTimeout(()=>{firstCard.classList.remove("flipped");secondCard.classList.remove("flipped");firstCard=null;secondCard=null;lockMemory=false},650);
 }
}
document.getElementById("memoryClose").onclick=()=>{memoryModal.classList.add("hidden");memoryMessage.classList.remove("show");firstCard=null;secondCard=null;lockMemory=false};
document.getElementById("memoryAgain").onclick=startMemory;




const chooseModal=document.getElementById("chooseModal"),chooseHearts=document.getElementById("chooseHeartsInner"),chooseRound=document.getElementById("chooseRound"),chooseCount=document.getElementById("chooseCount"),chooseMessage=document.getElementById("chooseMessage"),chooseFinalText=document.getElementById("chooseFinalText"),shuffleNote=document.getElementById("shuffleNote");
let chooseR=1,chooseCollected=0,correctIndex=0,chooseLocked=false;
function startChoose(){chooseR=1;chooseCollected=0;chooseCount.textContent="0";chooseMessage.classList.remove("show");chooseLocked=false;newChooseRound();}
function newChooseRound(){
 chooseLocked=true;chooseRound.textContent=chooseR;chooseHearts.innerHTML="";
 const count=chooseR+2;
 correctIndex=Math.floor(Math.random()*count);
 const cards=[];
 for(let n=0;n<count;n++){
  const b=document.createElement("button");b.className="choice-box";b.textContent="♡";b.dataset.id=n;b.dataset.correct=n===correctIndex?"1":"0";
  b.onclick=()=>choosePick(b);cards.push(b);chooseHearts.appendChild(b);
 }
 const target=cards[correctIndex];
 // Show the real heart clearly first.
 shuffleNote.textContent="Remember the real heart... ♥";
 setTimeout(()=>{target.classList.add("reveal");target.textContent="♥";},180);
 const revealTime=Math.max(850,1450-(chooseR-1)*110);
 setTimeout(()=>{
   target.classList.remove("reveal");target.textContent="♡";
   shuffleNote.textContent="Now watch the boxes...";
   shuffleBoxes(cards,chooseR);
 },revealTime);
}
function shuffleBoxes(cards,round){
 // Each swap is a single visible lift -> slide -> land animation.
 // After landing, the DOM order is updated and the boxes stay there.
 const swaps=5+round*3;
 let step=0;
 let delay=Math.max(260,600-(round-1)*65);

 function swap(){
   if(step>=swaps){
     shuffleNote.textContent="Find the real heart! ♥";
     chooseLocked=false;
     return;
   }

   let a=Math.floor(Math.random()*cards.length);
   let b=Math.floor(Math.random()*cards.length);
   while(a===b)b=Math.floor(Math.random()*cards.length);

   const ca=cards[a], cb=cards[b];
   const ra=ca.getBoundingClientRect(), rb=cb.getBoundingClientRect();
   const dx=rb.left-ra.left;
   const dy=rb.top-ra.top;

   // Both boxes visibly rise and cross to each other's current position.
   ca.style.setProperty("--swap-x",dx+"px");
   cb.style.setProperty("--swap-x",(-dx)+"px");
   ca.classList.add("shuffling","lift-left");
   cb.classList.add("shuffling","lift-right");
   shuffleNote.textContent="Watch closely... ♥";

   // IMPORTANT: leave them at their new visual positions.
   setTimeout(()=>{
     ca.classList.remove("lift-left");
     cb.classList.remove("lift-right");

     // Exchange DOM positions while the animation is already at the
     // destination, so there is no snap-back to the old location.
     const marker=document.createElement("span");
     chooseHearts.insertBefore(marker,ca);
     chooseHearts.insertBefore(ca,cb);
     chooseHearts.insertBefore(cb,marker);
     marker.remove();

     ca.classList.remove("shuffling");
     cb.classList.remove("shuffling");
     ca.style.removeProperty("--swap-x");
     cb.style.removeProperty("--swap-x");

     step++;
     delay=Math.max(170,delay-12);
     setTimeout(swap,delay);
   },760);
 }
 setTimeout(swap,300);
}
function choosePick(b){
 if(chooseLocked||b.classList.contains("opened"))return;
 if(b.dataset.correct==="1"){
  chooseLocked=true;b.classList.add("correct","opened");b.textContent="♥";chooseCollected++;chooseCount.textContent=chooseCollected;
  setTimeout(()=>{
   if(chooseR>=5){addLove(chooseCollected);chooseFinalText.textContent="U catched "+chooseCollected+" of my heart babyyyy ♡";chooseMessage.classList.add("show")}
   else{chooseR++;newChooseRound()}
  },600);
 }else{
  b.classList.add("wrong");setTimeout(()=>b.classList.remove("wrong"),400);
 }
}
document.getElementById("chooseChoice").onclick=()=>{gameMenu.classList.add("hidden");chooseModal.classList.remove("hidden");startChoose()};
document.getElementById("chooseClose").onclick=()=>{chooseModal.classList.add("hidden");chooseMessage.classList.remove("show");chooseLocked=true};
document.getElementById("chooseAgain").onclick=startChoose;
render();


/* ================= LOVE SWORD ARENA ================= */
const $ = id => document.getElementById(id);
const arenaModal=document.getElementById('arenaModal'),arenaChoice=document.getElementById('arenaChoice'),arenaCanvas=document.getElementById('lsaCanvas');
const ac=arenaCanvas.getContext('2d');
const arenaBase={maxHp:100,atk:14,spd:3.2,crit:.08,armor:0};
let savedArena={}; try { savedArena=JSON.parse(localStorage.getItem('nicoletaLoveArena')||'null')||{}; } catch(e) { localStorage.removeItem('nicoletaLoveArena'); savedArena={}; }
const arenaState={
 level:Number(savedArena.level||1),xp:Number(savedArena.xp||0),rebirths:Number(savedArena.rebirths||0),mult:Number(savedArena.mult||1),
 stats:Object.assign({},arenaBase,savedArena.stats||{}),waveUpgrades:{hp:0,atk:0,spd:0,crit:0,armor:0},gear:Object.assign({weapon:'Rose Blade',bow:'Cupid Bow',armor:'Love Cloth',acc:'None',arrow:'Basic Arrow'},savedArena.gear||{}),activeWeapon:savedArena.activeWeapon||'Rose Blade',activeWeaponType:savedArena.activeWeaponType||'sword',skills:Array.isArray(savedArena.skills)?savedArena.skills:[],passives:Array.isArray(savedArena.passives)?savedArena.passives:[],lastLoot:savedArena.lastLoot||null
};
let arena={running:false,wave:1,enemies:[],projectiles:[],particles:[],slashes:[],keys:{},last:0,spawned:0,kills:0,shake:0,mouseX:0,mouseY:0,player:{x:0,y:0,hp:100,dir:1,angle:0,attackCd:0,slashT:0,inv:0,skillCd:0}};
let arenaAudio=null;
function saveArena(){localStorage.setItem('nicoletaLoveArena',JSON.stringify(arenaState))}
function initArenaAudio(){if(arenaAudio)return;try{arenaAudio=new (window.AudioContext||window.webkitAudioContext)()}catch(e){}}
function sfx(type){initArenaAudio();if(!arenaAudio)return;const ctx=arenaAudio;if(ctx.state==='suspended')ctx.resume();const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);const now=ctx.currentTime;let f=type==='slash'?520:type==='hit'?180:type==='kill'?120:type==='hurt'?85:type==='level'?760:type==='rebirth'?980:320;let dur=type==='slash'?.11:type==='level'?.28:type==='rebirth'?.5:.12;o.frequency.setValueAtTime(f,now);o.frequency.exponentialRampToValueAtTime(Math.max(55,f*.55),now+dur);o.type=type==='slash'?'triangle':'sine';g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(type==='rebirth'?.16:.09,now+.015);g.gain.exponentialRampToValueAtTime(.0001,now+dur);o.start(now);o.stop(now+dur+.02)}
function resizeArena(){const r=arenaCanvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);arenaCanvas.width=Math.floor(r.width*d);arenaCanvas.height=Math.floor(r.height*d);ac.setTransform(d,0,0,d,0,0);arena.w=r.width;arena.h=r.height;arena.player.x=Math.max(50,Math.min(arena.w-50,arena.player.x||arena.w/2));arena.player.y=Math.max(70,Math.min(arena.h-50,arena.player.y||arena.h/2))}
window.addEventListener('resize',()=>{if(arena.running)resizeArena()});
function xpNeed(){return Math.floor(100*Math.pow(1.12,arenaState.level-1))}
const passiveDefs={
 iron:'Iron Heart',sharp:'Sharp Love',swift:'Swift Heart',crit:'Critical Kiss',thorn:'Thorn Armor',guardian:'Guardian Soul',vamp:'Vampire Rose',fortune:'Fortune Heart'
};
function hasPassive(id){return arenaState.passives.includes(id)}
function combatStats(){const b=arenaState.stats,r=arenaState.waveUpgrades||{};let st={maxHp:b.maxHp+r.hp,atk:b.atk+r.atk,spd:b.spd+r.spd,crit:Math.min(.95,b.crit+r.crit),armor:b.armor+r.armor};if(hasPassive('iron'))st.maxHp*=1.10;if(hasPassive('sharp'))st.atk*=1.12;if(hasPassive('swift'))st.spd*=1.08;if(hasPassive('crit'))st.crit=Math.min(.95,st.crit+.05);if(hasPassive('thorn'))st.armor*=1.15;if(hasPassive('eternal')){st.maxHp*=1.06;st.atk*=1.06;st.spd*=1.06;st.crit=Math.min(.95,st.crit+.02);st.armor*=1.06}return st}
function resetWaveUpgrades(){arenaState.waveUpgrades={hp:0,atk:0,spd:0,crit:0,armor:0}}
function arenaStats(){const s=combatStats();$('lsaHpText').textContent=Math.max(0,Math.ceil(arena.player.hp))+' / '+Math.ceil(s.maxHp);$('lsaHpBar').style.width=Math.max(0,arena.player.hp/s.maxHp*100)+'%';$('lsaAtk').textContent=s.atk.toFixed(1);$('lsaSpd').textContent=s.spd.toFixed(1);$('lsaCrit').textContent=Math.round(s.crit*100)+'%';$('lsaArmor').textContent=s.armor.toFixed(1);$('lsaGold').textContent=loveBalance;$('lsaWave').textContent=arena.wave;$('lsaLevel').textContent=arenaState.level;$('lsaRebirth').textContent=arenaState.rebirths;$('lsaXpText').textContent=arenaState.xp+' / '+xpNeed();$('lsaXpBar').style.width=Math.min(100,arenaState.xp/xpNeed()*100)+'%';$('lsaMult').textContent='×'+arenaState.mult.toFixed(2);$('lsaWeapon').textContent=(arenaState.activeWeapon||'Rose Blade')+' ['+(arenaState.activeWeaponType==='bow'?'2':'1')+']';$('lsaArmorName').textContent=arenaState.gear.armor;$('lsaAcc').textContent=arenaState.gear.acc;$('lsaRebirthBtn').disabled=arenaState.level<50;const sk=arenaState.skills[0];$('lsaSkillName').textContent=sk?sk.name:'None';$('lsaSkillCd').textContent=sk?(arena.player.skillCd>0?arena.player.skillCd.toFixed(1)+'s':'Ready'):'Buy in Shop';$('lsaSkillUse').disabled=!sk||arena.player.skillCd>0||!arena.running}
function arenaLog(t){const l=$('lsaLog');l.innerHTML='<div>• '+t+'</div>'+l.innerHTML}
function toast(t){const el=$('lsaToast');el.textContent=t;el.classList.add('show');clearTimeout(el._tm);el._tm=setTimeout(()=>el.classList.remove('show'),1700)}
function gainXp(amount){arenaState.xp+=amount;let leveled=false;while(arenaState.xp>=xpNeed()){arenaState.xp-=xpNeed();arenaState.level++;leveled=true;const scale=arenaState.mult;arenaState.stats.maxHp+=Math.round(12*scale);arenaState.stats.atk+=Math.round(2.5*scale*10)/10;arenaState.stats.spd+=.05*scale;arenaState.stats.armor+=.35*scale;arena.player.hp=arenaState.stats.maxHp;arenaLog('Level '+arenaState.level+'! Stats increased.');sfx('level');toast('LEVEL UP! ✨ Lv '+arenaState.level)}if(leveled)saveArena();arenaStats()}
function addArenaMoney(amount){addLove(amount);arenaStats();toast('+'+amount+' 💗')} 
const bossDefs=[
 {name:'Heartbreaker',icon:'💔',hp:7,spd:.70,atk:3.4,skill:'dash'},
 {name:'Rose Colossus',icon:'🌹',hp:11,spd:.42,atk:4.5,skill:'slam'},
 {name:'Cupid Tyrant',icon:'🏹',hp:8,spd:.58,atk:3.2,skill:'volley'},
 {name:'Broken Duchess',icon:'👑',hp:6.5,spd:.82,atk:3.0,skill:'summon'},
 {name:'Grief Knight',icon:'🛡️',hp:9,spd:.62,atk:4.0,skill:'shield'},
 {name:'Passion Beast',icon:'🔥',hp:8.5,spd:1.05,atk:3.7,skill:'charge'},
 {name:'Toxic Lover',icon:'☠️',hp:7.5,spd:.72,atk:3.1,skill:'poison'},
 {name:'Shadow Heart',icon:'🌑',hp:6,spd:1.15,atk:3.0,skill:'blink'},
 {name:'Love Reaper',icon:'🗡️',hp:10,spd:.76,atk:4.2,skill:'scythe'},
 {name:'Final Heart',icon:'❤️‍🔥',hp:14,spd:.55,atk:5.0,skill:'nova'}
];
function spawnEnemy(forceBoss=false){
 const side=Math.floor(Math.random()*4);let x,y;
 if(side===0){x=Math.random()*arena.w;y=-40}else if(side===1){x=arena.w+40;y=Math.random()*arena.h}else if(side===2){x=Math.random()*arena.w;y=arena.h+40}else{x=-40;y=Math.random()*arena.h}
 const boss=forceBoss;let roll=Math.random(),type;
 if(boss) type='boss';
 else if(roll<.55)type='broken';
 else if(roll<.80)type=['charger','duelist','archer','lancer','guard'][Math.floor(Math.random()*5)];
 else if(roll<.93)type=['tank','mage','splitter','sentinel','mimic'][Math.floor(Math.random()*5)];
 else if(roll<.99)type=['assassin','brute','berserker','lovebreaker'][Math.floor(Math.random()*4)];
 else type='witch';
 const scale=1+arena.wave*.15;
 let hp=(34+arena.wave*15)*scale,spd=.55+arena.wave*.045+Math.random()*.35,atk=7+arena.wave*1.7,r=21;
 if(type==='charger'){hp*=.8;spd*=1.8;atk*=1.15;r=19}
 else if(type==='tank'){hp*=2.2;spd*=.55;atk*=1.35;r=27}
 else if(type==='duelist'){hp*=1.15;spd*=1.2;atk*=1.65;r=22}
 else if(type==='archer'){hp*=.9;spd*=.72;atk*=1.05;r=20}
 else if(type==='assassin'){hp*=.72;spd*=1.65;atk*=2.0;r=18}
 else if(type==='mage'){hp*=1.0;spd*=.58;atk*=1.25;r=22}
 else if(type==='brute'){hp*=2.7;spd*=.38;atk*=1.7;r=31}
 else if(type==='splitter'){hp*=1.5;spd*=.8;atk*=1.15;r=23}
 else if(type==='lancer'){hp*=1.25;spd*=.95;atk*=1.9;r=24}
 else if(type==='witch'){hp*=1.05;spd*=.5;atk*=1.45;r=22}
 else if(type==='berserker'){hp*=1.35;spd*=1.3;atk*=2.35;r=24}
 else if(type==='lovebreaker'){hp*=2.0;spd*=.95;atk*=3.0;r=27}
 else if(type==='sentinel'){hp*=1.65;spd*=.46;atk*=1.5;r=25}
 else if(type==='guard'){hp*=1.15;spd*=.62;atk*=1.7;r=24}
 else if(type==='mimic'){hp*=1.4;spd*=.7;atk*=1.3;r=24}
 let bossIndex=-1,bossDef=null;
 if(boss){bossIndex=(Math.floor(arena.wave/5)-1)%bossDefs.length;bossDef=bossDefs[bossIndex];hp*=bossDef.hp;spd*=bossDef.spd;atk*=bossDef.atk;r=44}
 const enemyMeta={broken:['Broken Heart','Common'],charger:['Heart Charger','Uncommon'],duelist:['Heart Duelist','Uncommon'],archer:['Cupid Archer','Uncommon'],lancer:['Rose Lancer','Uncommon'],tank:['Grief Tank','Rare'],mage:['Heart Mage','Rare'],splitter:['Split Heart','Rare'],sentinel:['Rose Sentinel','Rare'],guard:['Cupid Guard','Uncommon'],mimic:['Heart Mimic','Rare'],assassin:['Love Assassin','Epic'],brute:['Heart Brute','Epic'],berserker:['Love Berserker','Epic'],lovebreaker:['Love Breaker','Epic'],witch:['Heart Witch','Legendary']};
 const meta=enemyMeta[type]||['Broken Heart','Common'];
 const spawned={x,y,hp,maxHp:hp,r,speed:spd,atk,hit:0,attack:Math.random()*.7,variant:Math.random(),type,boss,bossIndex, bossDef, specialCd:2+Math.random()*2,poison:0,name:meta[0],rarity:meta[1]};arena.enemies.push(spawned);return spawned;
}
function burst(x,y,n=12,kind='hit'){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,sp=1+Math.random()*4;arena.particles.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:.45+Math.random()*.5,max:.9,size:2+Math.random()*4,kind})}}
function fireArrow(e){const p=arena.player,dx=p.x-e.x,dy=p.y-e.y,d=Math.hypot(dx,dy)||1;arena.projectiles.push({x:e.x,y:e.y,vx:dx/d*5.2,vy:dy/d*5.2,life:2.2,damage:e.atk*.8,angle:Math.atan2(dy,dx),owner:'enemy'});burst(e.x,e.y,4,'slash');sfx('slash')}
function destroyProjectile(q){q.life=0;burst(q.x,q.y,8,'death');sfx('hit')}
function updateProjectiles(dt){for(const q of arena.projectiles){q.x+=q.vx*60*dt;q.y+=q.vy*60*dt;q.life-=dt;if(q.owner==='enemy'&&q.life>0){const d=Math.hypot(q.x-arena.player.x,q.y-arena.player.y);if(d<18){hurtPlayer(q.damage);q.life=0;burst(q.x,q.y,10,'hurt')}} if(q.owner==='playerSkill'&&q.life>0&&!q.rain){for(const e of [...arena.enemies]){if(Math.hypot(q.x-e.x,q.y-e.y)<e.r+16){damageEnemy(e,q.damage);q.life=0;burst(q.x,q.y,12,'slash');break}}}}arena.projectiles=arena.projectiles.filter(q=>q.life>0&&q.x>-80&&q.x<arena.w+80&&q.y>-80&&q.y<arena.h+80)}
function drawProjectiles(){for(const q of arena.projectiles){ac.save();ac.translate(q.x,q.y);ac.rotate(q.angle);if(q.kind==='fire'){ac.shadowColor='#ff6b3d';ac.shadowBlur=18;ac.fillStyle='#ff7a3d';ac.beginPath();ac.arc(0,0,8,0,7);ac.fill();ac.fillStyle='#ffd36b';ac.beginPath();ac.arc(-2,0,4,0,7);ac.fill()}else if(q.kind==='playerArrow'||q.kind==='arrow'){ac.strokeStyle=q.owner==='playerSkill'?'#fff0f5':'#d8b7c8';ac.lineWidth=3;ac.beginPath();ac.moveTo(-18,0);ac.lineTo(10,0);ac.stroke();ac.fillStyle='#ffd1df';ac.beginPath();ac.moveTo(13,0);ac.lineTo(3,-6);ac.lineTo(3,6);ac.closePath();ac.fill()}else{ac.strokeStyle='#f5d7df';ac.lineWidth=3;ac.beginPath();ac.moveTo(-15,0);ac.lineTo(10,0);ac.stroke();ac.fillStyle='#ff8eaa';ac.beginPath();ac.moveTo(12,0);ac.lineTo(4,-5);ac.lineTo(4,5);ac.closePath();ac.fill();ac.fillStyle='#fff';ac.beginPath();ac.arc(-12,0,3,0,7);ac.fill()}ac.restore()}}
function damageEnemy(e,dmg){if(e.shieldT>0)dmg*=.35;e.hp-=dmg;e.hit=.12;arena.shake=4;burst(e.x,e.y,8,'heart');sfx('hit');if(e.hp<=0){let reward=(e.boss?80+arena.wave*8:3+Math.floor(arena.wave*.9));if(hasPassive('fortune'))reward=Math.ceil(reward*1.15);addArenaMoney(reward);gainXp((e.boss?180:25)+arena.wave*6);if(hasPassive('vamp'))arena.player.hp=Math.min(combatStats().maxHp,arena.player.hp+combatStats().maxHp*.04);arena.kills++;burst(e.x,e.y,e.boss?35:18,'death');if(e.type==='splitter'&&!e.boss&&arena.enemies.length<15){for(let i=0;i<2;i++)arena.enemies.push({x:e.x+(i?14:-14),y:e.y,hp:e.maxHp*.22,maxHp:e.maxHp*.22,r:13,speed:e.speed*1.5,atk:e.atk*.55,hit:0,attack:.3,variant:Math.random(),type:'broken',boss:false,bossIndex:-1,bossDef:null,specialCd:2,poison:0,name:'Broken Heart',rarity:'Common'})}arena.enemies.splice(arena.enemies.indexOf(e),1);sfx('kill');arenaLog((e.boss?'BOSS '+e.bossDef.name+' defeated':'Enemy defeated')+' • +'+reward+' 💗')}}
function slash(angle){if(!arena.running||arena.player.attackCd>0)return;initArenaAudio();if(arenaState.activeWeaponType==='bow'){arena.player.attackCd=.42;arena.player.angle=angle;const cs=combatStats();arena.projectiles.push({x:arena.player.x,y:arena.player.y,vx:Math.cos(angle)*7.2,vy:Math.sin(angle)*7.2,life:2.4,damage:cs.atk*1.15*({"Light Arrow":1.1,"Fire Arrow":1.15,"Ice Arrow":1.1,"Piercing Arrow":1.2,"Poison Arrow":1.2,"Explosive Arrow":1.3,"Chain Arrow":1.25,"Moon Arrow":1.7,"Cupid Arrow":2,"Eternal Rose Arrow":2.4}[arenaState.gear.arrow]||1),angle,owner:'playerSkill',kind:'playerArrow',arrowType:arenaState.gear.arrow});burst(arena.player.x,arena.player.y,7,'slash');sfx('slash');return}arena.player.attackCd=.27;arena.player.slashT=.22;arena.player.angle=angle;arena.player.dir=Math.cos(angle)>=0?1:-1;const p=arena.player;let hits=0;for(const q of [...arena.projectiles]){const dd=Math.hypot(q.x-p.x,q.y-p.y);let da=Math.atan2(q.y-p.y,q.x-p.x)-angle;da=Math.atan2(Math.sin(da),Math.cos(da));if(dd<105&&Math.abs(da)<1.0)destroyProjectile(q)}for(const e of [...arena.enemies]){const dx=e.x-p.x,dy=e.y-p.y,dist=Math.hypot(dx,dy);if(dist<125){let da=Math.atan2(dy,dx)-angle;da=Math.atan2(Math.sin(da),Math.cos(da));if(Math.abs(da)<.95){const cs=combatStats();let dmg=cs.atk;if(Math.random()<cs.crit)dmg*=2;damageEnemy(e,dmg);hits++}}}arena.slashes.push({x:p.x,y:p.y,angle,t:.22});burst(p.x+Math.cos(angle)*35,p.y+Math.sin(angle)*35,7,'slash');sfx('slash');if(hits)arenaLog('Sword slash hit '+hits+' enemy'+(hits>1?'ies':'')+'!')}
function hurtPlayer(d){if(arena.player.inv>0)return;const cs=combatStats();const reduction=hasPassive('guardian')?.92:1;const real=Math.max(1,(d-cs.armor*.7)*reduction);arena.player.hp-=real;arena.player.inv=.38;arena.shake=8;burst(arena.player.x,arena.player.y,10,'hurt');sfx('hurt');arenaLog('You took '+Math.ceil(real)+' damage');arenaStats();if(arena.player.hp<=0){arena.running=false;resetWaveUpgrades();arena.wave=1;arena.spawned=0;arena.enemies=[];arena.projectiles=[];arena.player.hp=combatStats().maxHp;arenaStats();arenaLog('Defeated — wave upgrades lost, character level progression kept.');toast('Defeated 💔 Wave upgrades reset')}}
function updateArena(dt){if(!arena.running)return;const p=arena.player,s=combatStats();let dx=0,dy=0;if(arena.keys.w||arena.keys.ArrowUp)dy--;if(arena.keys.s||arena.keys.ArrowDown)dy++;if(arena.keys.a||arena.keys.ArrowLeft)dx--;if(arena.keys.d||arena.keys.ArrowRight)dx++;if(dx||dy){const l=Math.hypot(dx,dy);p.x+=dx/l*s.spd*60*dt;p.y+=dy/l*s.spd*60*dt}p.x=Math.max(30,Math.min(arena.w-30,p.x));p.y=Math.max(62,Math.min(arena.h-30,p.y));p.attackCd=Math.max(0,p.attackCd-dt);p.slashT=Math.max(0,p.slashT-dt);p.inv=Math.max(0,p.inv-dt);p.skillCd=Math.max(0,p.skillCd-dt);if(coopSocket&&coopSocket.readyState===1&&!coopHost){return}for(const e of [...arena.enemies]){
 const ex=p.x-e.x,ey=p.y-e.y,d=Math.hypot(ex,ey)||1;const contact=e.boss?72:46;
 e.specialCd-=dt;e.poison=Math.max(0,e.poison-dt);
 if(e.boss){
   if(e.specialCd<=0){
     e.specialCd=2.2+Math.random()*1.5;
     const sk=e.bossDef?.skill;
     if(sk==='volley'||sk==='scythe'||sk==='nova'){
       const count=sk==='volley'?7:5;
       for(let i=0;i<count;i++){const a=Math.atan2(ey,ex)+(i-(count-1)/2)*.18;arena.projectiles.push({x:e.x,y:e.y,vx:Math.cos(a)*(sk==='scythe'?5.8:4.7),vy:Math.sin(a)*(sk==='scythe'?5.8:4.7),life:2.5,damage:e.atk*.45,angle:a,owner:'enemy'})}
       burst(e.x,e.y,14,'slash');
     } else if(sk==='summon'){for(let i=0;i<2;i++)spawnEnemy(false);toast('Boss summoned reinforcements! 💔')}
     else if(sk==='blink'){e.x=Math.random()*(arena.w-100)+50;e.y=Math.random()*(arena.h-120)+70;burst(e.x,e.y,20,'death')}
     else if(sk==='charge'){e.chargeT=.65;e.chargeA=Math.atan2(ey,ex)}
     else if(sk==='slam'){arena.shake=14;if(d<210)hurtPlayer(e.atk*1.6);burst(e.x,e.y,35,'hurt')}
     else if(sk==='dash'){e.dashT=.55;e.dashA=Math.atan2(ey,ex)}
     else if(sk==='shield'){e.shieldT=1.2}
     else if(sk==='poison'){if(d<260){arena.projectiles.push({x:e.x,y:e.y,vx:ex/d*3.8,vy:ey/d*3.8,life:2.8,damage:e.atk*.65,angle:Math.atan2(ey,ex),owner:'enemy',poison:true})}}
   }
   if(e.dashT>0){e.dashT-=dt;e.x+=Math.cos(e.dashA)*7*60*dt;e.y+=Math.sin(e.dashA)*7*60*dt}
   else if(e.chargeT>0){e.chargeT-=dt;e.x+=Math.cos(e.chargeA)*8*60*dt;e.y+=Math.sin(e.chargeA)*8*60*dt}
   else if(d>contact){e.x+=ex/d*e.speed*60*dt;e.y+=ey/d*e.speed*60*dt}
   else {e.attack-=dt;if(e.attack<=0){e.attack=.6;hurtPlayer(e.atk)}}
 } else if(e.type==='archer'){
   if(d>280){e.x+=ex/d*e.speed*60*dt;e.y+=ey/d*e.speed*60*dt}else if(d<190){e.x-=ex/d*e.speed*60*dt;e.y-=ey/d*e.speed*60*dt}
   e.attack-=dt;if(e.attack<=0){e.attack=1.25;fireArrow(e)}
 } else if(e.type==='mage'){
   if(d>330){e.x+=ex/d*e.speed*60*dt;e.y+=ey/d*e.speed*60*dt}else if(d<250){e.x-=ex/d*e.speed*60*dt;e.y-=ey/d*e.speed*60*dt}
   e.attack-=dt;if(e.attack<=0){e.attack=2.0;const a=Math.atan2(ey,ex);for(let j=-1;j<=1;j++){const aa=a+j*.22;arena.projectiles.push({x:e.x,y:e.y,vx:Math.cos(aa)*3.8,vy:Math.sin(aa)*3.8,life:2.4,damage:e.atk*.9,angle:aa,owner:'enemy'})}}
 } else if(e.type==='witch'){
   if(d>390){e.x+=ex/d*e.speed*60*dt;e.y+=ey/d*e.speed*60*dt}else if(d<300){e.x-=ex/d*e.speed*60*dt;e.y-=ey/d*e.speed*60*dt}
   e.specialCd-=dt;e.attack-=dt;
   if(e.specialCd<=0){e.specialCd=9.5;const se={x:e.x+38,y:e.y+18,hp:(28+arena.wave*8),maxHp:(28+arena.wave*8),r:16,speed:.28,atk:4+arena.wave*.6,hit:0,attack:.9,variant:Math.random(),type:'witchling',boss:false,bossIndex:-1,bossDef:null,specialCd:99,poison:0,name:'Witchling',rarity:'Common'};arena.enemies.push(se);burst(e.x,e.y,28,'death');toast('HEART WITCH SUMMONED A WITCHLING! 🔮')}
   if(e.attack<=0){e.attack=2.0;const a=Math.atan2(ey,ex);arena.projectiles.push({x:e.x,y:e.y,vx:Math.cos(a)*4.4,vy:Math.sin(a)*4.4,life:3.0,damage:e.atk*1.15,angle:a,owner:'enemy',kind:'fire'});burst(e.x,e.y,7,'hurt')}
 } else if(e.type==='witchling'){
   if(d>90){e.x+=ex/d*e.speed*60*dt;e.y+=ey/d*e.speed*60*dt}else{e.attack-=dt;if(e.attack<=0){e.attack=1.8;hurtPlayer(e.atk)}}
 } else if(e.type==='brute'){
   e.specialCd-=dt;
   if(e.jumpT>0){e.jumpT-=dt;e.x+=Math.cos(e.jumpA)*7.5*60*dt;e.y+=Math.sin(e.jumpA)*7.5*60*dt;if(e.jumpT<=0){if(Math.hypot(e.x-p.x,e.y-p.y)<90)hurtPlayer(e.atk*1.8);arena.shake=12;burst(e.x,e.y,28,'hurt');sfx('hurt')}}
   else if(d>contact){e.x+=ex/d*e.speed*60*dt;e.y+=ey/d*e.speed*60*dt}
   else {e.attack-=dt;if(e.attack<=0){e.attack=2.1;e.jumpT=.65;e.jumpA=Math.atan2(ey,ex);burst(e.x,e.y,12,'slash');toast('HEART BRUTE HEADBUTT! 💥')}}
 } else if(e.type==='guard'){
   if(d>170){e.x+=ex/d*e.speed*60*dt;e.y+=ey/d*e.speed*60*dt}else{e.attack-=dt;if(e.attack<=0){e.attack=1.25;hurtPlayer(e.atk);burst(e.x,e.y,10,'slash')}}
 } else if(e.type==='mimic'){
   if(d>130){e.x+=ex/d*e.speed*60*dt;e.y+=ey/d*e.speed*60*dt}else{e.attack-=dt;if(e.attack<=0){e.attack=1.55;const a=Math.atan2(ey,ex);arena.projectiles.push({x:e.x,y:e.y,vx:Math.cos(a)*4.5,vy:Math.sin(a)*4.5,life:2.2,damage:e.atk*.9,angle:a,owner:'enemy'})}}
 } else if(e.type==='sentinel'){
   if(d>150){e.x+=ex/d*e.speed*60*dt;e.y+=ey/d*e.speed*60*dt}else{e.attack-=dt;if(e.attack<=0){e.attack=1.7;const a=Math.atan2(ey,ex);arena.projectiles.push({x:e.x,y:e.y,vx:Math.cos(a)*4.1,vy:Math.sin(a)*4.1,life:2.8,damage:e.atk*.75,angle:a,owner:'enemy',kind:'arrow'})}}
 } else if(e.type==='lovebreaker'){
   e.specialCd-=dt;e.attack-=dt;
   if(e.specialCd<=0){e.specialCd=4.8;e.chargeT=.55;e.chargeA=Math.atan2(ey,ex);e.shock=true;toast('LOVE BREAKER RAMPAGE! 💔⚔️')}
   if(e.chargeT>0){e.chargeT-=dt;e.x+=Math.cos(e.chargeA)*8.5*60*dt;e.y+=Math.sin(e.chargeA)*8.5*60*dt;if(e.chargeT<=0){if(Math.hypot(e.x-p.x,e.y-p.y)<105)hurtPlayer(e.atk*2.2);for(let j=-1;j<=1;j++){const a=e.chargeA+j*.35;arena.projectiles.push({x:e.x,y:e.y,vx:Math.cos(a)*4.8,vy:Math.sin(a)*4.8,life:2.2,damage:e.atk*.55,angle:a,owner:'enemy'})}burst(e.x,e.y,35,'death')}}
   else if(d>contact+8){e.x+=ex/d*e.speed*60*dt;e.y+=ey/d*e.speed*60*dt}
   else if(e.attack<=0){e.attack=1.0;hurtPlayer(e.atk*1.25);burst(e.x,e.y,16,'slash')}
 } else if(d>contact){
   e.x+=ex/d*e.speed*60*dt;e.y+=ey/d*e.speed*60*dt;
 } else {e.attack-=dt;if(e.attack<=0){e.attack=e.type==='charger'?.48:e.type==='assassin'?.42:e.type==='berserker'?.36:e.type==='lancer'?.62:.78;hurtPlayer(e.atk)}}
 e.hit=Math.max(0,e.hit-dt);
 e.x=Math.max(-60,Math.min(arena.w+60,e.x));e.y=Math.max(-60,Math.min(arena.h+60,e.y));
}
updateProjectiles(dt);for(const q of arena.particles){q.x+=q.vx*60*dt;q.y+=q.vy*60*dt;q.vx*=.96;q.vy*=.96;q.life-=dt}arena.particles=arena.particles.filter(q=>q.life>0);for(const q of arena.slashes)q.t-=dt;arena.slashes=arena.slashes.filter(q=>q.t>0);arena.spawned=arena.spawned||0;const targetCount=arena.wave%5===0?1:arena.wave*3+4;if(arena.spawned<targetCount&&arena.enemies.length<Math.min(6+arena.wave,15)){arena.spawned++;spawnEnemy(arena.wave%5===0&&arena.spawned===1)}if(arena.spawned>=targetCount&&arena.enemies.length===0){arena.running=false;const bonus=10+arena.wave*3;addArenaMoney(bonus);gainXp(50+arena.wave*10);arenaLog('Wave '+arena.wave+' cleared! Bonus +'+bonus+' 💗');arenaStats();showUpgrade()}}
function drawArena(){const w=arena.w||800,h=arena.h||600;ac.clearRect(0,0,w,h);ac.save();if(arena.shake>0){ac.translate((Math.random()-.5)*arena.shake,(Math.random()-.5)*arena.shake);arena.shake*=.86;if(arena.shake<.2)arena.shake=0}const grad=ac.createRadialGradient(w*.5,h*.45,20,w*.5,h*.45,Math.max(w,h)*.75);grad.addColorStop(0,'#211323');grad.addColorStop(1,'#070a12');ac.fillStyle=grad;ac.fillRect(0,0,w,h);ac.strokeStyle='#ff9db51a';ac.lineWidth=1;for(let x=0;x<w;x+=55){ac.beginPath();ac.moveTo(x,0);ac.lineTo(x,h);ac.stroke()}for(let y=0;y<h;y+=55){ac.beginPath();ac.moveTo(0,y);ac.lineTo(w,y);ac.stroke()}for(let x=30;x<w;x+=110){ac.fillStyle='#ff8fab14';ac.beginPath();ac.arc(x,45,3,0,7);ac.fill();ac.beginPath();ac.arc(x+9,48,2,0,7);ac.fill()}for(const e of arena.enemies)drawEnemy(e);drawProjectiles();drawPlayer(arena.player);for(const q of arena.particles){ac.globalAlpha=Math.max(0,q.life/q.max);ac.fillStyle=q.kind==='death'?'#ff9db5':q.kind==='hurt'?'#fff':'#ffd2df';ac.beginPath();ac.arc(q.x,q.y,q.size,0,7);ac.fill()}ac.globalAlpha=1;coopDrawPlayers();for(const q of arena.slashes){ac.save();ac.translate(q.x,q.y);ac.rotate(q.angle);ac.globalAlpha=q.t/.22;ac.strokeStyle='#fff0f5';ac.shadowColor='#ff6e94';ac.shadowBlur=18;ac.lineWidth=7;ac.beginPath();ac.arc(18,0,55,-1.0,.8);ac.stroke();ac.strokeStyle='#ff87a7';ac.lineWidth=3;ac.beginPath();ac.arc(18,0,62,-1.0,.8);ac.stroke();ac.restore()}ac.restore()}
function drawPlayer(p){ac.save();ac.translate(p.x,p.y);if(p.inv>0&&Math.floor(p.inv*20)%2===0)ac.globalAlpha=.45;ac.fillStyle='#ffafc2';ac.shadowColor='#ff5f89';ac.shadowBlur=18;ac.beginPath();ac.arc(0,-20,11,0,7);ac.fill();ac.fillStyle='#f4d9df';ac.shadowBlur=0;ac.fillRect(-10,-8,20,30);ac.fillStyle='#7d3550';ac.fillRect(-10,22,7,19);ac.fillRect(3,22,7,19);ac.fillStyle='#160911';ac.fillRect(-28,-48,56,6);ac.fillStyle='#ff6f91';ac.fillRect(-28,-48,56*Math.max(0,p.hp/combatStats().maxHp),6);ac.strokeStyle='#ffd8e2';ac.lineWidth=1;ac.strokeRect(-28,-48,56,6);const a=p.angle;if(arenaState.activeWeaponType==='bow'){ac.strokeStyle='#d9a9bc';ac.lineWidth=3;ac.beginPath();ac.arc(Math.cos(a)*24,Math.sin(a)*24,20,a-1.1,a+1.1);ac.stroke();ac.strokeStyle='#fff0f5';ac.lineWidth=2;ac.beginPath();ac.moveTo(Math.cos(a)*4,Math.sin(a)*4);ac.lineTo(Math.cos(a)*44,Math.sin(a)*44);ac.stroke()}else{ac.strokeStyle='#fff';ac.lineWidth=4;ac.beginPath();ac.moveTo(Math.cos(a)*4,Math.sin(a)*4);ac.lineTo(Math.cos(a)*32,Math.sin(a)*32);ac.stroke();ac.strokeStyle='#ffb8c9';ac.lineWidth=2;ac.beginPath();ac.moveTo(Math.cos(a)*28,Math.sin(a)*28);ac.lineTo(Math.cos(a)*62,Math.sin(a)*62);ac.stroke()}ac.fillStyle='#ff6e95';ac.beginPath();ac.moveTo(-7,-25);ac.quadraticCurveTo(0,-35,7,-25);ac.fill();ac.restore()}
function drawEnemy(e){
 ac.save();ac.translate(e.x,e.y);const pulse=Math.sin(performance.now()/170+e.x)*1.8;ac.globalAlpha=e.hit>0?.55:1;
 const boss=e.boss;let body='#7f243d',head='#e45b78',glow='#ff4d73';
 if(e.type==='tank'){body='#4f2c70';head='#9b68d2';glow='#a95cff'} if(e.type==='charger'){body='#7f243d';head='#e45b78'}
 if(e.type==='archer'){body='#31536b';head='#6fa7d0';glow='#6fb8ff'} if(e.type==='mage'){body='#4a2868';head='#b47cff';glow='#b47cff'}
 if(e.type==='assassin'){body='#21182c';head='#9d6aff';glow='#a46bff'} if(e.type==='lovebreaker'){body='#4b1524';head='#ff4f69';glow='#ff3156'} if(e.type==='brute'){body='#6b3340';head='#e8876e';glow='#ff876d'}
 if(e.type==='splitter'){body='#59354b';head='#d16b9d';glow='#ff8cc0'} if(e.type==='lancer'){body='#4b355b';head='#d99bff';glow='#d58cff'} if(e.type==='witch'){body='#34254d';head='#aa78e8';glow='#b57cff'} if(e.type==='berserker'){body='#6f1f2d';head='#f06b5f';glow='#ff6b62'} if(e.type==='sentinel'){body='#3d4c58';head='#8bb7c9';glow='#6fd7ff'} if(e.type==='guard'){body='#4b3a3f';head='#f0a5bb';glow='#ff9ebc'} if(e.type==='mimic'){body='#4b3046';head='#d98ab4';glow='#ff86b7'} if(e.type==='witchling'){body='#35243e';head='#b77bd6';glow='#c48cff'}
 if(boss){body='#57204d';head='#e08ac7';glow='#ffbd55'}
 ac.shadowColor=glow;ac.shadowBlur=boss?30:16;ac.fillStyle=body;ac.beginPath();ac.arc(0,boss?-28:-18,(boss?20:11)+pulse*.15,0,7);ac.fill();
 ac.shadowBlur=0;ac.fillStyle=head;ac.fillRect(boss?-20:-12,boss?-5:-7,boss?40:24,boss?42:29);
 ac.fillStyle='#4b1628';ac.fillRect(boss?-15:-10,boss?37:22,10,boss?27:18);ac.fillRect(boss?5:3,boss?37:22,10,boss?27:18);
 ac.strokeStyle='#ff9eb4';ac.lineWidth=boss?3:2;ac.beginPath();ac.moveTo(boss?-15:-9,boss?-8:-10);ac.lineTo(boss?15:9,boss?10:10);ac.moveTo(boss?15:9,boss?-8:-10);ac.lineTo(boss?-15:-9,boss?10:10);ac.stroke();
 if(e.type==='charger'||e.type==='brute'){ac.fillStyle='#ffe0e9';for(const sg of [-1,1]){ac.beginPath();ac.moveTo(sg*10,-12);ac.lineTo(sg*28,-27);ac.lineTo(sg*7,-19);ac.fill()}}
 if(e.type==='archer'){ac.strokeStyle='#d7b0c0';ac.lineWidth=3;ac.beginPath();ac.arc(0,2,18,-1.1,1.1);ac.stroke();ac.strokeStyle='#ffd8e2';ac.beginPath();ac.moveTo(-16,-12);ac.lineTo(16,16);ac.stroke()}
 if(e.type==='mage'){ac.strokeStyle='#d6a9ff';ac.lineWidth=3;ac.beginPath();ac.arc(0,-4,18,0,7);ac.stroke();ac.fillStyle='#f0cfff';ac.beginPath();ac.arc(0,-4,6,0,7);ac.fill()}
 if(e.type==='assassin'){ac.fillStyle='#e5d4ff';ac.beginPath();ac.moveTo(-12,-16);ac.lineTo(-22,5);ac.lineTo(-7,-4);ac.fill();ac.beginPath();ac.moveTo(12,-16);ac.lineTo(22,5);ac.lineTo(7,-4);ac.fill()}
 if(e.type==='tank'){ac.strokeStyle='#d8b9ff';ac.lineWidth=5;ac.strokeRect(-18,-2,36,28)}
 if(e.type==='splitter'){ac.strokeStyle='#ffb7dc';ac.lineWidth=3;ac.beginPath();ac.moveTo(-14,-2);ac.lineTo(0,12);ac.lineTo(14,-2);ac.stroke()} if(e.type==='lancer'){ac.strokeStyle='#f0d9ff';ac.lineWidth=3;ac.beginPath();ac.moveTo(15,-2);ac.lineTo(34,-2);ac.stroke();ac.beginPath();ac.moveTo(34,-2);ac.lineTo(26,-7);ac.moveTo(34,-2);ac.lineTo(26,3);ac.stroke()} if(e.type==='witch'){ac.fillStyle='#f1cfff';ac.beginPath();ac.arc(0,-3,7,0,7);ac.fill();ac.strokeStyle='#d6a9ff';ac.lineWidth=3;ac.beginPath();ac.moveTo(-18,-17);ac.lineTo(0,-31);ac.lineTo(18,-17);ac.stroke()} if(e.type==='berserker'){ac.fillStyle='#ffb36a';ac.beginPath();ac.moveTo(-15,-20);ac.lineTo(-25,-35);ac.lineTo(-5,-26);ac.moveTo(15,-20);ac.lineTo(25,-35);ac.lineTo(5,-26);ac.fill()}
 const rarityColor={Common:'#b8aeb4',Uncommon:'#8ee7a8',Rare:'#72b7ff',Epic:'#d79bff',Legendary:'#ffd36b'}[e.rarity]||'#ffd6e2';
 const label=boss?e.bossDef.name.toUpperCase():e.name;
 const nameY=boss?-88:-55; ac.textAlign='center';ac.font=boss?'bold 12px Arial':'bold 9px Arial';ac.fillStyle=boss?'#ffd36b':rarityColor;ac.shadowColor=rarityColor;ac.shadowBlur=5;ac.fillText(label,0,nameY);ac.shadowBlur=0;
 if(!boss){ac.font='7px Arial';ac.fillStyle=rarityColor;ac.fillText(e.rarity.toUpperCase(),0,nameY+10)}
 if(boss){if(e.shieldT>0){ac.strokeStyle='#8ed8ff';ac.lineWidth=4;ac.beginPath();ac.arc(0,5,48,0,7);ac.stroke()}}
 const bw=Math.max(20,e.r*2);const barY=boss?-72:-34;ac.fillStyle='#160911';ac.fillRect(-bw/2,barY,bw,6);ac.fillStyle=boss?'#ffc857':'#ff728f';ac.fillRect(-bw/2,barY,bw*Math.max(0,e.hp/e.maxHp),6);ac.restore()
}

/* ===== Cloudflare Durable Object Online Co-op — SERVER AUTHORITATIVE ===== */
let coopSocket=null, coopId=null, coopRoom='', coopHost=false, coopPeers={}, coopLastNet=0, coopStarted=false;
let coopClockOffset=0, coopStartTimer=null, coopOpenedFromRunning=false;
let coopRemoteTargets={}, coopUpgradeOffer=null, coopUpgradeChosen=false, coopServerPhase='lobby';
let coopInput={x:0,y:0};
function coopUrl(room){const proto=location.protocol==='https:'?'wss:':'ws:';return proto+'//'+location.host+'/ws?room='+encodeURIComponent(room)}
function coopSetStatus(t){const el=$('coopStatus');if(el)el.textContent=t}
function coopRenderPlayers(players){
  coopPeers={};
  (players||[]).forEach(p=>{if(p.id!==coopId)coopPeers[p.id]={id:p.id,name:p.name,x:p.x||80,y:p.y||100,targetX:p.x||80,targetY:p.y||100,angle:p.angle||0,targetAngle:p.angle||0,hp:p.hp,maxHp:p.maxHp,slashT:0}});
  const g=$('coopPlayers');if(g)g.innerHTML=(players||[]).map(p=>'<span class="coop-player">'+(p.id===coopId?'💗 ':'')+(p.name||'Player')+'</span>').join('');
  updateCoopLobby();
}
function coopConnect(){
  const room=($('coopRoom').value||'LOVE').toUpperCase().replace(/[^A-Z0-9_-]/g,'').slice(0,24)||'LOVE';
  const name=($('coopName').value||'Player').slice(0,20)||'Player';coopRoom=room;
  try{if(coopSocket)coopSocket.close()}catch(e){}
  coopSocket=new WebSocket(coopUrl(room));coopSetStatus('Connecting to room '+room+'…');
  coopSocket.onopen=()=>{coopSocket.send(JSON.stringify({type:'join',name,stats:coopStats()}));coopSetStatus('🟢 Connected • Room: '+room);$('coopModal').classList.add('hidden');showCoopStart(true);updateCoopLobby();toast('Online co-op connected 🌐')};
  coopSocket.onclose=()=>{coopSetStatus('🔴 Disconnected');coopSocket=null;showCoopStart(false)};
  coopSocket.onerror=()=>coopSetStatus('⚠️ Connection error');
  coopSocket.onmessage=e=>{try{coopHandle(JSON.parse(e.data))}catch(err){console.error(err)}};
}
function coopStats(){const c=combatStats();return {atk:c.atk,spd:c.spd,maxHp:c.maxHp,armor:c.armor,crit:c.crit}}
function coopSend(msg){if(coopSocket&&coopSocket.readyState===1)coopSocket.send(JSON.stringify(msg))}
function coopHandle(m){
  if(m.type==='welcome'){coopId=m.id;coopClockOffset=(m.serverNow||Date.now())-Date.now();coopServerPhase=m.phase||'lobby';if(m.state)coopApplyState(m.state);updateCoopLobby();return}
  if(m.type==='players'){coopRenderPlayers(m.players);return}
  if(m.type==='serverStart'){coopStarted=true;coopServerPhase='battle';const startAt=m.startAt||Date.now()+500;const delay=Math.max(0,startAt-coopClockOffset-Date.now());clearTimeout(coopStartTimer);coopSetStatus('🟢 Server battle starts in '+(delay/1000).toFixed(1)+'s');coopStartTimer=setTimeout(()=>beginCoopBattle(false),delay);return}
  if(m.type==='state'){if(m.serverNow)coopClockOffset=(m.serverNow-Date.now())*.25+coopClockOffset*.75;coopServerPhase=m.phase||coopServerPhase;coopApplyState(m);if(m.phase==='battle'){arena.running=true;showCoopStart(false)}else if(m.phase==='upgrade'){arena.running=false}updateCoopLobby();return}
  if(m.type==='reward'){if(m.reward)addArenaMoney(Number(m.reward)||0);if(m.xp)gainXp(Number(m.xp)||0);return}
  if(m.type==='fx'){if(m.from!==coopId&&m.kind==='attack'){const p=coopPeers[m.from];if(p){p.slashT=.22;p.angle=m.angle||0}arena.slashes.push({x:m.x,y:m.y,angle:m.angle||0,t:.22,remote:true});burst(m.x,m.y,8,'slash')}return}
  if(m.type==='upgradeOffer'){coopServerPhase='upgrade';coopUpgradeOffer={id:m.offerId,choices:m.choices||[]};coopUpgradeChosen=false;arena.running=false;showUpgrade(coopUpgradeOffer.choices,true);coopSetStatus('✨ Choose your upgrade');return}
  if(m.type==='upgradePicked'){if(m.playerId===coopId&&m.choice)applyUpgradeChoice(m.choice);return}
  if(m.type==='upgradeProgress'){const st=$('coopStartStatus');if(st)st.textContent='Upgrade chosen by '+(m.picked||0)+' / '+(m.total||1)+' players';return}
  if(m.type==='upgradeReady'){coopServerPhase='battle';coopUpgradeOffer=null;coopUpgradeChosen=false;const startAt=m.startAt||Date.now()+500;const delay=Math.max(0,startAt-coopClockOffset-Date.now());clearTimeout(coopStartTimer);coopSetStatus('🟢 Next wave in '+(delay/1000).toFixed(1)+'s');coopStartTimer=setTimeout(()=>applyCoopUpgradeReady(m.wave),delay);return}
  if(m.type==='gameStop'){coopStarted=false;coopServerPhase='lobby';clearTimeout(coopStartTimer);arena.running=false;showCoopStart(true);updateCoopLobby();return}
}
function coopApplyState(m){
  if(Number.isFinite(m.wave))arena.wave=m.wave;
  if(m.phase)coopServerPhase=m.phase;
  if(m.player){arena.player.x=m.player.x;arena.player.y=m.player.y;arena.player.hp=m.player.hp;arena.player.maxHp=m.player.maxHp||arena.player.maxHp;arena.player.angle=m.player.angle||arena.player.angle;}
  if(Array.isArray(m.players)){
    m.players.forEach(p=>{if(p.id===coopId)return;let q=coopPeers[p.id]||(coopPeers[p.id]={id:p.id,name:p.name||'Player',x:p.x||80,y:p.y||100,targetX:p.x||80,targetY:p.y||100,angle:0,targetAngle:0,slashT:0});q.name=p.name||q.name;q.targetX=p.x;q.targetY=p.y;q.targetAngle=p.angle||0;q.hp=p.hp;q.maxHp=p.maxHp});
  }
  if(Array.isArray(m.enemies)){
    const incoming=new Set();
    for(const e of m.enemies){incoming.add(e.id);let q=arena.enemies.find(x=>x.id===e.id);if(!q){q=Object.assign({},e,{targetX:e.x,targetY:e.y});arena.enemies.push(q)}else{q.targetX=e.x;q.targetY=e.y;q.hp=e.hp;q.maxHp=e.maxHp;q.r=e.r;q.type=e.type;q.boss=e.boss;q.bossIndex=e.bossIndex;q.bossDef=e.bossDef;q.name=e.name;q.rarity=e.rarity;q.hit=e.hit;q.attack=e.attack}}
    arena.enemies=arena.enemies.filter(e=>incoming.has(e.id));
  }
}
function coopDrawPlayers(){if(!coopSocket)return;for(const p of Object.values(coopPeers)){ac.save();ac.translate(p.x,p.y);ac.rotate(p.angle||0);ac.shadowColor='#ff9fbd';ac.shadowBlur=20;ac.fillStyle='#ff6f9a';ac.beginPath();ac.arc(0,-18,11,0,Math.PI*2);ac.fill();ac.shadowBlur=0;ac.fillStyle='#ff9eb4';ac.fillRect(-12,-7,24,28);ac.fillStyle='#4b1628';ac.fillRect(-10,21,8,17);ac.fillRect(2,21,8,17);ac.fillStyle='#fff';ac.font='bold 10px Arial';ac.textAlign='center';ac.fillText(p.name||'Player',0,-40);if(p.slashT>0){ac.strokeStyle='#fff0f5';ac.lineWidth=6;ac.globalAlpha=Math.min(1,p.slashT/.22);ac.beginPath();ac.arc(18,0,55,-1,.8);ac.stroke()}ac.restore()}}
function coopClientVisualTick(dt){
  for(const p of Object.values(coopPeers)){const k=Math.min(1,dt*18);p.x+=(p.targetX-p.x)*k;p.y+=(p.targetY-p.y)*k;p.angle=p.targetAngle||p.angle||0;p.slashT=Math.max(0,(p.slashT||0)-dt)}
  for(const e of arena.enemies){if(Number.isFinite(e.targetX)){const k=Math.min(1,dt*16);e.x+=(e.targetX-e.x)*k;e.y+=(e.targetY-e.y)*k}e.hit=Math.max(0,(e.hit||0)-dt);e.attack=Math.max(0,(e.attack||0)-dt)}
  for(const q of arena.slashes)q.t-=dt;arena.slashes=arena.slashes.filter(q=>q.t>0);
  for(const q of arena.particles){q.x+=q.vx*60*dt;q.y+=q.vy*60*dt;q.vx*=.96;q.vy*=.96;q.life-=dt}arena.particles=arena.particles.filter(q=>q.life>0);
}
function coopTick(){if(!coopSocket||coopSocket.readyState!==1||!coopStarted)return;const p=arena.player,now=performance.now();if(now-coopLastNet>50){coopLastNet=now;const dx=(arena.keys.d||arena.keys.ArrowRight?1:0)-(arena.keys.a||arena.keys.ArrowLeft?1:0),dy=(arena.keys.s||arena.keys.ArrowDown?1:0)-(arena.keys.w||arena.keys.ArrowUp?1:0);coopInput={x:dx,y:dy};coopSend({type:'input',x:dx,y:dy,angle:p.angle||0})}}
function showCoopStart(show){const el=$('coopStartOverlay');if(el)el.classList.toggle('hidden',!show);if(show)updateCoopLobby()}
function updateCoopLobby(){const total=Object.keys(coopPeers).length+(coopId?1:0),st=$('coopStartStatus'),btn=$('coopStartBattle'),txt=$('coopStartText');if(st)st.textContent=coopServerPhase==='battle'?'⚔️ Battle running • '+total+' players':coopServerPhase==='upgrade'?'✨ Everyone is choosing an upgrade':'🟢 Server room • '+total+' player'+(total===1?'':'s');if(btn){btn.disabled=!coopSocket||coopSocket.readyState!==1||coopServerPhase!=='lobby';btn.textContent=coopServerPhase==='lobby'?'▶ START BATTLE':'⚔️ BATTLE RUNNING'}if(txt)txt.textContent='Cloudflare server controls the battle clock, enemies, waves and upgrades. No player is the host.'}
function resetArenaRun(){arena.running=false;arena.wave=1;arena.spawned=0;arena.enemies=[];arena.projectiles=[];arena.particles=[];arena.slashes=[];resetWaveUpgrades();arena.player={x:0,y:0,hp:combatStats().maxHp,dir:1,angle:0,attackCd:0,slashT:0,inv:0,skillCd:0};resizeArena();arenaStats()}
function beginCoopBattle(announce=true){if(arenaModal.classList.contains('hidden'))arenaModal.classList.remove('hidden');$('coopModal').classList.add('hidden');showCoopStart(false);arena.running=true;initArenaAudio();arenaStats();arenaLog('⚔️ Cloudflare server battle started!');if(announce)coopSend({type:'startRequest',stats:coopStats()})}
function coopStart(){coopStarted=false;coopServerPhase='lobby';clearTimeout(coopStartTimer);resetArenaRun();showCoopStart(true);updateCoopLobby();coopConnect()}
$('lsaCoopBtn').onclick=()=>{coopOpenedFromRunning=!!arena.running;arena.running=false;$('coopModal').classList.remove('hidden');showCoopStart(false);coopSetStatus('Offline');updateCoopLobby()};
$('coopClose').onclick=()=>{$('coopModal').classList.add('hidden');arena.running=false;showCoopStart(false);coopOpenedFromRunning=false};
$('coopHost').onclick=()=>coopStart();$('coopJoin').onclick=()=>coopStart();$('coopRandom').onclick=()=>{$('coopRoom').value=Math.random().toString(36).slice(2,8).toUpperCase()};
$('coopStartBattle').onclick=()=>{if(coopSocket&&coopSocket.readyState===1&&coopServerPhase==='lobby'){coopSend({type:'startRequest',stats:coopStats()})}};
const originalSlash=slash;
slash=function(angle){
  if(coopSocket&&coopSocket.readyState===1&&coopStarted){arena.player.angle=angle;arena.player.slashT=.22;arena.player.attackCd=.27;arena.slashes.push({x:arena.player.x,y:arena.player.y,angle,t:.22,remote:false});burst(arena.player.x+Math.cos(angle)*35,arena.player.y+Math.sin(angle)*35,7,'slash');sfx('slash');coopSend({type:'attack',x:arena.player.x,y:arena.player.y,angle,weapon:arenaState.activeWeaponType==='bow'?'bow':'sword',stats:coopStats()});return}originalSlash(angle)};
let arenaSimTimer=null,arenaSimLast=0,arenaSimAccum=0;
function arenaSimulationTick(now){if(!arena.running){arenaSimLast=now;arenaSimAccum=0;return}if(!arenaSimLast)arenaSimLast=now;let elapsed=Math.max(0,Math.min(2.5,(now-arenaSimLast)/1000));arenaSimLast=now;arenaSimAccum+=elapsed;const step=1/60;let steps=0;while(arenaSimAccum>=step&&steps<150){if(coopStarted){coopTick();coopClientVisualTick(step)}else updateArena(step);arenaSimAccum-=step;steps++}if(steps>=150)arenaSimAccum=0}
function arenaRenderLoop(){drawArena();if(arenaModal&&!arenaModal.classList.contains('hidden'))requestAnimationFrame(arenaRenderLoop)}
function startArenaSimulation(){if(arenaSimTimer)clearInterval(arenaSimTimer);arenaSimLast=performance.now();arenaSimAccum=0;arenaSimTimer=setInterval(()=>arenaSimulationTick(performance.now()),16)}
function stopArenaSimulation(){if(arenaSimTimer){clearInterval(arenaSimTimer);arenaSimTimer=null}arenaSimLast=0;arenaSimAccum=0}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)arenaSimulationTick(performance.now())});
function arenaLoop(){if(!arenaSimTimer)startArenaSimulation();arenaRenderLoop()}
function startArena(){initArenaAudio();arenaModal.classList.remove('hidden');$('lsaArchive').classList.add('hidden');resetArenaRun();arena.running=true;arenaStats();arenaLog('Enter the arena. Broken-heart fighters are coming...');requestAnimationFrame(arenaLoop)}
function endArena(){arena.running=false;arenaModal.classList.add('hidden');showCoopStart(false);coopStarted=false;try{if(coopSocket)coopSocket.close()}catch(e){}coopSocket=null;coopId=null;coopPeers={};coopServerPhase='lobby';saveArena()}
function useSkill(){const sk=arenaState.skills[0];if(!arena.running||!sk||arena.player.skillCd>0)return;const p=arena.player;if(sk.id==='nova'){arena.player.skillCd=8;const cs=combatStats();arena.shake=12;for(const e of [...arena.enemies]){const d=Math.hypot(e.x-p.x,e.y-p.y);if(d<190){damageEnemy(e,cs.atk*3)}}burst(p.x,p.y,40,'death');sfx('level');toast('HEART NOVA! 💗')}else if(sk.id==='barrage'){arena.player.skillCd=10;const cs=combatStats();for(let j=-2;j<=2;j++){const a=p.angle+j*.18;arena.slashes.push({x:p.x,y:p.y,angle:a,t:.35});for(const e of [...arena.enemies]){const dd=Math.hypot(e.x-p.x,e.y-p.y);let da=Math.atan2(e.y-p.y,e.x-p.x)-a;da=Math.atan2(Math.sin(da),Math.cos(da));if(dd<165&&Math.abs(da)<.65)damageEnemy(e,cs.atk*2.2)}}burst(p.x,p.y,35,'slash');sfx('level');toast('ROSE BARRAGE! 🌹')}else if(sk.id==='moon'){arena.player.skillCd=7;const cs=combatStats();const a=p.angle;arena.projectiles.push({x:p.x,y:p.y,vx:Math.cos(a)*7,vy:Math.sin(a)*7,life:2.2,damage:cs.atk*5,angle:a,owner:'playerSkill',wide:true});arena.slashes.push({x:p.x,y:p.y,angle:a,t:.35});burst(p.x+Math.cos(a)*30,p.y+Math.sin(a)*30,24,'slash');sfx('level');toast('MOON SLASH! 🌙')}else if(sk.id==='storm'){arena.player.skillCd=12;const cs=combatStats();for(let i=0;i<10;i++){const a=Math.random()*Math.PI*2,d=70+Math.random()*220;arena.projectiles.push({x:p.x+Math.cos(a)*d,y:p.y+Math.sin(a)*d,vx:0,vy:0,life:1.0,damage:cs.atk*1.5,angle:a,owner:'playerSkill',rain:true,t:0});}for(const e of [...arena.enemies]){if(Math.hypot(e.x-p.x,e.y-p.y)<260)damageEnemy(e,cs.atk*2.5)}burst(p.x,p.y,45,'death');sfx('level');toast('HEARTSTORM! 💞')}else if(sk.id==='dash'){arena.player.skillCd=5;const cs=combatStats();const nx=p.x+Math.cos(p.angle)*180,ny=p.y+Math.sin(p.angle)*180;p.x=Math.max(30,Math.min(arena.w-30,nx));p.y=Math.max(62,Math.min(arena.h-30,ny));arena.slashes.push({x:p.x,y:p.y,angle:p.angle,t:.3});for(const e of [...arena.enemies]){if(Math.hypot(e.x-p.x,e.y-p.y)<75)damageEnemy(e,cs.atk*2)}burst(p.x,p.y,28,'slash');sfx('slash');toast('LOVE DASH! ✨')}arenaStats()}
const shopItems=[
 ['⚔️','Crimson Rose Blade','Attack +8',90,'sword','Crimson Rose Blade',()=>arenaState.stats.atk+=8*arenaState.mult],
 ['✨','Soul Edge','Attack +18 • Crit +5%',300,'sword','Soul Edge',()=>{arenaState.stats.atk+=18*arenaState.mult;arenaState.stats.crit+=.05}],
 ['🗡️','Heartpiercer','Attack +30 • Crit +8%',700,'sword','Heartpiercer',()=>{arenaState.stats.atk+=30*arenaState.mult;arenaState.stats.crit+=.08}],
 ['🌹','Rosefang','Attack +42 • Crit +10%',1300,'sword','Rosefang',()=>{arenaState.stats.atk+=42*arenaState.mult;arenaState.stats.crit+=.10}],
 ['💘','Cupid Greatsword','Attack +60 • HP +80',2200,'sword','Cupid Greatsword',()=>{arenaState.stats.atk+=60*arenaState.mult;arenaState.stats.maxHp+=80*arenaState.mult}],
 ['🏹','Cupid Bow','Ranged • Attack +35%',1800,'bow','Cupid Bow',()=>arenaState.stats.atk+=35*arenaState.mult],
 ['🌙','Moonbow','Ranged • Attack +55% • Crit +4%',3200,'bow','Moonbow',()=>{arenaState.stats.atk+=55*arenaState.mult;arenaState.stats.crit+=.04}],
 ['🌹','Rose Longbow','Ranged • Attack +75% • Crit +8%',5200,'bow','Rose Longbow',()=>{arenaState.stats.atk+=75*arenaState.mult;arenaState.stats.crit+=.08}],
 ['💔','Heartpiercing Bow','Ranged • Attack +95% • Crit +12%',8000,'bow','Heartpiercing Bow',()=>{arenaState.stats.atk+=95*arenaState.mult;arenaState.stats.crit+=.12}],
 ['👑','Divine Cupid Bow','Ranged • Attack +130% • Crit +18%',14000,'bow','Divine Cupid Bow',()=>{arenaState.stats.atk+=130*arenaState.mult;arenaState.stats.crit+=.18}],
 ['🛡️','Roseguard Armor','Armor +8 • HP +30',120,'armor','Roseguard Armor',()=>{arenaState.stats.armor+=8*arenaState.mult;arenaState.stats.maxHp+=30*arenaState.mult}],
 ['❤️','Lover Plate','HP +80',180,'armor','Lover Plate',()=>arenaState.stats.maxHp+=80*arenaState.mult],
 ['💎','Heartguard Mail','Armor +16 • HP +50',360,'armor','Heartguard Mail',()=>{arenaState.stats.armor+=16*arenaState.mult;arenaState.stats.maxHp+=50*arenaState.mult}],
 ['💖','Valentine Aegis','Armor +28 • HP +150',800,'armor','Valentine Aegis',()=>{arenaState.stats.armor+=28*arenaState.mult;arenaState.stats.maxHp+=150*arenaState.mult}],
 ['🌹','Rose Knight Plate','Armor +40 • HP +220',1400,'armor','Rose Knight Plate',()=>{arenaState.stats.armor+=40*arenaState.mult;arenaState.stats.maxHp+=220*arenaState.mult}],
 ['👑','Heart Crown','Crit +10%',160,'acc','Heart Crown',()=>arenaState.stats.crit+=.1],
 ['💨','Cupid Boots','Speed +0.7',130,'acc','Cupid Boots',()=>arenaState.stats.spd+=.7*arenaState.mult],
 ['🪽','Angel Charm','Speed +1.2 • Armor +4',420,'acc','Angel Charm',()=>{arenaState.stats.spd+=1.2*arenaState.mult;arenaState.stats.armor+=4*arenaState.mult}],
 ['💗','Lover Locket','HP +120 • Crit +3%',550,'acc','Lover Locket',()=>{arenaState.stats.maxHp+=120*arenaState.mult;arenaState.stats.crit+=.03}],
 ['🩷','Heart Ring','Crit +15% • HP +70',950,'acc','Heart Ring',()=>{arenaState.stats.crit+=.15;arenaState.stats.maxHp+=70*arenaState.mult}],
 ['🪽','Lover Wings','Speed +1.8 • Armor +8',1100,'acc','Lover Wings',()=>{arenaState.stats.spd+=1.8*arenaState.mult;arenaState.stats.armor+=8*arenaState.mult}]
];
const skillLoot={
 common:[['💗','Love Spark','nova'],['✨','Quick Kiss','dash']], uncommon:[['🌹','Rose Barrage','barrage'],['🌙','Moon Slash','moon']], rare:[['💞','Heartstorm','storm'],['💫','Lunar Bloom','moon']], epic:[['💥','Passion Break','barrage'],['🌌','Heart Eclipse','storm']], legendary:[['👑','Divine Love','nova'],['🔥','Rose Cataclysm','moon']]
};
const passiveLoot={common:[['iron','Iron Heart','Max HP +10%'],['swift','Swift Heart','Speed +8%']],uncommon:[['sharp','Sharp Love','Attack +12%'],['crit','Critical Kiss','Crit +5%']],rare:[['thorn','Thorn Armor','Armor +15%'],['fortune','Fortune Heart','Balance rewards +15%']],epic:[['guardian','Guardian Soul','Damage taken -8%']],legendary:[['vamp','Vampire Rose','Heal 4% max HP on kill'],['eternal','Eternal Heart','All core stats +6%']]};
const arrowLoot={common:[['Basic Arrow','Normal damage'],['Light Arrow','+10% speed']],uncommon:[['Fire Arrow','Burn damage over time'],['Ice Arrow','Slow on hit'],['Piercing Arrow','Passes through enemies']],rare:[['Poison Arrow','Poison damage over time'],['Explosive Arrow','Small area explosion']],epic:[['Chain Arrow','Can hit a second target'],['Moon Arrow','+70% arrow damage']],legendary:[['Cupid Arrow','+100% arrow damage + charm burst'],['Eternal Rose Arrow','+140% arrow damage + piercing']]};
const arrowRarity={};for(const [r,arr] of Object.entries(arrowLoot))for(const a of arr)arrowRarity[a[0]]=r;
const chestDefs=[
 {id:'wood',name:'Wooden Chest',icon:'🪵',cost:350,weights:{common:.64,uncommon:.24,rare:.09,epic:.025,legendary:.005}},
 {id:'silver',name:'Silver Chest',icon:'🥈',cost:1100,weights:{common:.32,uncommon:.34,rare:.22,epic:.10,legendary:.02}},
 {id:'legend',name:'Legendary Chest',icon:'👑',cost:3000,weights:{common:.12,uncommon:.23,rare:.30,epic:.25,legendary:.10}}
];
function weightedRarity(weights){let r=Math.random(),sum=0;for(const k of ['common','uncommon','rare','epic','legendary']){sum+=weights[k];if(r<sum)return k}return 'common'}
function chanceText(w){return ['common','uncommon','rare','epic','legendary'].map(k=>k[0].toUpperCase()+k.slice(1)+': '+(w[k]*100).toFixed(1)+'%').join(' • ')}
function lootPreview(pool){return Object.entries(pool).map(([r,arr])=>'<div class="lsa-loot-row"><b>'+r.toUpperCase()+'</b> '+arr.map(x=>x[1]||x[0]).join(', ')+'</div>').join('')}
function lastLootPanel(cat){const l=arenaState.lastLoot;if(!l)return '<div class="lsa-lastloot"><b>🎁 Latest Chest Loot</b><div>No chest opened yet.</div></div>';return '<div class="lsa-lastloot"><b>🎁 Latest Chest Loot</b><div><strong>'+l.name+'</strong> • '+l.rarity.toUpperCase()+'</div><div>'+l.desc+'</div></div>'}
function openChest(kind,mode='skill'){const chest=chestDefs.find(c=>c.id===kind);if(!chest||loveBalance<chest.cost){toast('Not enough Balance 💗');return}loveBalance-=chest.cost;updateBalance();const rarity=weightedRarity(chest.weights);const pool=mode==='passive'?passiveLoot[rarity]:mode==='arrow'?arrowLoot[rarity]:skillLoot[rarity];const item=pool[Math.floor(Math.random()*pool.length)];if(mode==='arrow'){arenaState.gear.arrow=item[0];arenaState.lastLoot={name:item[0],rarity,desc:item[1],category:'Bow'};toast(chest.icon+' '+item[0]+' • '+rarity.toUpperCase()+'!');arenaLog('Arrow chest: '+item[0]+' ('+rarity+')')}else if(mode==='passive'){if(!arenaState.passives.includes(item[0])){arenaState.passives.push(item[0]);arenaState.lastLoot={name:item[1],rarity,desc:item[2],category:'Passive'};toast(chest.icon+' '+item[1]+' • '+rarity.toUpperCase()+'!');arenaLog('Chest: '+item[1]+' ('+rarity+')')}else{const refund=Math.floor(chest.cost*.35);addArenaMoney(refund);toast(item[1]+' duplicate • +'+refund+' 💗')}}else{const id=item[2];if(!arenaState.skills.some(s=>s.id===id)){arenaState.skills.unshift({id,name:item[1],rarity});arenaState.lastLoot={name:item[1],rarity,desc:'Skill • '+rarity,category:'Skill'};toast(chest.icon+' '+item[1]+' • '+rarity.toUpperCase()+'!');arenaLog('Skill chest: '+item[1]+' ('+rarity+')')}else{const refund=Math.floor(chest.cost*.35);addArenaMoney(refund);toast(item[1]+' duplicate • +'+refund+' 💗')}}saveArena();arenaStats();renderShop(shopCategory)}
let shopCategory='skill';
function renderShop(cat=shopCategory){shopCategory=cat;const grid=$('lsaShopGrid');grid.innerHTML='';document.querySelectorAll('.lsa-shop-tab').forEach(b=>b.classList.toggle('active',b.dataset.cat===cat));
 if(cat==='skill'||cat==='passive'){const mode=cat==='passive'?'passive':'skill';const pool=mode==='passive'?passiveLoot:skillLoot;grid.innerHTML=lastLootPanel(cat)+'<div class="lsa-chance-panel"><b>Chest rarity chances</b><div class="lsa-chances">'+chestDefs.map(c=>'<div><strong>'+c.icon+' '+c.name+'</strong><br>'+chanceText(c.weights)+'</div>').join('')+'</div><div class="lsa-preview"><b>Possible '+(mode==='passive'?'Passives':'Skills')+'</b>'+lootPreview(pool)+'</div></div>'+chestDefs.map(c=>'<div class="lsa-item"><div class="ico">'+c.icon+'</div><b>'+c.name+'</b><span>'+c.cost+' 💗 • Random '+(mode==='passive'?'Passive':'Skill')+'</span><button data-chest="'+c.id+'">Open</button></div>').join('');grid.querySelectorAll('button').forEach(b=>b.onclick=()=>openChest(b.dataset.chest,mode));return}
 if(cat==='bow')grid.innerHTML=lastLootPanel(cat);
 shopItems.filter(it=>it[4]===cat).forEach(it=>{const d=document.createElement('div');d.className='lsa-item';d.innerHTML='<div class="ico">'+it[0]+'</div><b>'+it[1]+'</b><span>'+it[2]+' • 💗 '+it[3]+'</span><button>Buy</button>';d.querySelector('button').onclick=()=>{if(loveBalance<it[3]){toast('Not enough Balance 💗');return}loveBalance-=it[3];updateBalance();it[6]();if(cat==='sword'||cat==='bow'){arenaState.gear[cat==='sword'?'weapon':'bow']=it[1];arenaState.activeWeapon=it[1];arenaState.activeWeaponType=cat}else arenaState.gear[it[4]]=it[1];saveArena();arenaStats();toast('Equipped '+it[1]+' ✨');arenaLog('Purchased '+it[1]);renderShop(cat)};grid.appendChild(d)});
 if(cat==='bow'){const sep=document.createElement('div');sep.className='lsa-divider';sep.innerHTML='<h3>🏹 Arrow Types — Random Loot</h3><p>11 different arrow types. Open a chest for a random arrow; rarity is chance-based.</p><div class=\"lsa-chances\">'+chestDefs.map(c=>'<div><strong>'+c.icon+' '+c.name+'</strong><br>'+chanceText(c.weights)+'</div>').join('')+'</div><div class=\"lsa-preview\">'+lootPreview(arrowLoot)+'</div>';grid.appendChild(sep);chestDefs.forEach(c=>{const d=document.createElement('div');d.className='lsa-item';d.innerHTML='<div class=\"ico\">'+c.icon+'</div><b>'+c.name+' — Arrow Chest</b><span>'+c.cost+' 💗</span><button>Open</button>';d.querySelector('button').onclick=()=>openChest(c.id,'arrow');grid.appendChild(d)})}
}
function openShop(){renderShop('skill');$('lsaShop').classList.remove('hidden');arena.running=false}
function doRebirth(){if(arenaState.level<50)return;arenaState.rebirths++;arenaState.mult*=1.1;arenaState.level=1;arenaState.xp=0;arenaState.stats=Object.assign({},arenaBase);arenaState.gear={weapon:'Rose Blade',bow:'Cupid Bow',armor:'Love Cloth',acc:'None',arrow:'Basic Arrow'};arenaState.activeWeapon='Rose Blade';arenaState.activeWeaponType='sword';arena.player.hp=arenaState.stats.maxHp;saveArena();sfx('rebirth');toast('REBIRTH! Multiplier is now ×'+arenaState.mult.toFixed(2));arenaLog('Rebirth completed. Stats reset, multiplier increased.');arenaStats()}
const enemyArchive=[
 ['Broken Heart','Common',55,'HP 49 + wave scaling','Damage 8 + wave scaling','Basic melee fighter.'],
 ['Heart Charger','Uncommon',6.25,'HP 39 + wave scaling','Damage 10 + wave scaling','Very fast rush attacker.'],
 ['Heart Duelist','Uncommon',6.25,'HP 56 + wave scaling','Damage 13 + wave scaling','Fast melee fighter with high contact damage.'],
 ['Cupid Archer','Uncommon',6.25,'HP 44 + wave scaling','Ranged damage','Keeps distance and fires arrows.'],
 ['Rose Lancer','Uncommon',6.25,'HP 61 + wave scaling','Damage 15 + wave scaling','Long-reach lance attacker.'],
 ['Grief Tank','Rare',3.25,'HP 107 + wave scaling','Damage 11 + wave scaling','Slow armored bruiser.'],
 ['Heart Mage','Rare',3.25,'HP 49 + wave scaling','Triple projectile','Keeps distance and fires three magic shots.'],
 ['Split Heart','Rare',3.25,'HP 73 + wave scaling','Damage 9 + wave scaling','Splits into two Broken Hearts on death.'],
 ['Rose Sentinel','Rare',2.6,'HP 81 + wave scaling','Ranged damage','Slow guardian that fires precise arrows.'],
 ['Cupid Guard','Uncommon',5.0,'HP 56 + wave scaling','Damage 13 + wave scaling','Slow shielded melee guardian.'],
 ['Heart Mimic','Rare',2.6,'HP 68 + wave scaling','Ranged burst','Deceptive mimic that fires a heavy heart bolt.'],
 ['Love Assassin','Epic',1.5,'HP 35 + wave scaling','Damage 16 + wave scaling','Extremely fast and dangerous.'],
 ['Heart Brute','Epic',1.5,'HP 132 + wave scaling','Headbutt damage','Slow jumper that leaps and headbutts.'],
 ['Love Berserker','Epic',1.5,'HP 66 + wave scaling','Damage 16 + wave scaling','Fast berserker with rapid attacks.'],
 ['Love Breaker','Epic',1.5,'HP 98 + wave scaling','Rampage damage','Charges and follows with projectile bursts.'],
 ['Heart Witch','Legendary',1,'HP 51 + wave scaling','Fireball damage','Slow caster. Every 9.5s summons one unique Witchling.'],
 ['Witchling','Common (Witch summon)',0,'HP 28 + wave scaling','Damage 4 + wave scaling','Slow melee minion created only by Heart Witch.']
];
const bossArchive=bossDefs.map(b=>[b.name,'Boss',0,'Boss HP multiplier ×'+b.hp,'Boss damage multiplier ×'+b.atk,b.skill+' special ability']);
function renderArchive(){const g=$('lsaArchiveGrid');g.innerHTML=enemyArchive.concat(bossArchive).map(x=>'<div class="lsa-enemy-card"><h4>'+x[0]+'</h4><div class="rar">'+x[1]+(x[2]?' • Spawn chance '+x[2]+'%':'')+'</div><p><b>HP:</b> '+x[3]+'<br><b>Damage:</b> '+x[4]+'<br>'+x[5]+'</p></div>').join('')}
document.querySelectorAll('.lsa-shop-tab').forEach(b=>b.onclick=()=>renderShop(b.dataset.cat));$('lsaShopBtn').onclick=openShop;$('lsaArchiveBtn').onclick=()=>{$('lsaArchive').classList.remove('hidden');arena.running=false;renderArchive()};$('lsaArchiveClose').onclick=()=>{$('lsaArchive').classList.add('hidden');arena.running=true};$('lsaShopClose').onclick=()=>{$('lsaShop').classList.add('hidden');arena.running=true};$('lsaRestart').onclick=()=>{arena.enemies=[];arena.projectiles=[];arena.wave=1;arena.spawned=0;resetWaveUpgrades();arena.player.hp=combatStats().maxHp;arena.running=true;arenaStats();arenaLog('Run restarted — character progression kept.')};$('lsaRebirthBtn').onclick=doRebirth;arenaChoice.onclick=()=>{gameMenu.classList.add('hidden');startArena()};$('lsaClose').onclick=endArena;
window.addEventListener('keydown',e=>{if(arenaModal.classList.contains('hidden'))return;arena.keys[e.key]=true;if(e.code==='Space'){e.preventDefault();slash(arena.player.angle)}if(e.key==='1'){arenaState.activeWeapon=arenaState.gear.weapon||'Rose Blade';arenaState.activeWeaponType='sword';saveArena();arenaStats();toast('Sword equipped ⚔️')}if(e.key==='2'){arenaState.activeWeapon=arenaState.gear.bow||'Cupid Bow';arenaState.activeWeaponType='bow';saveArena();arenaStats();toast('Bow equipped 🏹')}if(e.key.toLowerCase()==='r'){e.preventDefault();useSkill()}});window.addEventListener('keyup',e=>{arena.keys[e.key]=false});
arenaCanvas.addEventListener('mousedown',e=>{const r=arenaCanvas.getBoundingClientRect();const x=e.clientX-r.left,y=e.clientY-r.top;arena.mouseX=x;arena.mouseY=y;slash(Math.atan2(y-arena.player.y,x-arena.player.x))});
$('lsaSkillUse').onclick=useSkill;arenaCanvas.addEventListener('touchstart',e=>{const t=e.touches[0],r=arenaCanvas.getBoundingClientRect();slash(Math.atan2(t.clientY-r.top-arena.player.y,t.clientX-r.left-arena.player.x))},{passive:true});

