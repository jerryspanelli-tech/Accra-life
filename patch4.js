// ===== PATCH 4: ACCRA VIBE GO LIVE + GIFTS =====
(function(){
 if(window.claude)return;
 const GIFTS=[['Sobolo / Ice Kenkey','\uD83E\uDDC3',5],['Waakye Box','\uD83C\uDF5B',20],['Cedi Money Spray','\uD83D\uDCB8',100],['Kente Crown','\uD83D\uDC78',500],['Luxury SUV','\uD83D\uDE99',2000]];
 const L={host:null,view:null,list:{},sigOn:false};
 const ICE={iceServers:[{urls:['stun:stun.l.google.com:19302','stun:stun1.l.google.com:19302']}]};
 const key=()=>fbMyKey(),db=()=>FBNET.db;
 const sig=(to,t,d)=>db().ref('lsig/'+to).push({f:key(),t,d:JSON.stringify(d===undefined?0:d),a:Date.now()}).catch(()=>{});
 const st=document.createElement('style');
 st.textContent='.lvbox{position:fixed;left:8px;top:calc(env(safe-area-inset-top,0px) + 96px);width:min(80vw,300px);z-index:60;background:rgba(23,25,28,.94);border:1px solid #c9a54a;border-radius:14px;padding:8px;color:#f2f0ea;font:600 13px system-ui;display:none}.lvbox video{width:100%;border-radius:10px;background:#000;max-height:34vh;margin-top:4px}.lvbox button{border:0;border-radius:10px;background:#c9a54a;color:#17191c;font:700 13px system-ui;padding:6px 8px;margin:3px 3px 0 0}@keyframes lvup{0%{transform:translateY(0) scale(.6);opacity:0}15%{opacity:1}100%{transform:translateY(-55vh) scale(1.5);opacity:0}}.lvfly{position:fixed;left:50%;bottom:30%;z-index:90;font-size:44px;pointer-events:none;animation:lvup 2.6s ease-out forwards;text-align:center}.lvfly small{display:block;font-size:12px;color:#fff;background:rgba(0,0,0,.6);border-radius:8px;padding:2px 6px}.cd input{user-select:text;-webkit-user-select:text}';
 document.head.appendChild(st);
 const ov=id=>{let b=$(id);if(!b){b=document.createElement('div');b.id=id;b.className='lvbox';document.body.appendChild(b)}return b};
 const fly=(em,who)=>{const d=document.createElement('div');d.className='lvfly';d.style.marginLeft=(Math.random()*120-60)+'px';d.innerHTML=em+'<small>'+esc(who||'')+'</small>';document.body.appendChild(d);setTimeout(()=>d.remove(),2700)};
 const addIce=(c,d)=>{if(c.ready)c.pc.addIceCandidate(d).catch(()=>{});else c.q.push(d)};
 async function flushIce(c){c.ready=true;while(c.q.length){try{await c.pc.addIceCandidate(c.q.shift())}catch(e){}}}
 // ---------- Accra Vibe tab ----------
 const _acc=APP.accra;
 APP.accra=function(){setTimeout(paintList,0);return '<div class="cd"><b>\uD83D\uDD34 Accra Vibe Live</b><div id="lvlist"></div><input id="lvtitle" maxlength="30" placeholder="Stream title (optional)" class="nmin"><button class="bt" data-lv="go">'+(L.host?'You are LIVE':'Go LIVE')+'</button><br><small>Shows your game view and microphone to viewers (up to 5 at once). Viewers can send gifts that pay you.</small></div>'+_acc()};
 function paintList(){const el=$('lvlist');if(!el)return;
  const rows=Object.entries(L.list).filter(([k])=>k!==key()).map(([k,v])=>'<div class="cd tx"><span>\uD83D\uDD34 '+esc(v.name||'Player')+'<br><small>'+esc(v.title||'')+'</small></span><button class="bt" data-lv="watch" data-k="'+esc(k)+'">Watch</button></div>').join('');
  el.innerHTML=rows||'<small>Nobody is live right now.</small>'}
 // ---------- signalling ----------
 function listenSig(){if(L.sigOn)return;L.sigOn=true;const r=db().ref('lsig/'+key());r.onDisconnect().remove();
  r.on('child_added',s=>{const m=s.val();s.ref.remove();if(m&&Date.now()-m.a<30000)onSig(m)})}
 async function onSig(m){let d;try{d=JSON.parse(m.d)}catch(e){return}const k=m.f,H=L.host,V=L.view;
  try{
   if(H&&m.t==='watch')hostOffer(k);
   else if(H&&m.t==='lvanswer'){const c=H.pcs.get(k);if(c){await c.pc.setRemoteDescription(d);await flushIce(c)}}
   else if(H&&m.t==='lvice'){const c=H.pcs.get(k);if(c)addIce(c,d)}
   else if(H&&m.t==='bye')dropH(k);
   else if(V&&V.k===k&&m.t==='lvoffer')viewerOffer(d);
   else if(V&&V.k===k&&m.t==='lvice'&&V.c)addIce(V.c,d);
   else if(V&&V.k===k&&m.t==='full'){toast('This stream is full (5 viewers).');leave()}
   else if(V&&V.k===k&&m.t==='end'){toast('The stream ended.');leave()}
  }catch(e){}}
 // ---------- streamer ----------
 function hostPaint(){const b=$('lvhost');if(!b||!L.host)return;let n=0;L.host.pcs.forEach(c=>{if(c.pc.connectionState==='connected')n++});b.innerHTML='\uD83D\uDD34 LIVE \u00B7 '+n+' viewer'+(n==1?'':'s')+' <button data-lv="end">End</button>'}
 function dropH(k){const H=L.host;if(!H)return;const c=H.pcs.get(k);if(!c)return;H.pcs.delete(k);try{c.pc.close()}catch(e){}hostPaint()}
 async function hostOffer(k){const H=L.host;if(!H)return;if(H.pcs.size>=5&&!H.pcs.has(k))return sig(k,'full',0);
  dropH(k);const pc=new RTCPeerConnection(ICE),c={pc,q:[],ready:false};H.pcs.set(k,c);
  H.stream.getTracks().forEach(t=>pc.addTrack(t,H.stream));
  pc.onicecandidate=e=>{if(e.candidate)sig(k,'lvice',e.candidate)};
  pc.onconnectionstatechange=()=>{if(['failed','closed','disconnected'].includes(pc.connectionState))setTimeout(()=>{if(H.pcs.get(k)===c&&pc.connectionState!=='connected')dropH(k)},4000);hostPaint()};
  try{await pc.setLocalDescription(await pc.createOffer());sig(k,'lvoffer',pc.localDescription)}catch(e){dropH(k)}}
 async function goLive(){
  if(L.host)return toast('You are already live.');if(L.view)leave();
  if(!FBNET.db)return toast('Live needs online play. Try again in a moment.');
  const cv=ren.domElement;if(!cv.captureStream||!window.RTCPeerConnection)return toast('Live video is not supported in this browser.');
  let mic=null;try{mic=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}})}catch(e){toast('Microphone blocked: going live without sound.')}
  const stream=new MediaStream([...cv.captureStream(24).getVideoTracks(),...(mic?mic.getAudioTracks():[])]);
  const title=(($('lvtitle')&&$('lvtitle').value.trim())||myName+"'s stream").slice(0,30);
  L.host={stream,mic,pcs:new Map(),title};listenSig();
  const r=db().ref('live/'+key());r.onDisconnect().remove();r.set({pid:PID,name:myName,title,at:Date.now()});
  const b=ov('lvhost');b.style.display='block';b.style.top='calc(env(safe-area-inset-top,0px) + 130px)';hostPaint();
  toast('You are LIVE! Viewers can watch and send gifts.');if(tab=='accra')render()}
 function endLive(){const H=L.host;if(!H)return;L.host=null;
  H.pcs.forEach((c,k)=>{sig(k,'end',0);try{c.pc.close()}catch(e){}});
  H.stream.getTracks().forEach(t=>t.stop());if(H.mic)H.mic.getTracks().forEach(t=>t.stop());
  db().ref('live/'+key()).remove();const b=$('lvhost');if(b)b.style.display='none';toast('Live ended.');if(tab=='accra')render()}
 // ---------- viewer ----------
 function watch(k){
  if(L.host)return toast('End your stream first.');if(L.view)leave();
  const v=L.list[k];if(!v)return toast('That stream has ended.');
  const box=ov('lvview');
  box.innerHTML='<b>\uD83D\uDD34 '+esc(v.name||'Player')+'</b> <small>'+esc(v.title||'')+'</small><video id="lvvid" playsinline autoplay></video><div>'+GIFTS.map((g,i)=>'<button data-lv="gift" data-i="'+i+'">'+g[1]+' '+g[2]+'</button>').join('')+'</div><div><small>Gifts cost GH\u20B5 and go straight to the streamer.</small></div><button data-lv="leave" style="background:#b5473d;color:#fff">Leave</button>';
  box.style.display='block';$('lvvid').onclick=()=>{const x=$('lvvid');x.muted=false;x.play().catch(()=>{})};
  const V=L.view={k,pid:v.pid,pc:null,c:null,t0:Date.now()};listenSig();
  V.gref=db().ref('gifts/'+v.pid).orderByKey().limitToLast(1);
  V.gfn=V.gref.on('child_added',s=>{const g=s.val();if(g&&g.at>V.t0&&GIFTS[g.i])fly(GIFTS[g.i][1],g.n)});
  sig(k,'watch',0);toast('Connecting to the stream\u2026');tp()}
 async function viewerOffer(d){const V=L.view;if(!V)return;try{if(V.pc)V.pc.close()}catch(e){}
  const pc=new RTCPeerConnection(ICE),c=V.c={pc,q:[],ready:false};V.pc=pc;
  pc.onicecandidate=e=>{if(e.candidate)sig(V.k,'lvice',e.candidate)};
  pc.ontrack=e=>{const vid=$('lvvid');if(!vid)return;if(vid.srcObject!==e.streams[0])vid.srcObject=e.streams[0];vid.play().catch(()=>{vid.muted=true;vid.play().catch(()=>{});toast('Tap the video for sound.')})};
  try{await pc.setRemoteDescription(d);await flushIce(c);await pc.setLocalDescription(await pc.createAnswer());sig(V.k,'lvanswer',pc.localDescription)}catch(e){}}
 function leave(){const V=L.view;if(!V)return;L.view=null;try{V.pc&&V.pc.close()}catch(e){}sig(V.k,'bye',0);if(V.gref)V.gref.off('child_added',V.gfn);const b=$('lvview');if(b){b.style.display='none';b.innerHTML=''}}
 // ---------- gifts: the viewer pays, the streamer's game credits it once ----------
 function sendGift(i){const V=L.view,g=GIFTS[i];if(!V||!g)return;
  if(FROZEN||ECON.paused)return toast('Spending is paused right now.');
  if(S.money<g[2])return toast('Not enough cedis. '+g[0]+' costs GH\u20B5'+g[2]+'.');
  S.money-=g[2];lastM=S.money;S.tx.unshift({d:-g[2],w:'Gift: '+g[0]});
  db().ref('gifts/'+V.pid).push({from:PID,n:myName,i,amt:g[2],at:Date.now()}).catch(()=>{});
  toast('You sent '+g[0]+' \u2212GH\u20B5'+g[2])}
 function applyGift(id,g){if(!g||APPLIED.has('g'+id))return;const it=GIFTS[g.i];
  if(!it||it[2]!==g.amt||g.from===PID)return;
  APPLIED.add('g'+id);saveApplied();S.money+=g.amt;lastM=S.money;
  S.tx.unshift({d:g.amt,w:'Gift: '+it[0]+' from '+String(g.n||'viewer').slice(0,14)});
  if(Date.now()-(g.at||0)<120000){toast(it[1]+' '+String(g.n||'A viewer').slice(0,14)+' sent '+it[0]+'! +GH\u20B5'+g.amt);fly(it[1],g.n)}
  else toast('You received gifts while away: +GH\u20B5'+g.amt)}
 document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-lv]');if(!b)return;const a=b.dataset.lv;
  if(a==='go')goLive();else if(a==='end')endLive();else if(a==='watch')watch(b.dataset.k);else if(a==='leave')leave();else if(a==='gift')sendGift(+b.dataset.i)});
 const boot=setInterval(()=>{if(typeof FBNET==='undefined'||!FBNET.db)return;clearInterval(boot);
  db().ref('live').on('value',s=>{L.list=s.val()||{};paintList()});
  db().ref('gifts/'+PID).orderByKey().limitToLast(50).on('child_added',s=>applyGift(s.key,s.val()));
 },500);
})();
