/* accra-upgrade.js — loads AFTER the game script and upgrades the look.
 * It does not change your game logic. To undo, remove its <script> line.
 * Needs accra-assets.js loaded first. */
(function () {
  try {
    const A = AccraAssets, B = BABYLON;

    // ---------- 1. NEW CHARACTER (replaces the capsule) ----------
    const hero = A.createCharacter(scene, { shirt: "#e8b923", pants: "#2d4a7a", scale: 0.85 });
    hero.root.parent = player;            // follows the old player capsule
    hero.root.position.set(0, -0.91, 0);  // feet on the ground
    player.isVisible = false;             // hide the old capsule
    hero.root.getChildMeshes().forEach(m => { sg.addShadowCaster(m); m.isPickable = false; });
    let lx = player.position.x, lz = player.position.z;
    scene.onBeforeRenderObservable.add(() => {
      const dt = Math.max(engine.getDeltaTime() / 1000, 0.001);
      const sp = Math.hypot(player.position.x - lx, player.position.z - lz) / dt;
      lx = player.position.x; lz = player.position.z;
      hero.setMoving(sp > 0.6);           // walk animation when moving
    });
    window.hero = hero;                   // change colours later: see accra-assets.js

    // ---------- 2. TIN ROOFS on low and mid-rise buildings ----------
    const roofSrc = {};
    function prismSrc(hex) {
      if (roofSrc[hex]) return roofSrc[hex];
      const gp = new B.TransformNode("gp", scene); gp.rotation.z = Math.PI / 2;
      const p = B.MeshBuilder.CreateCylinder("rp", { diameter: 2, tessellation: 3, height: 1 }, scene);
      p.convertToFlatShadedMesh(); p.rotation.x = Math.PI / 2; p.parent = gp;
      gp.computeWorldMatrix(true); p.computeWorldMatrix(true);
      const m = B.Mesh.MergeMeshes([p], true, true);
      m.material = mat(hex); m.isVisible = false; m.isPickable = false;
      return (roofSrc[hex] = m);
    }
    const flatRoofs = {};
    scene.meshes.forEach(m => { if (m.name === "rf") flatRoofs[m.position.x.toFixed(1) + "," + m.position.z.toFixed(1)] = m; });
    const RC = ["#b5472c", "#4a5d7a", "#2f6f4f", "#8a8a84", "#8b3a2a", "#3d5a80"];
    const AW = ["#c8553d", "#2456a6", "#d9822b", "#3f8f7a"];

    // ---------- 3. STRIPED SHOP AWNINGS (Makola buildings) ----------
    const awnSrc = {};
    function awningSrc(hex) {
      if (awnSrc[hex]) return awnSrc[hex];
      const t = new B.DynamicTexture("aw", { width: 64, height: 8 }, scene, false), c = t.getContext();
      for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? "#ffffff" : hex; c.fillRect(i * 8, 0, 8, 8); }
      t.update();
      const m = B.MeshBuilder.CreateBox("awn", { width: 1, height: 0.08, depth: 1 }, scene);
      const mt = new B.StandardMaterial("awm" + hex, scene);
      mt.diffuseTexture = t; mt.specularColor = B.Color3.Black();
      m.material = mt; m.isVisible = false; m.isPickable = false;
      return (awnSrc[hex] = m);
    }
    const nearest = v => R.reduce((a, r) => Math.abs(v - r) < Math.abs(a) ? v - r : a, 1e9);
    function awning(b, w, d, col) {
      const dx = nearest(b.position.x), dz = nearest(b.position.z);
      let ox = 0, oz = 0, W, half;
      if (Math.abs(dz) <= Math.abs(dx)) { oz = -Math.sign(dz) || 1; W = w - 0.6; half = d / 2; }
      else { ox = -Math.sign(dx) || 1; W = d - 0.6; half = w / 2; }
      const i = awningSrc(col).createInstance("awi");
      i.scaling.set(W, 1, 1.5);
      i.rotation.set(0.3, Math.atan2(ox, oz), 0);
      i.position.set(b.position.x + ox * (half + 0.7), 3.1, b.position.z + oz * (half + 0.7));
      i.isPickable = false;
    }

    let n = 0;
    scene.meshes.filter(m => m.name === "bd").forEach(b => {
      const e = b.getBoundingInfo().boundingBox.extendSize, w = e.x * 2, h = e.y * 2, d = e.z * 2;
      if (h > 20 || w < 6) return;                       // leave the tall glass towers alone
      const rf = flatRoofs[b.position.x.toFixed(1) + "," + b.position.z.toFixed(1)];
      if (rf) rf.setEnabled(false);
      const span = Math.min(w, d), len = Math.max(w, d), rh = Math.min(span * 0.2, 3.2), sy = rh / 1.5;
      const r = prismSrc(RC[n % RC.length]).createInstance("rfi");
      r.scaling.set((span + 1) / 1.732, sy, len + 1);
      r.rotation.y = w > d ? Math.PI / 2 : 0;
      r.position.set(b.position.x, h + 0.5 * sy, b.position.z);
      r.isPickable = false;
      if (w <= 9.4 && h <= 6.3) awning(b, w, d, AW[n % AW.length]);
      n++;
    });

    // ---------- 4. KIOSKS and TROTROS along the streets ----------
    function mergeAsset(root) {
      root.computeWorldMatrix(true);
      const ms = root.getChildMeshes();
      ms.forEach(m => m.computeWorldMatrix(true));
      const m = B.Mesh.MergeMeshes(ms, true, true, undefined, false, true);
      root.dispose(true, false);
      return m;
    }
    function placer(make) {            // first placement is the real mesh, the rest are cheap instances
      let src = null;
      return (x, z, ry) => {
        let m;
        if (!src) { src = mergeAsset(make()); m = src; sg.addShadowCaster(m); m.receiveShadows = true; }
        else m = src.createInstance("i");
        m.position.set(x, 0, z); m.rotation.y = ry; m.checkCollisions = true;
        return m;
      };
    }
    const kiosks = [
      placer(() => A.createKiosk(scene, { color: "#d9382c", awning: "#ffd23f" })),
      placer(() => A.createKiosk(scene, { color: "#2f7fd0", awning: "#ffffff" })),
      placer(() => A.createKiosk(scene, { color: "#2f8f5a", awning: "#ffd23f" }))
    ];
    const trotros = [
      placer(() => A.createTrotro(scene, {})),
      placer(() => A.createTrotro(scene, { color: "#f0f0f0", stripe: "#006b3f" }))
    ];
    R.forEach((c, k) => {
      const odd = k % 2;
      const s1 = odd ? 1 : -1, s2 = odd ? -1 : 1;
      kiosks[k % 3](odd ? -100 : 40, c + s1 * 9.2, s1 > 0 ? Math.PI : 0);                       // road along X
      kiosks[(k + 1) % 3](c + s2 * 9.2, odd ? 40 : -100, s2 > 0 ? -Math.PI / 2 : Math.PI / 2);   // road along Z
      const lane = odd ? 2 : -2;
      trotros[k % 2](odd ? 105 : -35, c + lane, lane > 0 ? Math.PI / 2 : -Math.PI / 2);          // parked in lane
      trotros[(k + 1) % 2](c + lane, odd ? -35 : 105, lane > 0 ? 0 : Math.PI);
    });

    console.log("Accra upgrade loaded:", n, "roofs");
  } catch (err) {
    console.error("accra-upgrade failed (game still runs):", err);
  }
})();
