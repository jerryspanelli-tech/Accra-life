// landmarks.js - shared Accra coastline. The stadium is built once in accra-upgrade.js.
(function(){
 const E=window.ACCRA_LANDMARKS=window.ACCRA_LANDMARKS||[];
 const P=window.ACCRA_MAP?window.ACCRA_MAP.places.labadiBeach:{x:600,z:700};
 const M=o=>Object.assign(new BABYLON.StandardMaterial('coast',scene),o);
 const lbl=(t,x,y,z)=>{const dt=new BABYLON.DynamicTexture('coast-label',{width:512,height:128},scene,true),c=dt.getContext();c.fillStyle='#17191c';c.fillRect(0,0,512,128);c.fillStyle='#fcd116';c.font='bold 44px Trebuchet MS';c.textAlign='center';c.textBaseline='middle';c.fillText(t,256,64);dt.update();
  const p=BABYLON.MeshBuilder.CreatePlane('coast-label',{width:18,height:4},scene);p.position.set(x,y,z);p.rotation.y=Math.PI;p.material=M({diffuseTexture:dt,emissiveTexture:dt,disableLighting:true,backFaceCulling:false});p.isPickable=false;};
 const sand=BABYLON.MeshBuilder.CreateGround('labadi-sand',{width:500,height:70},scene);sand.position.set(P.x,.04,P.z-35);sand.material=mat('#e3cf9b');sand.receiveShadows=true;
 const sea=BABYLON.MeshBuilder.CreateGround('labadi-sea',{width:1000,height:300},scene);sea.position.set(P.x,.12,P.z+160);sea.material=M({diffuseColor:C3('#2f7f9f'),specularColor:new BABYLON.Color3(.9,.9,.9),specularPower:60});
 const wall=BABYLON.MeshBuilder.CreateBox('labadi-shore-wall',{width:1000,height:4,depth:1},scene);wall.position.set(P.x,2,P.z+1);wall.isVisible=false;wall.checkCollisions=true;
 if(typeof palm==='function')for(let x=-220;x<=220;x+=44)palm(P.x+x,P.z-65+(Math.abs(x)%3)*3);
 lbl('LABADI BEACH',P.x,6,P.z-58);
 E.push({n:'Labadi Beach',x:P.x,z:P.z});
 (window.ACCRA_MODULES=window.ACCRA_MODULES||{}).landmarks=1;
})();