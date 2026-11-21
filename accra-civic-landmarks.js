/* accra-civic-landmarks.js
 * Landmark set for the shared Greater Accra map. Loaded after the core Babylon scene
 * and airport, before the phone destination list is built.
 */
(function () {
  "use strict";
  try {
    const B = BABYLON, M = window.ACCRA_MAP;
    if (!M || !window.ACCRA_LANDMARKS) throw new Error("Accra map or landmark registry is missing");
    const P = M.places, E = window.ACCRA_LANDMARKS;
    const matOf = hex => {
      const key = "civic:" + hex;
      if (scene._civicMats && scene._civicMats[key]) return scene._civicMats[key];
      scene._civicMats = scene._civicMats || {};
      const m = new B.StandardMaterial(key, scene);
      m.diffuseColor = B.Color3.FromHexString(hex);
      m.specularColor = new B.Color3(.08, .08, .08);
      scene._civicMats[key] = m;
      return m;
    };
    const box = (name, w, h, d, x, y, z, color, solid) => {
      const m = B.MeshBuilder.CreateBox(name, { width:w, height:h, depth:d }, scene);
      m.position.set(x,y,z); m.material = matOf(color); m.checkCollisions = !!solid; m.isPickable = false;
      return m;
    };
    const cylinder = (name, diameter, height, x, y, z, color, solid) => {
      const m = B.MeshBuilder.CreateCylinder(name, { diameter, height, tessellation:16 }, scene);
      m.position.set(x,y,z); m.material = matOf(color); m.checkCollisions = !!solid; m.isPickable = false;
      return m;
    };
    const label = (name, x, z, width) => {
      const dt = new B.DynamicTexture("civic-label-" + name, { width:256, height:64 }, scene, false);
      const c = dt.getContext(); c.fillStyle = "#17191c"; c.fillRect(0,0,256,64);
      c.fillStyle = "#fcd116"; c.font = "bold 25px system-ui"; c.textAlign = "center"; c.textBaseline = "middle";
      c.fillText(name.toUpperCase(),128,33,244); dt.update();
      const p = B.MeshBuilder.CreatePlane("civic-label", { width:width || 15, height:3.75 }, scene);
      p.position.set(x, 25, z); p.billboardMode = B.Mesh.BILLBOARDMODE_ALL; p.isPickable = false;
      const m = new B.StandardMaterial("civic-label-mat", scene);
      m.diffuseTexture = dt; m.emissiveTexture = dt; m.disableLighting = true; m.backFaceCulling = false; m.fogEnabled = false;
      p.material = m;
    };
    const clearBlocks = (x,z,rx,rz) => {
      scene.meshes.filter(m => (m.name === "bd" || m.name === "rf") &&
        Math.abs(m.position.x-x) < rx && Math.abs(m.position.z-z) < rz).forEach(m => m.dispose());
    };
    const addPlace = (key, name) => {
      const p = P[key]; if (!p) return;
      if (!E.some(q => q.n === name)) E.push({ n:name, x:p.x, z:p.z });
    };
    const ground = (name,w,d,x,z,color) => {
      const m = B.MeshBuilder.CreateGround(name, { width:w, height:d }, scene);
      m.position.set(x,.035,z); m.material = matOf(color); m.receiveShadows = true; m.checkCollisions = false;
      return m;
    };

    // Named roads sit over the broad district streets and provide recognisable Accra routes.
    const asphalt = matOf("#303236"), yellow = matOf("#e6c84b");
    M.namedRoads.forEach(route => {
      for (let i=0;i<route.points.length-1;i++) {
        const a=route.points[i], b=route.points[i+1], dx=b[0]-a[0], dz=b[1]-a[1], len=Math.hypot(dx,dz);
        if (len < 1) continue;
        const angle=Math.atan2(dx,dz), mx=(a[0]+b[0])/2, mz=(a[1]+b[1])/2;
        const surf=B.MeshBuilder.CreateBox("named-road",{width:route.width,height:.06,depth:len},scene);
        surf.position.set(mx,.055,mz); surf.rotation.y=angle; surf.material=asphalt; surf.isPickable=false; surf.checkCollisions=false;
        const mark=B.MeshBuilder.CreateBox("road-mark",{width:.28,height:.025,depth:Math.max(4,len-8)},scene);
        mark.position.set(mx,.09,mz); mark.rotation.y=angle; mark.material=yellow; mark.isPickable=false;
      }
    });

    // Black Star Square / Independence Square: open parade ground and the Black Star Gate.
    {
      const p=P.blackStarSquare; clearBlocks(p.x,p.z,52,38);
      ground("black-star-square",78,44,p.x,p.z,"#aaa99f");
      box("square-apron",70,.08,36,p.x,.08,p.z,"#c5c3b8",false);
      [-16,16].forEach(dx=>box("black-star-pillar",3,12,3,p.x+dx,6,p.z+13,"#e6e3d8",true));
      box("black-star-crossbeam",38,2.2,3,p.x,12,p.z+13,"#e6e3d8",true);
      box("black-star-emblem-1",1.1,4.8,.5,p.x,14.7,p.z+14.8,"#17191c",false);
      box("black-star-emblem-2",4.8,1.1,.5,p.x,14.7,p.z+14.8,"#17191c",false);
      box("unknown-soldier-plinth",7,1.3,5,p.x-22,.65,p.z-8,"#d6d3c9",true);
      label("Black Star Square",p.x,p.z-22,18);
      addPlace("blackStarSquare","Black Star Square");
    }

    // Kwame Nkrumah Memorial Park and the adjacent Arts Centre.
    {
      const p=P.nkrumahPark; clearBlocks(p.x,p.z,36,30);
      ground("nkrumah-park",64,52,p.x,p.z,"#668b4e");
      box("memorial-path",5,.06,48,p.x,.08,p.z,"#d7cbb0",false);
      cylinder("memorial-pool",25,.5,p.x,.25,p.z,"#5c9da9",false);
      cylinder("memorial-base",17,3,p.x,1.8,p.z,"#d9d6ca",true);
      const dome=B.MeshBuilder.CreateSphere("nkrumah-dome",{diameter:16,segments:16},scene);
      dome.position.set(p.x,7,p.z); dome.scaling.y=.62; dome.material=matOf("#b8b9b2"); dome.isPickable=false;
      for(let i=0;i<6;i++){const a=i*Math.PI/3; cylinder("memorial-column",1.1,6,p.x+10*Math.cos(a),3,p.z+10*Math.sin(a),"#e9e6dc",true);}
      label("Kwame Nkrumah Memorial Park",p.x,p.z-31,24);
      addPlace("nkrumahPark","Kwame Nkrumah Memorial Park");

      const a=P.artsCentre; clearBlocks(a.x,a.z,30,24);
      ground("arts-centre",54,40,a.x,a.z,"#b9a98c");
      const roof=["#c8102e","#fcd116","#006b3f","#2456a6"];
      for(let r=0;r<2;r++)for(let c=0;c<4;c++){
        const x=a.x-18+c*12,z=a.z-8+r*17,col=roof[(r*2+c)%roof.length];
        box("arts-centre-stall",8,2.5,7,x,1.25,z,"#d9c6a2",true);
        box("arts-centre-canopy",9,.35,8,x,2.7,z,col,false);
      }
      label("Accra Arts Centre",a.x,a.z-25,16);
      addPlace("artsCentre","Accra Arts Centre");
    }

    // National Theatre: broad white performance hall with the distinctive folded roof.
    {
      const p=P.nationalTheatre; clearBlocks(p.x,p.z,42,32);
      ground("national-theatre-plaza",78,58,p.x,p.z,"#b9b8b0");
      box("national-theatre-main",48,13,34,p.x,6.5,p.z,"#e5e4dc",true);
      const roof1=box("theatre-roof-left",34,2.2,25,p.x-9,14,p.z-3,"#f7f5eb",false); roof1.rotation.z=-.24;
      const roof2=box("theatre-roof-right",34,2.2,25,p.x+9,14,p.z+3,"#d8d8d2",false); roof2.rotation.z=.24;
      box("theatre-glass-front",30,7,.35,p.x,6,p.z+17.2,"#2b536b",false);
      for(let i=-2;i<=2;i++)box("theatre-column",.7,8,.7,p.x+i*7,4.2,p.z+18,"#dedbd0",false);
      label("National Theatre of Ghana",p.x,p.z-27,20);
      addPlace("nationalTheatre","National Theatre of Ghana");
    }

    // Jamestown Lighthouse and a small working harbour edge.
    {
      const p=P.jamestownLighthouse; clearBlocks(p.x,p.z,25,25);
      ground("jamestown-harbour",72,58,p.x,p.z,"#b6a17c");
      cylinder("lighthouse-base",7,2,p.x,1,p.z,"#dedbd0",true);
      cylinder("jamestown-lighthouse",4.5,24,p.x,13,p.z,"#f2eee3",true);
      [5,10,15,20].forEach(y=>cylinder("lighthouse-red-band",4.58,.75,p.x,y,p.z,"#c8102e",false));
      cylinder("lighthouse-lantern",3.2,2.6,p.x,26.2,p.z,"#2b3540",true);
      const beam=B.MeshBuilder.CreateCylinder("lighthouse-beacon",{diameter:1.1,height:1.1,tessellation:12},scene);
      beam.position.set(p.x,28,p.z); beam.material=matOf("#fff4bf"); beam.isPickable=false;
      for(let i=0;i<5;i++)box("harbour-jetty",3,.25,22,p.x-24+i*12,.16,p.z+28,"#76573e",false);
      label("Jamestown Lighthouse",p.x,p.z-22,18);
      addPlace("jamestownLighthouse","Jamestown Lighthouse");
    }

    // Osu Castle / Christiansborg: walled coastal fort with corner towers.
    {
      const p=P.osuCastle; clearBlocks(p.x,p.z,48,38);
      ground("osu-castle-courtyard",86,66,p.x,p.z,"#b9b3a4");
      box("castle-north-wall",78,7,3,p.x,3.5,p.z-31,"#e4e1d5",true);
      box("castle-south-wall",78,7,3,p.x,3.5,p.z+31,"#e4e1d5",true);
      box("castle-west-wall",3,7,60,p.x-38,3.5,p.z,"#e4e1d5",true);
      box("castle-east-wall",3,7,60,p.x+38,3.5,p.z,"#e4e1d5",true);
      [[-36,-29],[36,-29],[-36,29],[36,29]].forEach(q=>box("castle-tower",9,10,9,p.x+q[0],5,p.z+q[1],"#d8d5c8",true));
      box("castle-main",34,12,22,p.x,6,p.z,"#eeeade",true);
      box("castle-roof",38,1.2,26,p.x,12.6,p.z,"#a8a69d",false);
      label("Osu Castle",p.x,p.z-38,14);
      addPlace("osuCastle","Osu Castle (Christiansborg)");
    }

    // Kwame Nkrumah Circle: a planted roundabout and four connecting approaches.
    {
      const p=P.circle; clearBlocks(p.x,p.z,46,42);
      const ring=B.MeshBuilder.CreateTorus("circle-roundabout",{diameter:64,thickness:12,tessellation:48},scene);
      ring.position.set(p.x,.09,p.z); ring.scaling.y=.04; ring.material=asphalt; ring.isPickable=false;
      const island=B.MeshBuilder.CreateCylinder("circle-island",{diameter:50,height:.25,tessellation:32},scene);
      island.position.set(p.x,.13,p.z); island.material=matOf("#4c8041"); island.isPickable=false;
      for(let i=0;i<8;i++){const a=i*Math.PI/4; const x=p.x+17*Math.cos(a),z=p.z+17*Math.sin(a); cylinder("circle-tree-trunk",.8,4,x,2,z,"#79583c",false); const crown=B.MeshBuilder.CreateSphere("circle-tree-crown",{diameter:5,segments:6},scene); crown.position.set(x,5,z); crown.material=matOf("#397445"); crown.isPickable=false;}
      [[-1,0],[1,0],[0,-1],[0,1]].forEach(v=>{const len=52,road=box("circle-approach",12,.06,len,p.x+v[0]*48,.06,p.z+v[1]*48,"#303236",false);road.rotation.y=v[0]===0?0:Math.PI/2;});
      label("Kwame Nkrumah Circle",p.x,p.z-43,18);
      addPlace("circle","Kwame Nkrumah Circle");
    }

    // 37 Military Hospital: a distinct civic hospital campus.
    {
      const p=P.militaryHospital; clearBlocks(p.x,p.z,48,34);
      ground("37-hospital-campus",92,66,p.x,p.z,"#d5d9d3");
      box("37-hospital-main",62,13,34,p.x,6.5,p.z,"#e9edf0",true);
      box("37-hospital-wing",26,9,24,p.x+42,4.5,p.z+2,"#dce5e9",true);
      box("37-hospital-roof",66,1,38,p.x,13.5,p.z,"#9faab2",false);
      box("37-hospital-cross-v",2.2,8,.5,p.x,18,p.z+17.5,"#c8102e",false);
      box("37-hospital-cross-h",7,2.2,.5,p.x,18,p.z+17.5,"#c8102e",false);
      label("37 Military Hospital",p.x,p.z-30,18);
      addPlace("militaryHospital","37 Military Hospital");
    }

    // Achimota Forest: green reserve with clear paths and clustered tree cover.
    {
      const p=P.achimotaForest; clearBlocks(p.x,p.z,105,82);
      ground("achimota-forest",210,164,p.x,p.z,"#416d3c");
      box("forest-path",5,.07,150,p.x,.08,p.z,"#c5b58d",false);
      for(let i=0;i<20;i++){
        const x=p.x-76+(i%5)*38+(i%2)*4,z=p.z-48+Math.floor(i/5)*28;
        cylinder("forest-trunk",.8,5,x,2.5,z,"#79583c",false);
        const crown=B.MeshBuilder.CreateSphere("forest-canopy",{diameter:7,segments:6},scene);
        crown.position.set(x,6,z); crown.material=matOf(i%4===0?"#315f36":"#397445"); crown.isPickable=false;
      }
      label("Achimota Forest Reserve",p.x,p.z-90,20);
      addPlace("achimotaForest","Achimota Forest Reserve");
    }

    // University of Ghana, Legon: campus gate and central academic block.
    {
      const p=P.universityOfGhana; clearBlocks(p.x,p.z,62,42);
      ground("university-campus",126,84,p.x,p.z,"#718d58");
      box("university-gate-left",3,8,3,p.x-28,4,p.z+28,"#e7e3d7",true);
      box("university-gate-right",3,8,3,p.x+28,4,p.z+28,"#e7e3d7",true);
      box("university-gate-beam",60,2,3,p.x,8,p.z+28,"#e7e3d7",true);
      box("university-main",72,15,36,p.x,7.5,p.z-4,"#e8e4d9",true);
      box("university-roof",78,1,42,p.x,15.5,p.z-4,"#9b9e98",false);
      box("university-sign",24,2,.5,p.x,10,p.z+29,"#1d4b35",false);
      label("University of Ghana · Legon",p.x,p.z-42,22);
      addPlace("universityOfGhana","University of Ghana, Legon");
    }

    // Tema Harbour: container stacks, quay apron and a gantry crane at the eastern end of Spintex Road.
    {
      const p=P.temaHarbour;
      ground("tema-harbour-apron",240,150,p.x,p.z,"#727b7d");
      box("tema-quay-edge",240,3,5,p.x,1.5,p.z+72,"#59666a",true);
      const cols=["#c8102e","#2456a6","#006b3f","#e6b72f","#d8dce0"];
      for(let r=0;r<3;r++)for(let q=0;q<4;q++){
        const x=p.x-82+q*48,z=p.z-48+r*30,col=cols[(r*3+q)%cols.length];
        box("tema-container-lower",34,8,12,x,4,z,col,true);
        if((r+q)%2===0)box("tema-container-upper",34,8,12,x,12,z,col,true);
      }
      [-52,52].forEach(dx=>box("tema-crane-leg",4,24,4,p.x+dx,12,p.z-5,"#d7d9d6",true));
      box("tema-crane-beam",116,4,5,p.x,26,p.z-5,"#d7d9d6",true);
      box("tema-crane-trolley",10,3,8,p.x+12,22,p.z-5,"#c8102e",false);
      box("tema-crane-spreader",18,1,7,p.x+12,17,p.z-5,"#25282c",false);
      label("Tema Harbour",p.x,p.z-82,18);
      addPlace("temaHarbour","Tema Harbour");
    }
    (window.ACCRA_MODULES = window.ACCRA_MODULES || {}).civicLandmarks = 1;
    console.log("Accra civic landmarks ready:", E.length, "registered destinations");
  } catch (err) {
    console.error("Accra civic landmarks failed:", err);
  }
})();
