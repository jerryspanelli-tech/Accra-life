// Accra Life (Babylon.js): upgraded 3D characters + online multiplayer + opt-in area location
(function(){
 const SK=['#c68a5e','#8d5a3b','#6b4028','#4a2c1c','#a8754f','#3a2216'],HC=['#0d0d0d','#2a1a10','#5a3b22','#9a7b3c'],TP=['#9a4a42','#c9a54a','#56705a','#4d6a8a','#e8e6df','#2a2c30','#7a6a8a','#c08a5a'],PN=['#1f2a44','#111111','#5b4630','#6b6b6b','#2f5d3a','#b8a27a'];
 // outfit styles change the real geometry: 0 tee + trousers, 1 suit + tie, 2 dress, 3 hoodie + shorts. Hair: 0 bald, 1 fade, 2 afro, 3 dreads, 4 braids
 function human(l){
  const root=new BABYLON.TransformNode('hu',scene);
  const P=(k,o,x,y,z,c,par)=>{const m=BABYLON.MeshBuilder['Create'+k]('hp',o,scene);m.parent=par||root;m.position.set(x,y,z);m.material=mat(c);m.checkCollisions=false;m.isPickable=false;if(typeof sg!=='undefined')sg.addShadowCaster(m);return m};
  const piv=(x,y)=>{const t=new BABYLON.TransformNode('pv',scene);t.parent=root;t.position.set(x,y,0);return t};
  const sk=SK[l.skin%6],ts=l.style%4==1?'#1c1e21':TP[l.top%8],pn=PN[l.pants%6],st=l.style%4,hc=HC[l.hair%4];
  P('Capsule',{height:.8,radius:.2},0,1.12,0,ts);
  P('Sphere',{diameter:.34},0,1.62,0,sk);P('Cylinder',{height:.1,diameter:.1},0,1.43,0,sk);
  if(st==1)P('Box',{width:.06,height:.4,depth:.02},0,1.15,.2,'#b5473d');
  if(st==3)P('Box',{width:.4,height:.16,depth:.12},0,1.4,-.14,ts);
  const h=l.hair%5;
  if(h==1)P('Sphere',{diameter:.37},0,1.67,-.01,hc).scaling.y=.62;
  if(h==2)P('Sphere',{diameter:.56},0,1.7,-.03,hc);
  if(h==3)for(let i=0;i<8;i++){const a=i/8*Math.PI*2;P('Cylinder',{height:.35,diameter:.045},Math.sin(a)*.15,1.55,Math.cos(a)*.15-.02,hc)}
  if(h==4)[-.07,.07].forEach(x=>P('Cylinder',{height:.6,diameter:.06},x,1.4,-.17,hc));
  const arm=(s)=>{const a=piv(s*.29,1.4);P('Capsule',{height:.7,radius:.065},0,-.33,0,sk,a);
   if(st==0||st==2)P('Capsule',{height:.3,radius:.085},0,-.14,0,ts,a);else P('Capsule',{height:.62,radius:.085},0,-.3,0,ts,a);return a};
  const leg=(s)=>{const g=piv(s*.11,.78);P('Capsule',{height:.8,radius:.09},0,-.4,0,sk,g);
   if(st==0||st==1)P('Capsule',{height:.78,radius:.1},0,-.39,0,pn,g);else if(st==3)P('Capsule',{height:.42,radius:.105},0,-.21,0,pn,g);
   P('Box',{width:.16,height:.08,depth:.28},0,-.78,.05,'#f0f0ec',g);return g};
  const al=arm(-1),ar=arm(1),ll=leg(-1),lr=leg(1);
  if(st==2)P('Cylinder',{height:.62,diameterTop:.34,diameterBottom:.72},0,.62,0,ts);
  return{root,al,ar,ll,lr,ph:0}}
 function walk(h,sp,dt){h.ph+=dt*(2+sp*1.1);const k=Math.min(1,sp/3),s=Math.sin(h.ph)*.85*k;h.ll.rotation.x=s;h.lr.rotation.x=-s;h.al.rotation.x=-s;h.ar.rotation.x=s}
 let look;try{look=JSON.parse(localStorage.getItem('accra-look'))}catch(e){}
 look=look||{skin:1,hair:1,top:3,pants:0,style:0};
 let mine=null;
 function dress(){if(mine)mine.root.dispose();mine=human(look);mine.root.parent=player;mine.root.position.y=-.91;player.isVisible=false;try{localStorage.setItem('accra-look',JSON.stringify(look))}catch(e){}}
 dress();
 let tapN=0;const keys=['style','hair','top','skin','pants'],mod={style:4,hair:5,top:8,skin:6,pants:6};
 const ui=(id,txt,top,fn)=>{const b=document.createElement('button');b.id=id;b.textContent=txt;b.style.cssText='position:fixed;left:8px;top:calc(env(safe-area-inset-top,0px) + '+top+'px);border:0;border-radius:14px;background:rgba(28,30,33,.78);color:#fff;font-size:20px;padding:4px 12px;z-index:5';b.onclick=fn;document.body.appendChild(b);return b};
 ui('lookbtn','\uD83D\uDC64',90,()=>{const k=keys[tapN++%5];look[k]=(look[k]+1)%mod[k];dress();if(net)net.emit('playerMove',snap())});
 scene.onBeforeRenderObservable.add(()=>{const dt=engine.getDeltaTime()/1000;walk(mine,driving?0:cur.sp,dt)});
 // ---------- online ----------
 const URL_=window.ACCRA_SERVER||'PASTE_SERVER_URL_HERE';
 const cur={sp:0};let net=null,px=0,pz=0;
 const snap=()=>{const o=driving?car:player;return{x:o.position.x,z:o.position.z,ry:driving?heading:player.rotation.y,sp:cur.sp,drv:driving?1:0,look}};
 if(!window.io||URL_.indexOf('PASTE')===0){console.log('Offline mode: set ACCRA_SERVER in online.js to play online');return}
 const pid='p'+crypto.randomUUID().replace(/-/g,''),g=(k,v)=>{let x=localStorage.getItem(k);if(!x){x=v;localStorage.setItem(k,x)}return x};
 const ID=g('accra-pid',pid),SEC=g('accra-secret',crypto.randomUUID()+crypto.randomUUID()),NAME=g('accra-name','Citizen'+Math.floor(1000+Math.random()*9000));
 const hud=document.createElement('div');hud.className='pill';hud.style.cssText+=';top:calc(env(safe-area-inset-top,0px) + 46px);font-size:12px;color:#fff';document.body.appendChild(hud);
 let count=1,bal=0,area=null;const paint=()=>{hud.textContent='\uD83D\uDC65 '+count+' \u00B7 GH\u20B5 '+bal+(area?' \u00B7 \uD83D\uDCCD '+area:'')};paint();
 net=io(URL_,{transports:['websocket'],auth:{pid:ID,secret:SEC,name:NAME}});
 const others=new Map();
 function label(t){const dt=new BABYLON.DynamicTexture('l',{width:256,height:64},scene,false);dt.hasAlpha=true;const c=dt.getContext();c.font='bold 30px system-ui';c.textAlign='center';c.fillStyle='rgba(23,25,28,.8)';c.fillRect(0,8,256,48);c.fillStyle='#c9a54a';c.fillText(t,128,44);dt.update();
  const m=BABYLON.MeshBuilder.CreatePlane('nl',{width:1.6,height:.4},scene);m.material=Object.assign(new BABYLON.StandardMaterial('lm',scene),{diffuseTexture:dt,emissiveTexture:dt,opacityTexture:dt,disableLighting:true,backFaceCulling:false});m.billboardMode=BABYLON.Mesh.BILLBOARDMODE_ALL;m.isPickable=false;return m}
 function add(p){if(others.has(p.id)||p.id===net.id)return;const h=human(p.look||look),n=label(p.name+(p.area?' \u00B7 '+p.area:''));n.parent=h.root;n.position.y=2.15;h.root.position.set(p.x,0,p.z);others.set(p.id,{h,tx:p.x,tz:p.z,ry:p.ry,sp:p.sp,name:n,lbl:p.name+'|'+p.area,look:JSON.stringify(p.look)});count=others.size+1;paint()}
 net.on('hello',d=>{bal=d.balance;paint()});
 net.on('balance',b=>{bal=b;paint()});
 net.on('areaSet',a=>{area=a;paint()});
 net.on('currentPlayers',l=>Object.values(l).forEach(add));
 net.on('playerJoined',add);
 net.on('playerMoved',p=>{const o=others.get(p.id);if(!o)return add(p);o.tx=p.x;o.tz=p.z;o.ry=p.ry;o.sp=p.sp;
  const s=JSON.stringify(p.look),l=p.name+'|'+p.area;if(s!==o.look||l!==o.lbl){o.h.root.dispose();others.delete(p.id);add(p)}});
 net.on('playerLeft',id=>{const o=others.get(id);if(o){o.h.root.dispose();others.delete(id)}count=others.size+1;paint()});
 net.on('momoReceived',d=>alert(d.from+' sent you GH\u20B5'+d.amount));
 net.on('connect_error',()=>{hud.textContent='Offline (server not reachable)'});
 scene.onBeforeRenderObservable.add(()=>{const dt=engine.getDeltaTime()/1000;
  others.forEach(o=>{const r=o.h.root,k=Math.min(1,dt*10);r.position.x+=(o.tx-r.position.x)*k;r.position.z+=(o.tz-r.position.z)*k;let d=o.ry-r.rotation.y;d=Math.atan2(Math.sin(d),Math.cos(d));r.rotation.y+=d*k;walk(o.h,o.sp,dt)})});
 setInterval(()=>{const o=driving?car:player,dx=o.position.x-px,dz=o.position.z-pz;cur.sp=Math.hypot(dx,dz)/.1;px=o.position.x;pz=o.position.z;net.emit('playerMove',snap())},100);
 // real-world location is OPT-IN. The server turns it into an area name (like "Osu") and forgets the coordinates.
 ui('locbtn','\uD83D\uDCCD',134,()=>{
  if(area){net.emit('clearLocation');return}
  if(!navigator.geolocation)return alert('Location is not available on this device.');
  if(!confirm('Share your general area (for example "Osu") with other players? Your exact location is never saved or shown. You can turn it off any time.'))return;
  navigator.geolocation.getCurrentPosition(p=>net.emit('setLocation',{lat:p.coords.latitude,lon:p.coords.longitude}),()=>alert('Location permission was not given.'),{enableHighAccuracy:false,maximumAge:600000,timeout:10000})});
})();
