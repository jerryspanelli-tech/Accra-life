/* accra-upgrade.js — loads AFTER the game script and upgrades the look.
 * It does not change your game logic. To undo, remove its <script> line.
 * Needs accra-assets.js loaded first. */
(function () {
  try {
    const A = AccraAssets, B = BABYLON;

    // ===== SHOPPING, WARDROBE, FITTING ROOM, MALL =====
    const cash = () => (window.ACCRA_STATE ? window.ACCRA_STATE.money : 0);
    const pay = (n, why) => { if (window.ACCRA_ADD) window.ACCRA_ADD(-n, why); };
    const ls = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } };
    const sv = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
    const note = (() => {
      const d = document.createElement("div");
      d.style.cssText = "position:fixed;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 150px);transform:translateX(-50%);background:#25282c;border:1px solid #c9a54a;color:#f2f0ea;padding:8px 14px;border-radius:14px;font:700 14px system-ui;z-index:50;opacity:0;transition:opacity .3s;pointer-events:none;text-align:center;max-width:80%";
      document.body.appendChild(d); let t;
      return m => { d.textContent = m; d.style.opacity = 1; clearTimeout(t); t = setTimeout(() => d.style.opacity = 0, 2400); };
    })();
    // shared panel
    const pan = document.createElement("div");
    pan.style.cssText = "position:fixed;left:50%;top:calc(env(safe-area-inset-top,0px) + 50px);transform:translateX(-50%);width:min(64vw,330px);max-height:72vh;overflow:auto;background:rgba(28,30,33,.95);border:2px solid #c9a54a;border-radius:18px;padding:12px;z-index:40;color:#fff;font:14px system-ui;display:none;touch-action:pan-y";
    document.body.appendChild(pan);
    const BS = "display:block;width:100%;margin:5px 0;border:0;border-radius:12px;background:rgba(255,255,255,.14);color:#fff;font:600 14px system-ui;padding:9px 12px;text-align:left";
    const GOLD = BS + ";background:#c9a54a;color:#17191c;text-align:center;font-weight:800";
    const ttl = t => '<div style="font-weight:800;font-size:16px;color:#c9a54a;margin-bottom:4px">' + t + "</div>";
    let onPan = null, lock = false;
    pan.onclick = e => { const b = e.target.closest("button"); if (b && onPan) onPan(b.dataset); };
    const show = (html, fn) => { pan.innerHTML = html; onPan = fn; pan.style.display = "block"; };
    const hide = () => { pan.style.display = "none"; onPan = null; lock = false; };

    // ---- clothes: wardrobe (owned only), fitting room (buy), first join (free) ----
    const OPT = [["Outfit", "style", 4], ["Hair", "hair", 5], ["Top colour", "top", 8], ["Skin", "skin", 6], ["Trousers", "pants", 6]];
    const PR = { style: [0, 150, 100, 80], hair: 15, top: 20, pants: 20, skin: 0 };
    const price = (k, v) => Array.isArray(PR[k]) ? PR[k][v] : PR[k];
    const owned = ls("accra-owned", { style: [0], hair: [1], top: [3], pants: [0], skin: [0, 1, 2, 3, 4, 5] });
    const has = (k, v) => owned[k].includes(v);
    const markOwned = L => { OPT.forEach(o => { if (!has(o[1], L[o[1]])) owned[o[1]].push(L[o[1]]); }); sv("accra-owned", owned); };
    function styler(mode) {
      const av = window.ACCRA_AVATAR; if (!av) return note("Character not ready yet");
      const L = av.look, backup = JSON.stringify(L);
      const cost = () => OPT.reduce((s, o) => s + (has(o[1], L[o[1]]) ? 0 : price(o[1], L[o[1]])), 0);
      const click = d => {
        if (d.i !== undefined) {
          const o = OPT[+d.i], k = o[1]; let v = L[k], c = 0;
          do { v = (v + 1) % o[2]; c++; } while (mode === "wardrobe" && !has(k, v) && c < o[2]);
          L[k] = v; av.apply(); draw();
        } else if (d.buy) {
          const c = cost(); if (c > cash()) return note("Not enough cash. You need GH\u00A2" + c);
          if (c) pay(c, "Clothing store"); markOwned(L); hide(); note(c ? "Bought and wearing it!" : "Looks good!");
        } else if (d.done) { markOwned(L); hide(); }
        else if (d.x) { Object.assign(L, JSON.parse(backup)); av.apply(); hide(); }
      };
      const draw = () => {
        const c = cost(), shop = mode === "shop";
        show(ttl(shop ? "Fitting room" : mode === "first" ? "Create your character" : "Your wardrobe") +
          OPT.map((o, i) => '<button data-i="' + i + '" style="' + BS + '">' + o[0] + " \u00B7 " + (L[o[1]] + 1) + " / " + o[2] +
            (shop ? (has(o[1], L[o[1]]) ? " \u00B7 owned" : " \u00B7 GH\u00A2" + price(o[1], L[o[1]])) : "") + "</button>").join("") +
          (shop ? '<button data-buy="1" style="' + GOLD + '">' + (c ? "Buy & wear \u00B7 GH\u00A2" + c : "Wear") + '</button><button data-x="1" style="' + BS + ';text-align:center">Cancel</button>'
                : '<button data-done="1" style="' + GOLD + '">Done</button>'), click);
      };
      draw(); lock = mode === "first";
    }
    if (window.ACCRA_AVATAR) { markOwned(window.ACCRA_AVATAR.look); if (window.ACCRA_AVATAR.isNew) setTimeout(() => styler("first"), 1000); }

    // ---- items you can buy: [name, price, parts [w,h,d,x,y,z,colour]] ----
    const ITEMS = {
      fan: ["Standing fan", 60, [[.4,.05,.4,0,.03,0,"#222"],[.06,1,.06,0,.55,0,"#ccc"],[.45,.45,.1,0,1.15,0,"#e8e8e8"]]],
      micro: ["Microwave", 90, [[.5,.3,.4,0,.15,0,"#cfd6dc"],[.3,.2,.02,-.06,.15,.21,"#111"]]],
      cooker: ["Gas cooker", 150, [[.7,.85,.6,0,.43,0,"#e9edf0"],[.7,.04,.6,0,.87,0,"#222"],[.15,.02,.15,-.15,.9,-.12,"#555"],[.15,.02,.15,.15,.9,-.12,"#555"],[.5,.4,.02,0,.4,.31,"#111"]]],
      fridge: ["Refrigerator", 300, [[.8,1.8,.7,0,.9,0,"#cfd6dc"],[.04,.5,.04,.3,1.2,.37,"#555"],[.8,.02,.71,0,1.25,0,"#444"]]],
      tv: ["Television", 350, [[.9,.45,.4,0,.23,0,"#5a3a22"],[1.3,.75,.06,0,.95,0,"#0b0b0e"],[1.2,.65,.02,0,.95,.04,"#1d3b57"]]],
      washer: ["Washing machine", 400, [[.7,.9,.65,0,.45,0,"#f4f7fa"],[.4,.4,.02,0,.45,.33,"#7aa3c0"],[.6,.1,.02,0,.82,.33,"#444"]]],
      bed1: ["Single bed", 120, [[1,.3,2,0,.15,0,"#6d4c2f"],[.95,.2,1.95,0,.4,0,"#e9e6df"],[.6,.12,.35,0,.55,-.7,"#fff"],[1,.7,.08,0,.5,-1,"#5a3a22"]]],
      bed2: ["Double bed", 250, [[1.6,.3,2,0,.15,0,"#6d4c2f"],[1.55,.2,1.95,0,.4,0,"#d9cbb6"],[.6,.12,.35,-.4,.55,-.7,"#fff"],[.6,.12,.35,.4,.55,-.7,"#fff"],[1.6,.8,.08,0,.55,-1,"#5a3a22"]]],
      sofa: ["Sofa", 300, [[2,.4,.9,0,.25,0,"#7a3b3b"],[2,.5,.25,0,.65,-.35,"#7a3b3b"],[.2,.3,.9,-.9,.5,0,"#6a2f2f"],[.2,.3,.9,.9,.5,0,"#6a2f2f"]]],
      dining: ["Dining set", 220, [[1.4,.08,.9,0,.75,0,"#8a5a2b"],[.08,.75,.08,-.6,.37,-.38,"#5a3a22"],[.08,.75,.08,.6,.37,-.38,"#5a3a22"],[.08,.75,.08,-.6,.37,.38,"#5a3a22"],[.08,.75,.08,.6,.37,.38,"#5a3a22"],[.4,.06,.4,0,.45,.75,"#6d4c2f"],[.4,.06,.4,0,.45,-.75,"#6d4c2f"]]],
      wardrobe: ["Wardrobe", 180, [[1.2,2,.6,0,1,0,"#6b4a2e"],[.02,1.8,.62,0,1,0,"#3a2616"],[.05,.3,.05,-.1,1,.33,"#c9a54a"],[.05,.3,.05,.1,1,.33,"#c9a54a"]]],
      shelf: ["Bookshelf", 90, [[1,1.8,.35,0,.9,0,"#8a5a2b"],[.9,.25,.3,0,.45,.02,"#c8553d"],[.9,.25,.3,0,.95,.02,"#2456a6"],[.9,.25,.3,0,1.45,.02,"#3f8f7a"]]]
    };
    const APPL = ["fridge", "tv", "cooker", "washer", "micro", "fan"], FURN = ["bed1", "bed2", "sofa", "dining", "wardrobe", "shelf"];
    function item(id, x, z, ry) {
      const nd = new B.TransformNode("it", scene); nd.position.set(x, 0, z); nd.rotation.y = ry || 0;
      ITEMS[id][2].forEach(p => {
        const m = B.MeshBuilder.CreateBox("ip", { width: p[0], height: p[1], depth: p[2] }, scene);
        m.parent = nd; m.position.set(p[3], p[4], p[5]); m.material = mat(p[6]); m.isPickable = false; sg.addShadowCaster(m);
      });
      return nd;
    }
    // bought items are delivered to the villa garage (3 x 3 slots)
    const inv = ls("accra-inv", []);
    const place = i => item(inv[i], VX + [-2.3, 0, 2.3][i % 3], VZ + [3, 5.2, 7.4][Math.floor(i / 3) % 3], 0);
    inv.forEach((_, i) => place(i));
    function shop(name, ids) {
      const draw = () => show(ttl(name) + "<small>Cash: GH\u00A2" + cash() + " \u00B7 delivered to your garage (" + inv.length + "/9)</small>" +
        ids.map(id => '<button data-b="' + id + '" style="' + BS + '">' + ITEMS[id][0] + " \u00B7 GH\u00A2" + ITEMS[id][1] + (inv.includes(id) ? " \u00B7 owned" : "") + "</button>").join("") +
        '<button data-x="1" style="' + BS + ';text-align:center">Close</button>', d => {
          if (d.x) return hide();
          const id = d.b, p = ITEMS[id][1];
          if (inv.includes(id)) return note("You already own this.");
          if (inv.length >= 9) return note("Your garage is full.");
          if (cash() < p) return note("Not enough cash. You need GH\u00A2" + p);
          pay(p, "Mall: " + ITEMS[id][0]); inv.push(id); sv("accra-inv", inv); place(inv.length - 1);
          note(ITEMS[id][0] + " delivered to your garage"); draw();
        });
      draw();
    }

    // ---- the mall: replaces the Makola block at x 15..55, z 17..53; entrance faces the road ----
    const MX = 35, MZ = 35, MH = 4.6;
    scene.meshes.filter(m => (m.name === "bd" || m.name === "rf") && Math.abs(m.position.x - MX) < 26 && Math.abs(m.position.z - MZ) < 26).forEach(m => m.dispose());
    const mw = (lx, lz, sw, sd) => box(sw, MH, sd, MX + lx, MH / 2, MZ + lz, "#efe7d2");
    const fl = (lx, lz, sw, sd, c) => box(sw, .05, sd, MX + lx, .03, MZ + lz, c, false);
    mw(0, 18, 40, .4); mw(-20, 0, .4, 36); mw(20, 0, .4, 36); mw(-12, -18, 16, .4); mw(12, -18, 16, .4);   // outer walls, 8 m entrance
    box(8, 1, .4, MX, MH - .5, MZ - 18, "#efe7d2");
    mw(-6.5, 10, .3, 16); mw(6.5, 10, .3, 16);                                                            // store dividers
    [[-17.875, 4.25], [-8.625, 4.25], [-4.5, 4], [4.5, 4], [8.625, 4.25], [17.875, 4.25]].forEach(s => mw(s[0], 2, s[1], .3)); // store fronts, 5 m doorways
    fl(0, -8, 40, 20, "#e8e2d6"); fl(-13.25, 10, 13.5, 16, "#d9b8b8"); fl(0, 10, 13, 16, "#b9c4cc"); fl(13.25, 10, 13.5, 16, "#c9b79a");
    const mroof = box(40.8, .4, 36.8, MX, MH + .2, MZ, "#8a8a84", false);
    function sign(t, x, y, z, sw, sh, bg, fg) {
      const dt = new B.DynamicTexture("sg", { width: 512, height: 128 }, scene, false), c = dt.getContext();
      c.fillStyle = bg; c.fillRect(0, 0, 512, 128); c.fillStyle = fg; c.font = "bold 54px system-ui"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(t, 256, 66); dt.update();
      const m = B.MeshBuilder.CreatePlane("sn", { width: sw, height: sh }, scene); m.position.set(x, y, z); m.isPickable = false;
      const mt = new B.StandardMaterial("snm", scene); mt.diffuseTexture = dt; mt.emissiveTexture = dt; mt.disableLighting = true; mt.backFaceCulling = false; m.material = mt;
    }
    sign("ACCRA MALL", MX, MH + 1.8, MZ - 18.4, 16, 3.4, "#17191c", "#c9a54a");
    sign("Clothing", MX - 13.25, 3.7, MZ + 1.8, 9, 1.1, "#7a2d4a", "#ffffff");
    sign("Appliances", MX, 3.7, MZ + 1.8, 9, 1.1, "#2456a6", "#ffffff");
    sign("Furniture & Beds", MX + 13.25, 3.7, MZ + 1.8, 9, 1.1, "#8a5a2b", "#ffffff");
    APPL.forEach((id, i) => item(id, MX + (-5 + i * 2), MZ + 16.3, Math.PI));
    FURN.forEach((id, i) => item(id, MX + 13.25 + (-5.5 + i * 2.2), MZ + 16.4, Math.PI));
    for (let i = 0; i < 5; i++) { box(.5, 1, .15, MX - 13.25 - 5 + i * 2.5, 1.2, MZ + 16.2, ["#9a4a42", "#c9a54a", "#56705a", "#4d6a8a", "#e8e6df"][i], false); box(1.6, .05, .4, MX - 13.25 - 5 + i * 2.5, 1.65, MZ + 16.2, "#6d4c2f", false); }
    box(2.4, 2.2, .06, MX - 13.25, 1.4, MZ + 17.7, "#9cc9e0", false);
    [-8, 8].forEach(x => { box(2.5, .5, .7, MX + x, .25, MZ - 8, "#6d4c2f", false); [-4, 4].forEach(z => { box(.8, .5, .8, MX + x, .25, MZ + z - 10, "#7a5a3a", false); const s = B.MeshBuilder.CreateSphere("pl", { diameter: 1.4, segments: 5 }, scene); s.convertToFlatShadedMesh(); s.position.set(MX + x, 1.2, MZ + z - 10); s.material = mat("#3f8f4a"); s.isPickable = false; }); });

    // gold beam over the mall so it is easy to find, plus a banner proving this version is loaded
    {
      const bm = B.MeshBuilder.CreateCylinder("mallbeam", { height: 70, diameter: 3 }, scene);
      bm.position.set(MX, 35, MZ - 22); bm.isPickable = false;
      const bmt = new B.StandardMaterial("mallbeamm", scene);
      bmt.emissiveColor = B.Color3.FromHexString("#c9a54a"); bmt.disableLighting = true; bmt.alpha = .35; bmt.fogEnabled = false; bm.material = bmt;
      note("Accra Mall loaded \u2014 follow the gold beam");
      if (/newchar/.test(location.search)) setTimeout(() => styler("first"), 1200);
    }
    // ---- "interact" button: appears next to the car button when you are at a wardrobe, fitting room or store counter ----
    const POINTS = [
      { x: VX - 5, z: VZ - .55, r: 2.4, t: "\uD83D\uDC54 Wardrobe", ok: p => p.z < VZ - .2, f: () => styler("wardrobe") },
      { x: MX - 13.25, z: MZ + 12.5, r: 6, t: "\uD83E\uDE9E Fitting room", f: () => styler("shop") },
      { x: MX, z: MZ + 12.5, r: 6, t: "\uD83D\uDCFA Appliances", f: () => shop("Home appliances", APPL) },
      { x: MX + 13.25, z: MZ + 12.5, r: 6, t: "\uD83D\uDECF\uFE0F Furniture & beds", f: () => shop("Furniture & beds", FURN) }
    ];
    const ab = document.createElement("button");
    ab.style.cssText = "position:fixed;right:calc(env(safe-area-inset-right,0px) + 174px);bottom:calc(env(safe-area-inset-bottom,0px) + 28px);height:50px;padding:0 18px;border:0;border-radius:25px;background:#c9a54a;color:#17191c;font:800 15px system-ui;z-index:8;display:none;touch-action:none";
    document.body.appendChild(ab);
    let cp = null, ft = 0;
    ab.onclick = () => { if (cp) cp.f(); };
    scene.onBeforeRenderObservable.add(() => {
      if (ft++ % 6) return;
      const p = player.position; cp = null;
      if (!driving && !document.body.classList.contains("po")) { let bd = 1e9; POINTS.forEach(q => { const d = Math.hypot(q.x - p.x, q.z - p.z); if (d < q.r && d < bd && (!q.ok || q.ok(p))) { bd = d; cp = q; } }); }
      ab.style.display = cp ? "block" : "none"; if (cp) ab.textContent = cp.t;
      if (!cp && pan.style.display === "block" && !lock) hide();
      mroof.setEnabled(!(Math.abs(p.x - MX) < 20.5 && Math.abs(p.z - MZ) < 18.5));
    });


    // ---------- 1. TIN ROOFS on low and mid-rise buildings ----------
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

    // ---------- 2. STRIPED SHOP AWNINGS (Makola buildings) ----------
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

    // ---------- 3. KIOSKS and TROTROS along the streets ----------
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
