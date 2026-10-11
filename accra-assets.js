/* accra-assets.js — low-poly Accra-style assets for Babylon.js
 *
 * const hero = AccraAssets.createCharacter(scene, { shirt: "#e8b923" });
 * hero.root.position.set(0, 0, 0);   // move this
 * hero.setMoving(true);              // walk animation on/off
 *
 * AccraAssets.createHouse(scene, { position: [10,0,5], wall: "#f2c14e" });
 * AccraAssets.createKiosk(scene, { position: [4,0,2] });
 * AccraAssets.createTrotro(scene, { position: [0,0,0] });
 * AccraAssets.createTree(scene, { type: "palm", position: [3,0,3] });
 *
 * Everything faces +Z. Rotate with rotY (radians) in options.
 */
(function (global) {
  const B = BABYLON;

  // ---------- helpers ----------
  function getMat(scene, hex) {
    scene._accraMats = scene._accraMats || {};
    if (!scene._accraMats[hex]) {
      const m = new B.StandardMaterial("acc_" + hex, scene);
      m.diffuseColor = B.Color3.FromHexString(hex);
      m.specularColor = B.Color3.Black();
      scene._accraMats[hex] = m;
    }
    return scene._accraMats[hex];
  }
  function flat(mesh) { mesh.convertToFlatShadedMesh(); return mesh; }
  function node(scene, parent, x, y, z, ry) {
    const n = new B.TransformNode("n", scene);
    n.parent = parent; n.position.set(x || 0, y || 0, z || 0); n.rotation.y = ry || 0;
    return n;
  }
  function box(scene, parent, w, h, d, hex, x, y, z) {
    const m = B.MeshBuilder.CreateBox("b", { width: w, height: h, depth: d }, scene);
    m.material = getMat(scene, hex); m.parent = parent; m.position.set(x, y, z);
    return m;
  }
  function cyl(scene, parent, dTop, dBot, h, tess, hex, x, y, z) {
    const m = B.MeshBuilder.CreateCylinder("c", { diameterTop: dTop, diameterBottom: dBot, height: h, tessellation: tess }, scene);
    flat(m); m.material = getMat(scene, hex); m.parent = parent; m.position.set(x, y, z);
    return m;
  }
  function placeRoot(scene, name, o) {
    const r = new B.TransformNode(name, scene);
    r.position = new B.Vector3(...(o.position || [0, 0, 0]));
    r.rotation.y = o.rotY || 0;
    return r;
  }

  // ---------- CHARACTER ----------
  function createCharacter(scene, o) {
    o = Object.assign({
      skin: "#8d5a3b", hair: "#1b1b1b", shirt: "#e8b923",
      pants: "#2d4a7a", shoes: "#222222", kente: true, scale: 1
    }, o);
    const root = new B.TransformNode("character", scene);
    root.scaling.setAll(o.scale);
    const body = node(scene, root, 0, 0, 0);

    // torso + Ghana-colour sash
    box(scene, body, 0.72, 0.78, 0.4, o.shirt, 0, 1.3, 0);
    if (o.kente) {
      box(scene, body, 0.74, 0.1, 0.42, "#c8102e", 0, 1.02, 0);
      box(scene, body, 0.74, 0.1, 0.42, "#006b3f", 0, 0.92, 0);
    }
    // head, hair, eyes
    const head = B.MeshBuilder.CreateSphere("head", { diameter: 0.52, segments: 6 }, scene);
    flat(head); head.material = getMat(scene, o.skin); head.parent = body;
    head.position.set(0, 1.9, 0); head.scaling.y = 1.05;
    const hair = B.MeshBuilder.CreateSphere("hair", { diameter: 0.56, segments: 6 }, scene);
    flat(hair); hair.material = getMat(scene, o.hair); hair.parent = body;
    hair.position.set(0, 2.03, -0.02); hair.scaling.y = 0.55;
    box(scene, body, 0.07, 0.07, 0.05, "#111111", -0.11, 1.92, 0.24);
    box(scene, body, 0.07, 0.07, 0.05, "#111111", 0.11, 1.92, 0.24);

    // arms (pivot at shoulder) and legs (pivot at hip)
    const arms = [], legs = [];
    [-1, 1].forEach(s => {
      const a = node(scene, body, s * 0.49, 1.62, 0);
      box(scene, a, 0.2, 0.32, 0.22, o.shirt, 0, -0.16, 0);
      box(scene, a, 0.17, 0.4, 0.2, o.skin, 0, -0.52, 0);
      arms.push(a);
      const l = node(scene, root, s * 0.18, 0.88, 0);
      box(scene, l, 0.28, 0.62, 0.3, o.pants, 0, -0.31, 0);
      box(scene, l, 0.3, 0.2, 0.42, o.shoes, 0, -0.78, 0.06);
      legs.push(l);
    });

    // walk cycle
    const state = { moving: false };
    let phase = 0, amp = 0;
    scene.onBeforeRenderObservable.add(() => {
      const dt = scene.getEngine().getDeltaTime() / 1000;
      amp += ((state.moving ? 1 : 0) - amp) * Math.min(1, dt * 10);
      if (state.moving) phase += dt * 11;
      const sw = Math.sin(phase) * 0.75 * amp;
      legs[0].rotation.x = sw;  legs[1].rotation.x = -sw;
      arms[0].rotation.x = -sw; arms[1].rotation.x = sw;
      body.position.y = Math.abs(Math.cos(phase)) * 0.06 * amp;
    });
    return { root, setMoving: v => { state.moving = !!v; } };
  }

  // ---------- HOUSE ----------
  function createHouse(scene, o) {
    o = Object.assign({
      w: 8, d: 7, h: 3.2, wall: "#f2c14e", trim: "#ffffff", roof: "#b5472c",
      roofStyle: "pitched", // "pitched" (tin roof) or "flat" (concrete + water tank)
      door: "#6b3f1e", porch: true, position: [0, 0, 0], rotY: 0
    }, o);
    const root = placeRoot(scene, "house", o);
    const { w, d, h } = o;

    box(scene, root, w, h, d, o.wall, 0, h / 2, 0);
    box(scene, root, w + 0.2, 0.5, d + 0.2, "#7a7468", 0, 0.25, 0); // plinth

    function win(x, y, z, ry) {
      const n = node(scene, root, x, y, z, ry);
      box(scene, n, 1.4, 1.2, 0.1, o.trim, 0, 0, 0.02);
      box(scene, n, 1.15, 0.95, 0.12, "#3b6a8f", 0, 0, 0.04);
      box(scene, n, 1.15, 0.08, 0.14, o.trim, 0, 0, 0.05);
    }
    win(-w * 0.3, h * 0.6, d / 2, 0);
    win(w * 0.3, h * 0.6, d / 2, 0);
    win(w / 2, h * 0.6, 0, Math.PI / 2);
    win(-w / 2, h * 0.6, 0, -Math.PI / 2);
    win(0, h * 0.6, -d / 2, Math.PI);

    // door
    const dn = node(scene, root, 0, 0, d / 2);
    box(scene, dn, 1.4, 2.4, 0.1, o.trim, 0, 1.2, 0.02);
    box(scene, dn, 1.15, 2.25, 0.12, o.door, 0, 1.13, 0.04);
    box(scene, dn, 0.1, 0.1, 0.16, "#e0b030", 0.4, 1.1, 0.06);

    if (o.porch) {
      box(scene, root, 3, 0.2, 1.8, "#bdb7aa", 0, 0.1, d / 2 + 0.9);
      box(scene, root, 3.2, 0.12, 1.9, o.roof, 0, h - 0.3, d / 2 + 0.95);
      box(scene, root, 0.14, h - 0.5, 0.14, o.trim, -1.4, (h - 0.5) / 2 + 0.2, d / 2 + 1.7);
      box(scene, root, 0.14, h - 0.5, 0.14, o.trim, 1.4, (h - 0.5) / 2 + 0.2, d / 2 + 1.7);
    }

    if (o.roofStyle === "pitched") {
      // triangular prism = 3-sided cylinder, rotated so the apex points up
      const rh = w * 0.22, sx = rh / 1.5, sy = (w + 1.2) / Math.sqrt(3);
      const gp = new B.TransformNode("roof", scene);
      gp.parent = root; gp.rotation.z = Math.PI / 2; gp.scaling.set(sx, sy, 1);
      gp.position.y = h + 0.5 * sx;
      const prism = flat(B.MeshBuilder.CreateCylinder("rp", { diameter: 2, tessellation: 3, height: d + 1.2 }, scene));
      prism.rotation.x = Math.PI / 2; prism.parent = gp; prism.material = getMat(scene, o.roof);
    } else {
      box(scene, root, w + 0.3, 0.3, d + 0.3, "#9a9a94", 0, h + 0.15, 0);
      box(scene, root, 1.4, 0.8, 1.4, "#6e6a60", w * 0.25, h + 0.7, -d * 0.2); // stand
      cyl(scene, root, 1.2, 1.2, 1.1, 10, "#1f2a33", w * 0.25, h + 1.65, -d * 0.2); // water tank
    }
    return root;
  }

  // ---------- KIOSK / CONTAINER SHOP ----------
  function createKiosk(scene, o) {
    o = Object.assign({ color: "#d9382c", awning: "#ffd23f", position: [0, 0, 0], rotY: 0 }, o);
    const root = placeRoot(scene, "kiosk", o);
    box(scene, root, 2.8, 2.4, 2.4, o.color, 0, 1.2, 0);
    box(scene, root, 1.8, 0.9, 0.1, "#1d2733", 0, 1.55, 1.2);       // serving window
    box(scene, root, 2.2, 0.12, 0.6, "#8a5a2b", 0, 1.05, 1.5);       // counter
    ["#e8453c", "#4caf50", "#ffd23f"].forEach((c, i) => box(scene, root, 0.3, 0.3, 0.3, c, -0.6 + i * 0.6, 1.26, 1.5));
    const aw = node(scene, root, 0, 2.45, 1.7);
    aw.rotation.x = 0.35;
    for (let i = 0; i < 6; i++) box(scene, aw, 0.5, 0.08, 1.5, i % 2 ? "#ffffff" : o.awning, -1.25 + i * 0.5, 0, 0);
    return root;
  }

  // ---------- TROTRO (minibus) ----------
  function createTrotro(scene, o) {
    o = Object.assign({ color: "#f2c230", stripe: "#c8102e", position: [0, 0, 0], rotY: 0 }, o);
    const root = placeRoot(scene, "trotro", o);
    box(scene, root, 2.1, 1.7, 4.6, o.color, 0, 1.25, 0);
    box(scene, root, 2.14, 0.25, 4.64, o.stripe, 0, 0.8, 0);
    [-1, 0, 1].forEach(i => [-1.06, 1.06].forEach(sx =>
      box(scene, root, 0.06, 0.6, 1.0, "#2b3f55", sx, 1.6, i * 1.3)));
    box(scene, root, 1.7, 0.7, 0.06, "#2b3f55", 0, 1.55, 2.31);   // windscreen
    box(scene, root, 1.9, 0.2, 0.2, "#444444", 0, 0.45, 2.3);     // bumper
    [-1, 1].forEach(sz => [-1.0, 1.0].forEach(sx => {
      const wh = B.MeshBuilder.CreateCylinder("w", { diameter: 0.8, height: 0.3, tessellation: 10 }, scene);
      flat(wh); wh.material = getMat(scene, "#1a1a1a"); wh.parent = root;
      wh.rotation.z = Math.PI / 2; wh.position.set(sx * 1.05, 0.4, sz * 1.5);
    }));
    return root;
  }

  // ---------- TREES ----------
  function createTree(scene, o) {
    o = Object.assign({ type: "palm", position: [0, 0, 0], rotY: 0 }, o);
    const root = placeRoot(scene, "tree", o);
    if (o.type === "palm") {
      cyl(scene, root, 0.25, 0.42, 5, 6, "#7a5230", 0, 2.5, 0);
      const top = node(scene, root, 0, 5, 0);
      for (let i = 0; i < 7; i++) {
        const p = node(scene, top, 0, 0, 0, (i / 7) * Math.PI * 2);
        const t = node(scene, p, 0, 0, 0); t.rotation.x = 0.55;
        box(scene, t, 0.5, 0.06, 2.6, i % 2 ? "#2f8f3a" : "#3aa046", 0, 0, 1.3);
      }
      box(scene, top, 0.3, 0.3, 0.3, "#5a3a1a", 0, -0.1, 0); // coconuts
    } else { // neem / shade tree
      cyl(scene, root, 0.35, 0.55, 2.6, 6, "#6b4a2b", 0, 1.3, 0);
      [[0, 3.6, 0, 3.4], [1.2, 3.2, 0.4, 2.2], [-1.1, 3.3, -0.5, 2.4]].forEach(c => {
        const s = flat(B.MeshBuilder.CreateIcoSphere("crown", { radius: c[3] / 2, subdivisions: 1 }, scene));
        s.material = getMat(scene, "#3f9a45"); s.parent = root; s.position.set(c[0], c[1], c[2]);
      });
    }
    return root;
  }

  global.AccraAssets = { createCharacter, createHouse, createKiosk, createTrotro, createTree };
})(window);
