// phone.js - Accra Life phone for the Babylon.js version: Bank, Map + routes, Jobs (delivery), Camera, Settings
(function(){
 const $=id=>document.getElementById(id),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let S={money:200,sav:0,tx:[]};try{S=Object.assign(S,JSON.parse(localStorage.getItem('accra-bb-save')))}catch(e){}
 const save=()=>{try{localStorage.setItem('accra-bb-save',JSON.stringify(S))}catch(e){}};
 const add=(d,w)=>{S.money+=d;S.tx.unshift({d,w});S.tx.length=Math.min(S.tx.length,20);save();paint()};
 window.ACCRA_STATE=S;window.ACCRA_ADD=add;
 const st=document.createElement('style');
 st.textContent='.po #joy,.po #jump,.po #act{display:none!important}#pbtn2{position:fixed;right:8px;top:calc(env(safe-area-inset-top,0px) + 90px);border:0;border-radius:14px;background:#c9a54a;font-size:22px;padding:4px 12px;z-index:6}'+
 '.p2{position:fixed;right:8px;top:calc(env(safe-area-inset-top,0px) + 8px);bottom:calc(env(safe-area-inset-bottom,0px) + 8px);width:min(62vw,300px);display:none;flex-direction:column;background:linear-gradient(165deg,#32353a,#1c1e21 62%,#121316);border:8px solid #0d0d10;border-radius:38px;overflow:hidden;z-index:30;color:#fff;font:13px -apple-system,system-ui,sans-serif;box-shadow:0 10px 40px rgba(0,0,0,.6)}'+
 '.p2 .sb{display:flex;justify-content:space-between;padding:8px 20px 2px;font-weight:700;font-size:11px}.p2 .bd{flex:1;overflow:auto;padding:6px 12px;-webkit-overflow-scrolling:touch;touch-action:pan-y}.p2 h3{margin:2px 0 6px;font-size:16px}'+
 '.p2 .nv{display:flex;justify-content:space-around;padding:4px 10px 8px}.p2 .nv button{border:0;background:rgba(255,255,255,.14);color:#fff;border-radius:14px;padding:5px 16px;font-size:15px}'+
 '.p2 .ag{display:grid;grid-template-columns:repeat(3,1fr);gap:14px 4px;margin-top:6px}.p2 .ai{border:0;background:none;color:#fff;font-size:11px;font-weight:600;display:flex;flex-direction:column;align-items:center;gap:3px;padding:0}.p2 .ai i{font-style:normal;width:54px;height:54px;border-radius:17px;display:flex;align-items:center;justify-content:center;font-size:26px;background:linear-gradient(160deg,rgba(255,255,255,.35),rgba(255,255,255,0) 55%),var(--c)}'+
 '.p2 .cd{background:rgba(255,255,255,.12);border-radius:12px;padding:8px 10px;margin:6px 0}.p2 .tx{display:flex;justify-content:space-between;align-items:center;gap:6px}.p2 .bt{border:0;border-radius:10px;background:#c9a54a;color:#17191c;font-weight:700;padding:6px 11px;font-size:12px;margin:3px 3px 0 0}.p2 .big{font-size:24px;font-weight:800;color:#c9a54a}.p2 .up{color:#69f0ae}.p2 .dn{color:#ff8a80}.p2 img{width:100%;border-radius:10px;margin-top:6px}'+
 '#mny,#nvp{position:fixed;right:8px;background:rgba(28,30,33,.78);border-radius:14px;padding:6px 12px;font:700 13px system-ui;z-index:5}#mny{top:calc(env(safe-area-inset-top,0px) + 46px);color:#c9a54a}#nvp{top:calc(env(safe-area-inset-top,0px) + 134px);color:#fff;display:none}'+
 '#ptoast{position:fixed;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 150px);transform:translateX(-50%);background:#25282c;border:1px solid #c9a54a;color:#f2f0ea;padding:8px 14px;border-radius:14px;font:700 14px system-ui;z-index:40;opacity:0;transition:opacity .3s;pointer-events:none;text-align:center;max-width:80%}';
 document.head.appendChild(st);
 const el=(t,id,cls)=>{const e=document.createElement(t);if(id)e.id=id;if(cls)e.className=cls;document.body.appendChild(e);return e};
 const money=el('div','mny'),navp=el('div','nvp'),tst=el('div','ptoast'),ph=el('div','phone2','p2'),btn=el('button','pbtn2');btn.textContent='\uD83D\uDCF1';
 ph.innerHTML='<div class="sb"><span id="ptm2"></span><span>\uD83D\uDCF6 \uD83D\uDD0B</span></div><div class="bd" id="pbd"></div><div class="nv"><button id="pbk">\u25C2</button><button id="phm">\u25CF</button><button id="pcl">\u2715</button></div>';
 let tt;const toast=m=>{tst.textContent=m;tst.style.opacity=1;clearTimeout(tt);tt=setTimeout(()=>tst.style.opacity=0,2400)};
 const paint=()=>{money.textContent='GH\u20B5 '+S.money};paint();
 // ---------- destinations from the real city grid ----------
 const XS=[-110,-35,35,110],D={};DG.forEach((row,i)=>row.forEach((n,j)=>{(D[n]=D[n]||[]).push([XS[i],XS[j]])}));
 const DEST=Object.entries(D).map(([n,a])=>({n,x:a.reduce((s,p)=>s+p[0],0)/a.length,z:a.reduce((s,p)=>s+p[1],0)/a.length}));
 DEST.push({n:'Your villa',x:VX,z:VZ});DEST.push({n:'Accra Mall',x:35,z:22});DEST.push({n:'Sports Stadium',x:110,z:35});DEST.push({n:'Police Department',x:35,z:82});DEST.push({n:'Accra Hospital',x:110,z:82});DEST.push({n:'Accra Motors (cars)',x:35,z:-52});(window.ACCRA_LANDMARKS||[]).forEach(d=>DEST.push(d));
 const pos=()=>(driving?car:player).position,dist=d=>Math.round(Math.hypot(d.x-pos().x,d.z-pos().z));
 let nav=null,job=null;
 const bm=BABYLON.MeshBuilder.CreateCylinder('bc',{height:70,diameter:3},scene);bm.material=Object.assign(new BABYLON.StandardMaterial('bcm',scene),{emissiveColor:C3('#c9a54a'),disableLighting:true,alpha:.35,fogEnabled:false});bm.isPickable=false;bm.setEnabled(false);
 function setNav(d){nav=d;bm.setEnabled(!!d);if(d)bm.position.set(d.x,35,d.z);navp.style.display=d?'block':'none'}
 scene.onBeforeRenderObservable.add(()=>{
  if(Math.floor(performance.now()/500)%2===0)$('ptm2').textContent=new Date().toTimeString().slice(0,5);
  if(!nav)return;const m=dist(nav);navp.textContent='\u27A4 '+nav.n+' \u00B7 '+m+' m';
  if(m<20){const n=nav;setNav(null);
   if(job&&job.stage===0&&n===job.a){job.stage=1;setNav(job.b);toast('Package picked up. Deliver to '+job.b.n)}
   else if(job&&job.stage===1&&n===job.b){const p=job.pay;add(p,'Delivery to '+job.b.n);toast('Delivered! +GH\u20B5'+p);job=null}
   else toast('You have arrived: '+n.n)}});
 // ---------- apps ----------
 const APPS=[['bank','\uD83D\uDCB0','MoCedi','#2e7d32'],['map','\uD83D\uDDFA\uFE0F','Map','#f57c00'],['jobs','\uD83D\uDCBC','Jobs','#6d4c41'],['cam','\uD83D\uDCF7','Camera','#546e7a'],['snap','\uD83D\uDDBC\uFE0F','Snapza','#e1306c'],['buzz','\uD83D\uDCAC','BuzzGH','#1da1f2'],['vibe','\uD83C\uDFAC','Vibez','#ff2d55'],['chat','\uD83D\uDCE8','ChaleChat','#25a244'],['shop','\uD83D\uDED2','MarketHub','#ff9800'],['jam','\uD83C\uDFB5','JamBox','#7c4dff'],['pair','\uD83D\uDC9E','PairUp','#ec407a'],['set','\u2699\uFE0F','Settings','#37474f']];
 let tab='home',shots=[];
 const soon=n=>'<div class="cd">'+n+' needs the online server, which is the next step. It will use the same server as multiplayer, voice, GO LIVE and gifts.</div>';
 const V2={
  bank:()=>'<div class="cd" style="text-align:center"><small>Balance</small><div class="big">GH\u20B5 '+S.money+'</div><small>MoMo savings: GH\u20B5 '+S.sav+'</small></div><button class="bt" data-do="dep">Save GH\u20B520</button><button class="bt" data-do="wd">Withdraw GH\u20B520</button><h3>Recent</h3>'+(S.tx.slice(0,8).map(x=>'<div class="cd tx"><span>'+esc(x.w)+'</span><b class="'+(x.d>0?'up':'dn')+'">'+(x.d>0?'+':'')+x.d+'</b></div>').join('')||'<div class="cd">No transactions yet</div>'),
  map:()=>(nav?'<div class="cd tx"><span>\u27A4 '+esc(nav.n)+' \u00B7 '+dist(nav)+' m</span><button class="bt" data-do="stop">Stop</button></div>':'')+DEST.slice().sort((a,b)=>dist(a)-dist(b)).map((d,i)=>'<div class="cd tx"><span>'+esc(d.n)+'<br><small>'+dist(d)+' m away</small></span><button class="bt" data-go="'+DEST.indexOf(d)+'">Go</button></div>').join(''),
  jobs:()=>'<div class="cd"><b>\uD83C\uDFCD\uFE0F Delivery rider</b><br><small>Pick up a package in one district and deliver it to another. Pay depends on distance.</small><br>'+(job?'<small>Active: '+(job.stage?'deliver to '+esc(job.b.n):'pick up at '+esc(job.a.n))+' \u00B7 GH\u20B5'+job.pay+'</small><br><button class="bt" data-do="cancel">Cancel</button>':'<button class="bt" data-do="deliv">Start delivery</button>')+'</div>',
  cam:()=>'<button class="bt" data-do="shot">\uD83D\uDCF8 Take photo</button>'+shots.map(x=>'<img src="'+x+'">').join('')+(shots.length?'<small>Press and hold a photo to save it.</small>':'<div class="cd">Photos of the game world appear here.</div>'),
  snap:()=>'<div class="cd">Snapza: share your photos. Posting to other players needs the online server (next step).</div>'+V2.cam(),buzz:()=>soon('BuzzGH (short messages)'),vibe:()=>soon('Vibez (video sharing)'),chat:()=>soon('ChaleChat (messages and calls)'),jam:()=>soon('JamBox (music and radio)'),pair:()=>soon('PairUp (dating and relationships)'),shop:()=>'<div class="cd">MarketHub: order groceries to your fridge (10% delivery fee).</div><button class="bt" data-do="shop">Open MarketHub</button>',
  set:()=>'<div class="cd tx"><span>Shadows</span><button class="bt" data-do="shd">'+(sun.shadowEnabled?'On':'Off')+'</button></div><div class="cd"><small>Progress (cash, bank, transactions) saves on this device.</small></div>'};
 function render(){const ap=APPS.find(a=>a[0]===tab);$('pbk').style.visibility=ap?'visible':'hidden';
  $('pbd').innerHTML=ap?'<h3>'+ap[1]+' '+ap[2]+'</h3>'+V2[tab]():'<div class="ag">'+APPS.map(a=>'<button class="ai" data-app="'+a[0]+'" style="--c:'+a[3]+'"><i>'+a[1]+'</i>'+a[2]+'</button>').join('')+'</div><div class="cd" style="margin-top:12px;text-align:center"><b class="big" style="font-size:18px">GH\u20B5 '+S.money+'</b></div>'}
 function open(o){ph.style.display=o?'flex':'none';document.body.classList.toggle('po',o);if(o){tab='home';render()}}
 btn.onclick=()=>open(ph.style.display!=='flex');$('pcl').onclick=()=>open(false);$('phm').onclick=()=>{tab='home';render()};$('pbk').onclick=()=>{tab='home';render()};
 ph.addEventListener('click',e=>{const b=e.target.closest('[data-app],[data-do],[data-go]');if(!b)return;const d=b.dataset;
  if(d.app)tab=d.app;
  else if(d.go!==undefined){setNav(DEST[+d.go]);toast('Route set. Follow the gold beam.');open(false);return}
  else if(d.do==='dep'){if(S.money<20)toast('Not enough cash.');else{S.money-=20;S.sav+=20;S.tx.unshift({d:-20,w:'MoMo savings'});save();paint()}}
  else if(d.do==='wd'){if(S.sav<20)toast('MoMo savings are below GH\u20B520.');else{S.sav-=20;S.money+=20;S.tx.unshift({d:20,w:'MoMo withdrawal'});save();paint()}}
  else if(d.do==='stop')setNav(null);
  else if(d.do==='deliv'){const a=DEST[Math.floor(Math.random()*DEST.length)];let b;do{b=DEST[Math.floor(Math.random()*DEST.length)]}while(b===a);
   job={a,b,stage:0,pay:Math.min(150,Math.round(40+Math.hypot(a.x-b.x,a.z-b.z)*.4))};setNav(a);toast('Pick up the package at '+a.n);open(false);return}
  else if(d.do==='cancel'){job=null;setNav(null)}
  else if(d.do==='shot'){BABYLON.Tools.CreateScreenshot(engine,cam,{precision:.6},data=>{shots.unshift(data);shots.length=Math.min(shots.length,4);if(tab==='cam')render();toast('Photo saved to your phone')})}
  else if(d.do==='shop'){open(false);if(window.ACCRA_SHOP)window.ACCRA_SHOP();else toast('Store is not ready yet');return}
  else if(d.do==='shd')sun.shadowEnabled=!sun.shadowEnabled;
  render()});
 render();
})();
