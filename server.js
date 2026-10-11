// Accra Life server: multiplayer, server-held cedis (MoMo + gifts), voice/live signalling, opt-in coarse location
const express=require('express'),http=require('http'),fs=require('fs'),crypto=require('crypto'),{Server}=require('socket.io');
const app=express(),server=http.createServer(app);
const ORIGIN=process.env.ORIGIN||'https://jerryspanelli-tech.github.io';
const io=new Server(server,{cors:{origin:ORIGIN,methods:['GET','POST']},maxHttpBufferSize:2e4});
app.get('/',(q,r)=>r.send('Accra Life server is running'));
const GIFTS=[5,20,100,500,2000],FILE=process.env.DATA_FILE||'data.json';
let accounts={};try{accounts=JSON.parse(fs.readFileSync(FILE,'utf8'))}catch(e){}
let dirty=false;setInterval(()=>{if(!dirty)return;dirty=false;try{fs.writeFileSync(FILE,JSON.stringify(accounts))}catch(e){}},3000);
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const players={};          // socket.id -> live state (never persisted)
const num=v=>typeof v==='number'&&isFinite(v);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const clean=s=>String(s||'').replace(/[^\p{L}\p{N} _.\-!?']/gu,'').trim();
// real-world areas for the opt-in location feature; only the area NAME is ever shared, never coordinates
const AREAS=[['East Legon',5.635,-0.155],['Osu',5.556,-0.182],['Makola / Central Accra',5.548,-0.209],['Labadi',5.558,-0.141],['Airport City',5.603,-0.171],['Tema',5.67,0.02],['Achimota',5.62,-0.23],['Kasoa',5.53,-0.42]];
function areaOf(lat,lon){let b=null,bd=1e9;for(const [n,a,o] of AREAS){const d=Math.hypot((lat-a)*111,(lon-o)*111*Math.cos(a*Math.PI/180));if(d<bd){bd=d;b=n}}return bd<40?b:'Outside Accra'}
io.use((socket,next)=>{
 const a=socket.handshake.auth||{};
 if(typeof a.pid!=='string'||!/^[\w-]{8,64}$/.test(a.pid)||typeof a.secret!=='string'||a.secret.length<16||a.secret.length>128)return next(new Error('auth'));
 const acc=accounts[a.pid];
 if(!acc){accounts[a.pid]={h:sha(a.secret),name:clean(a.name).slice(0,14)||'Citizen',balance:500,created:Date.now()};dirty=true}
 else if(acc.h!==sha(a.secret))return next(new Error('auth'));
 socket.pid=a.pid;next()});
io.on('connection',socket=>{
 const acc=accounts[socket.pid];let last=0,tokens=40,tAt=Date.now();
 for(const [id,p] of Object.entries(players))if(p.pid===socket.pid)io.sockets.sockets.get(id)?.disconnect(true); // one session per account
 const me=players[socket.id]={id:socket.id,pid:socket.pid,name:acc.name,x:0,z:10,ry:0,sp:0,look:null,drv:0,area:null,live:null};
 const pub=p=>({id:p.id,name:p.name,x:p.x,z:p.z,ry:p.ry,sp:p.sp,look:p.look,drv:p.drv,area:p.area,live:p.live});
 const liveList=()=>Object.values(players).filter(p=>p.live).map(p=>({id:p.id,name:p.name,title:p.live}));
 const ok=()=>{const n=Date.now();tokens=Math.min(40,tokens+(n-tAt)/1000*30);tAt=n;if(tokens<1)return false;tokens--;return true};
 socket.emit('hello',{id:socket.id,balance:acc.balance,name:acc.name});
 socket.emit('currentPlayers',Object.fromEntries(Object.entries(players).map(([k,p])=>[k,pub(p)])));
 socket.emit('liveList',liveList());
 socket.broadcast.emit('playerJoined',pub(me));
 socket.on('playerMove',d=>{const n=Date.now();if(n-last<50||!d||!num(d.x)||!num(d.z)||!num(d.ry))return;last=n;
  me.x=clamp(d.x,-330,330);me.z=clamp(d.z,-330,330);me.ry=d.ry;me.sp=num(d.sp)?clamp(d.sp,0,30):0;me.drv=d.drv?1:0;
  if(d.look&&typeof d.look==='object')me.look={skin:d.look.skin|0,hair:d.look.hair|0,top:d.look.top|0,pants:d.look.pants|0,style:d.look.style|0};
  socket.broadcast.emit('playerMoved',pub(me))});
 socket.on('chat',t=>{if(!ok())return;t=clean(t).slice(0,60);if(t)io.emit('chat',{id:socket.id,name:me.name,text:t})});
 socket.on('setLocation',d=>{if(!d||!num(d.lat)||!num(d.lon))return;me.area=areaOf(d.lat,d.lon);socket.emit('areaSet',me.area);socket.broadcast.emit('playerMoved',pub(me))}); // coordinates are used once and discarded
 socket.on('clearLocation',()=>{me.area=null;socket.emit('areaSet',null);socket.broadcast.emit('playerMoved',pub(me))});
 socket.on('momo',d=>{if(!ok()||!d)return;const to=players[d.to],amt=d.amount;
  if(!to||to.id===socket.id||!Number.isInteger(amt)||amt<1||amt>5000||acc.balance<amt)return socket.emit('errorMsg','Transfer refused');
  acc.balance-=amt;accounts[to.pid].balance+=amt;dirty=true;
  socket.emit('balance',acc.balance);io.to(to.id).emit('balance',accounts[to.pid].balance);io.to(to.id).emit('momoReceived',{from:me.name,amount:amt})});
 socket.on('goLive',t=>{me.live=clean(t).slice(0,30)||(me.name+"'s stream");io.emit('liveList',liveList())});
 socket.on('stopLive',()=>{me.live=null;io.emit('liveList',liveList())});
 socket.on('gift',d=>{if(!ok()||!d)return;const to=players[d.to],amt=GIFTS[d.i];
  if(!to||!to.live||to.id===socket.id||!amt||acc.balance<amt)return socket.emit('errorMsg','Gift refused');
  acc.balance-=amt;accounts[to.pid].balance+=amt;dirty=true;
  socket.emit('balance',acc.balance);io.to(to.id).emit('balance',accounts[to.pid].balance);
  io.emit('giftSent',{to:to.id,from:me.name,i:d.i,amount:amt})});
 socket.on('signal',d=>{if(!ok()||!d||!players[d.to]||typeof d.type!=='string'||d.type.length>20)return;
  const s=JSON.stringify(d.data===undefined?0:d.data);if(s.length>8000)return;io.to(d.to).emit('signal',{from:socket.id,type:d.type,data:d.data})});
 socket.on('disconnect',()=>{delete players[socket.id];io.emit('playerLeft',socket.id);io.emit('liveList',liveList())});
});
server.listen(process.env.PORT||8080,()=>console.log('Accra Life server running'));
