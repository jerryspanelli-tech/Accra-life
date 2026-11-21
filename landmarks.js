// landmarks.js - shared Accra coastline. The stadium is built once in accra-upgrade.js.
(function(){
 const E=window.ACCRA_LANDMARKS=window.ACCRA_LANDMARKS||[];
 const P=window.ACCRA_MAP?window.ACCRA_MAP.places.labadiBeach:{x:600,z:700};
 const M=o=>Object.assign(new BABYLON.StandardMaterial('coast',scene),o);
 const lbl=(t,x,y,z)=>{const dt=new BABYLON.DynamicTexture('coast-label',{width:512,height:128},scene,true),c=dt.getContext();c.fillStyle='#17191c';c.fillRect(0,0,512,128);c.fillStyle='#fcd116';c.font='bold 44px Trebuchet MS';c.textAlign='center';c.textBaseline='middle';c.fillText(t,256,64);dt.update();
  const p=BABYLON.MeshBuilder.CreatePlane('coast-label',{width:90,height:20},scene);p.position.set(x,y,z);p.rotation.y=Math.PI;p.material=M({diffuseTexture:dt,emissiveTexture:dt,disableLighting:true,backFaceCulling:false});p.isPickable=false;};
 const sand=BABYLON.MeshBuilder.CreateGround('labadi-sand',{width:2500,height:350},scene);sand.position.set(P.x,.04,P.z-175);sand.material=mat('#e3cf9b');sand.receiveShadows=true;
 const sea=BABYLON.MeshBuilder.CreateGround('labadi-sea',{width:12000,height:1500},scene);sea.position.set(P.x,.12,P.z+800);sea.material=M({diffuseColor:C3('#2f7f9f'),specularColor:new BABYLON.Color3(.9,.9,.9),specularPower:60});
 if(typeof palm==='function')for(let x=-1100;x<=1100;x+=220)palm(P.x+x,P.z-325+(Math.abs(x)%3)*15);
 lbl('LABADI BEACH',P.x,30,P.z-290);
 E.push({n:'Labadi Beach',x:P.x,z:P.z});
 (window.ACCRA_MODULES=window.ACCRA_MODULES||{}).landmarks=1;
})();