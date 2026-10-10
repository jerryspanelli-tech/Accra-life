// ===== PATCH 3: PROXIMITY VOICE CHAT (WebRTC, Firebase signalling) =====
(function(){
 if(window.claude)return;
 const V={on:false,muted:false,stream:null,ctx:null,conns:new Map(),cool:{},RANGE:35,DROP:48};
 const ICE={iceServers:[{urls:['stun:stun.l.google.com:19302','stun:stun1.l.google.com:19302']}]};
 const myKey=()=>fbMyKey();
 const send=(to,t,d)=>FBNET.db.ref('signals/'+to).push({f:myKey(),t,d:JSON.stringify(d),a:Date.now()}).catch(()=>{});
 function drop(k){const c=V.conns.get(k);if(!c)return;V.conns.delete(k);try{c.src&&c.src.disconnect();c.node&&c.node.disconnect();if(c.audio)c.audio.srcObject=null;c.pc.close()}catch(e){}}
 function mkConn(k){
  const pc=new RTCPeerConnection(ICE),c={pc,q:[],ready:false,born:Date.now()};
  V.conns.set(k,c);
  V.stream.getAudioTracks().forEach(tr=>pc.addTrack(tr,V.stream));
  pc.onicecandidate=e=>{if(e.candidate)send(k,'ice',e.candidate)};
  pc.ontrack=e=>{const st=e.streams[0];if(!st||c.node)return;
   const a=new Audio();a.srcObject=st;a.muted=true;a.play().catch(()=>{});c.audio=a;
   const src=V.ctx.createMediaStreamSource(st),p=V.ctx.createPanner();
   p.panningModel='HRTF';p.distanceModel='linear';p.refDistance=2;p.maxDistance=V.RANGE;p.rolloffFactor=1;
   src.connect(p);p.connect(V.ctx.destination);c.node=p;c.src=src};
  pc.onconnectionstatechange=()=>{if(pc.connectionState==='failed'||pc.connectionState==='closed')drop(k)};
  return c}
 async function flush(c){while(c.q.length){try{await c.pc.addIceCandidate(c.q.shift())}catch(e){}}}
 async function onSig(m){
  if(!m||Date.now()-m.a>20000)return;const k=m.f;let d;try{d=JSON.parse(m.d)}catch(e){return}
  try{
   if(m.t==='offer'){drop(k);const c=mkConn(k);await c.pc.setRemoteDescription(d);c.ready=true;await flush(c);const an=await c.pc.createAnswer();await c.pc.setLocalDescription(an);send(k,'answer',c.pc.localDescription)}
   else if(m.t==='answer'){const c=V.conns.get(k);if(c){await c.pc.setRemoteDescription(d);c.ready=true;await flush(c)}}
   else if(m.t==='ice'){const c=V.conns.get(k);if(!c)return;if(c.ready)await c.pc.addIceCandidate(d);else c.q.push(d)}
  }catch(e){}}
 async function start(k){V.cool[k]=Date.now()+8000;const c=mkConn(k);try{const of=await c.pc.createOffer();await c.pc.setLocalDescription(of);send(k,'offer',c.pc.localDescription)}catch(e){drop(k)}}
 // every second: connect to players who come within range, drop those who leave
 function tick(){if(!V.on)return;const mk=myKey();
  others.forEach((o,k)=>{if(S.bl.includes(o.name))return;
   const d=Math.hypot(o.g.position.x-me.position.x,o.g.position.z-me.position.z);
   if(d<V.RANGE&&!V.conns.has(k)&&mk<k&&Date.now()>(V.cool[k]||0))start(k);
   else if(d>V.DROP&&V.conns.has(k))drop(k)});
  V.conns.forEach((c,k)=>{if(!others.has(k)||(c.pc.connectionState!=='connected'&&Date.now()-c.born>15000))drop(k)})}
 // 3D positions: the listener follows your camera, each voice follows that player's avatar
 const setP=(p,x,y,z)=>{if(p.positionX){p.positionX.value=x;p.positionY.value=y;p.positionZ.value=z}else p.setPosition(x,y,z)};
 setInterval(()=>{if(!V.on)return;const L=V.ctx.listener,fx=-Math.sin(cy),fz=-Math.cos(cy);
  setP(L,me.position.x,1.6,me.position.z);
  if(L.forwardX){L.forwardX.value=fx;L.forwardY.value=0;L.forwardZ.value=fz;L.upX.value=0;L.upY.value=1;L.upZ.value=0}else L.setOrientation(fx,0,fz,0,1,0);
  V.conns.forEach((c,k)=>{const o=others.get(k);if(o&&c.node)setP(c.node,o.g.position.x,1.6,o.g.position.z)})},60);
 // mic button
 const b=document.createElement('button');b.id='micbtn';b.setAttribute('aria-label','Voice chat');
 b.style.cssText='position:fixed;right:188px;top:calc(env(safe-area-inset-top,0px) + 50px);border:0;border-radius:14px;background:rgba(28,30,33,.78);color:#fff;font-size:20px;padding:4px 12px;z-index:5';
 document.body.appendChild(b);
 const paint=()=>{b.textContent=!V.on?'\uD83C\uDFA4':V.muted?'\uD83D\uDD07':'\uD83C\uDF99\uFE0F';b.style.background=V.on&&!V.muted?'#2e7d32':'rgba(28,30,33,.78)'};paint();
 b.onclick=async()=>{
  if(!FBNET.db)return toast('Voice chat needs online play. Try again in a moment.');
  if(!V.on){
   if(!navigator.mediaDevices||!window.RTCPeerConnection)return toast('Voice chat is not supported in this browser.');
   try{V.stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}})}catch(e){return toast('Microphone blocked. Allow it in your browser settings.')}
   V.ctx=new(window.AudioContext||window.webkitAudioContext)();if(V.ctx.resume)V.ctx.resume();
   V.on=true;V.muted=false;
   const r=FBNET.db.ref('signals/'+myKey());r.onDisconnect().remove();
   r.on('child_added',s=>{const m=s.val();s.ref.remove();onSig(m)});
   setInterval(tick,1000);toast('Voice chat on. Players within 35 m can hear you. Tap again to mute.')}
  else{V.muted=!V.muted;V.stream.getAudioTracks().forEach(t=>{t.enabled=!V.muted});toast(V.muted?'Mic muted (you can still hear others)':'Mic on')}
  paint()};
})();
