// Accra Life (Babylon.js): low-poly 3D characters + online multiplayer + opt-in area location
(function(){
 const SK=['#c68a5e','#8d5a3b','#6b4028','#4a2c1c','#a8754f','#3a2216'],HC=['#0d0d0d','#2a1a10','#5a3b22','#9a7b3c'],TP=['#9a4a42','#c9a54a','#56705a','#4d6a8a','#e8e6df','#2a2c30','#7a6a8a','#c08a5a'],PN=['#1f2a44','#111111','#5b4630','#6b6b6b','#2f5d3a','#b8a27a'];
 // outfit styles: 0 tee + trousers, 1 suit + tie, 2 dress, 3 hoodie + shorts. Hair: 0 bald, 1 fade, 2 afro, 3 dreads, 4 braids
 function human(l){
  const root=new BABYLON.TransformNode('hu',scene);
  const g=new BABYLON.TransformNode('hg',scene);g.parent=root;g.scaling.setAll(.85);
  const P=(k,o,x,y,z,c,par)=>{const m=BABYLON.MeshBuilder['Create'+k]('hp',o,scene);if(k!=='Box')m.convertToFlatShadedMesh();m.parent=par||g;m.position.set(x,y,z);m.material=mat(c);m.checkCollisions=false;m.isPickable=false;if(typeof sg!=='undefined')sg.addShadowCaster(m);return m};
  const B=(w,h,d,x,y,z,c,par)=>P('Box',{width:w,height:h,depth:d},x,y,z,c,par);
  const piv=(x,y)=>{const t=new BABYLON.TransformNode('pv',scene);t.parent=g;t.position.set(x,y,0);return t};
  const sk=SK[l.skin%6],st=l.style%4,ts=st==1?'#1c1e21':TP[l.top%8],pn=PN[l.pants%6],hc=HC[l.hair%4],h=l.hair%5;
  // torso
  B(.72,.78,.4,0,1.3,0,ts);
  if(st==0){B(.74,.1,.42,0,1.02,0,'#c8102e');B(.74,.1,.42,0,.92,0,'#006b3f')}
  if(st==1)B(.1,.5,.02,0,1.3,.21,'#b5473d');
  if(st==3)B(.5,.22,.16,0,1.72,-.2,ts);
  // head, hair, eyes
  const hd=P('Sphere',{diameter:.52,segments:6},0,1.9,0,sk);hd.scaling.y=1.05;
  if(h==1||h==3||h==4){const c=P('Sphere',{diameter:.56,segments:6},0,2.03,-.02,hc);c.scaling.y=.55}
  if(h==2)P('Sphere',{diameter:.84,segments:6},0,2.02,-.04,hc);
  if(h==3)for(let i=0;i<8;i++){const a=i/8*Math.PI*2;P('Cylinder',{height:.45,diameter:.06,tessellation:5},Math.sin(a)*.26,1.78,Math.cos(a)*.26-.04,hc)}
  if(h==4)[-.18,.18].forEach(x=>P('Cylinder',{height:.7,diameter:.07,tessellation:5},x,1.62,-.22,hc));
  [-1,1].forEach(s=>{B(.12,.09,.06,s*.11,1.93,.245,'#ffffff');B(.06,.07,.05,s*.11,1.93,.27,'#111111');B(.13,.03,.04,s*.11,2.02,.25,hc)});
  B(.06,.08,.06,0,1.86,.27,sk);                                   // nose
  [-1,1].forEach(s=>B(.05,.1,.07,s*.265,1.9,0,sk));                // ears
  B(.17,.035,.04,0,1.77,.255,'#7a2a2a');B(.05,.035,.04,-.09,1.79,.25,'#7a2a2a');B(.05,.035,.04,.09,1.79,.25,'#7a2a2a');   // mouth + smile
  // arms (pivot at shoulder)
  const arm=s=>{const a=piv(s*.49,1.62);
   if(st==0||st==2){B(.2,.32,.22,0,-.16,0,ts,a);B(.17,.4,.2,0,-.52,0,sk,a)}
   else{B(.2,.6,.22,0,-.3,0,ts,a);B(.17,.14,.2,0,-.66,0,sk,a)}
   return a};
  // legs (pivot at hip)
  const leg=s=>{const q=piv(s*.18,.88);
   if(st==2)B(.24,.62,.26,0,-.31,0,sk,q);
   else if(st==3){B(.28,.3,.3,0,-.15,0,pn,q);B(.24,.34,.26,0,-.45,0,sk,q)}
   else B(.28,.62,.3,0,-.31,0,pn,q);
   B(.3,.2,.42,0,-.78,.06,'#f0f0ec',q);return q};
  const al=arm(-1),ar=arm(1),ll=leg(-1),lr=leg(1);
  if(st==2)P('Cylinder',{height:.75,diameterTop:.75,diameterBottom:1.1,tessellation:8},0,.95,0,ts);
  return{root,al,ar,ll,lr,ph:0}}
 function walk(h,sp,dt){h.ph+=dt*(2+sp*1.1);const k=Math.min(1,sp/3),s=Math.sin(h.ph)*.85*k;h.ll.rotation.x=s;h.lr.rotation.x=-s;h.al.rotation.x=-s;h.ar.rotation.x=s}
 let look;try{look=JSON.parse(localStorage.getItem('accra-look'))}catch(e){}
 const isNew=!look;
 look=look||{skin:1,hair:1,top:3,pants:0,style:0};
 let mine=null;
 function dress(){if(mine)mine.root.dispose();mine=human(look);mine.root.parent=player;mine.root.position.y=-.91;player.isVisible=false;try{localStorage.setItem('accra-look',JSON.stringify(look))}catch(e){}}
 dress();
 let net=null;
 // customization screens (wardrobe, fitting room, first join) live in accra-upgrade.js
 const ui=(id,txt,top,fn)=>{const b=document.createElement('button');b.id=id;b.textContent=txt;b.style.cssText='position:fixed;left:8px;top:calc(env(safe-area-inset-top,0px) + '+top+'px);border:0;border-radius:14px;background:rgba(28,30,33,.78);color:#fff;font-size:20px;padding:4px 12px;z-index:5';b.onclick=fn;document.body.appendChild(b);return b};
 window.ACCRA_AVATAR={look,isNew,apply:()=>{dress();if(net)net.emit('playerMove',snap())}};
 scene.onBeforeRenderObservable.add(()=>{const dt=engine.getDeltaTime()/1000;walk(mine,driving?0:cur.sp,dt)});
 // ---------- online ----------
 const URL_=window.ACCRA_SERVER||'PASTE_SERVER_URL_HERE';
 const cur={sp:0};let px=0,pz=0;
 const snap=()=>{const o=driving?car:player;return{x:o.position.x,z:o.position.z,ry:driving?heading:player.rotation.y,sp:cur.sp,drv:driving?1:0,look}};
 if(!window.io||URL_.indexOf('PASTE')===0){console.log('Offline mode: set ACCRA_SERVER in online.js to play online');return}
 const pid='p'+crypto.randomUUID().replace(/-/g,''),gt=(k,v)=>{let x=localStorage.getItem(k);if(!x){x=v;localStorage.setItem(k,x)}return x};
 const ID=gt('accra-pid',pid),SEC=gt('accra-secret',crypto.randomUUID()+crypto.randomUUID()),NAME=gt('accra-name','Citizen'+Math.floor(1000+Math.random()*9000));
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
