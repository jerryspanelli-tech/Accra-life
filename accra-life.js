/* accra-life.js — loaded by accra-upgrade.js.
 * Vitals (health, energy, hunger, hygiene, mood), sitting, sleeping, fridge, cooking, laptop,
 * food kiosks, and homes you can rent or buy (towers, houses, a mansion) with real interiors. */
(function () {
  const K0 = window.ACCRA_KIT;
  try {
    const K = window.ACCRA_KIT, AV = window.ACCRA_AVATAR;
    if (!K || !AV) { console.log("accra-life: needs accra-upgrade.js and online.js"); return; }
    const B = BABYLON, P = Math.PI, { item, note, show, hide, ttl, BS, GOLD, cash, pay, ls, sv, points } = K;
    const clamp = v => Math.max(0, Math.min(100, v));
    const earn = (n, why) => { if (window.ACCRA_ADD) window.ACCRA_ADD(n, why); };
    const st = Object.assign({ hp: 100, en: 100, hu: 80, hy: 80, md: 70, food: {}, keys: {}, play: 0 }, ls("accra-life", {}));
    const SB = "border:0;border-radius:9px;background:#c9a54a;color:#17191c;font:700 12px system-ui;padding:6px 10px;margin:4px 4px 0 0";
    const CLOSE = '<button data-x="1" style="' + BS + ';text-align:center">Close</button>';
    let seated = null, busy = false, inside = null, ret = null;
    const tp = (x, z) => player.position.set(x, .91, z);

    // ---------- fade helper ----------
    const fadeEl = document.createElement("div");
    fadeEl.style.cssText = "position:fixed;inset:0;background:#000;opacity:0;pointer-events:none;transition:opacity .6s;z-index:60";
    document.body.appendChild(fadeEl);
    const fade = (ms, mid, end) => { busy = true; fadeEl.style.opacity = 1; setTimeout(() => { if (mid) mid(); fadeEl.style.opacity = 0; setTimeout(() => { busy = false; if (end) end(); }, 600); }, ms); };

    // ---------- vitals HUD ----------
    const hud = document.createElement("div");
    hud.style.cssText = "position:fixed;left:8px;top:calc(env(safe-area-inset-top,0px) + 56px);width:112px;background:rgba(28,30,33,.72);border-radius:12px;padding:5px 7px;z-index:5;font:11px system-ui;color:#fff;pointer-events:none";
    document.body.appendChild(hud);
    const BAR = [["hp", "\u2764\uFE0F", "#e5484d"], ["en", "\u26A1", "#f5c542"], ["hu", "\uD83C\uDF7D\uFE0F", "#f08a3c"], ["hy", "\uD83D\uDEBF", "#4aa3d9"], ["md", "\uD83D\uDE42", "#5cc27a"]];
    const paintHud = () => { hud.innerHTML = BAR.map(b => '<div style="display:flex;align-items:center;gap:5px;margin:2px 0"><span style="width:14px">' + b[1] + '</span><div style="flex:1;height:7px;background:rgba(255,255,255,.18);border-radius:4px;overflow:hidden"><div style="width:' + clamp(st[b[0]]) + '%;height:100%;background:' + b[2] + '"></div></div></div>').join(""); };
    paintHud();

    // ---------- slow down when exhausted, freeze when seated or busy ----------
    const mwc = player.moveWithCollisions.bind(player);
    player.moveWithCollisions = v => { const f = (busy || seated) ? 0 : (st.en < 12 ? .8 : 1.3); return mwc(new B.Vector3(v.x * f, v.y, v.z * f)); };

    // ---------- seating and sleeping ----------
    function sit(x, z, ry) { seated = { x, z, out: [Math.sin(ry) * 1.1, Math.cos(ry) * 1.1] }; player.position.set(x, .91, z); player.rotation.y = ry; AV.pose = "sit"; }
    function stand() { if (!seated) return; const s = seated; seated = null; AV.pose = null; player.position.set(s.x + s.out[0], .91, s.z + s.out[1]); }
    points.push({ get x() { return player.position.x; }, get z() { return player.position.z; }, r: 1e9, t: "\u2B06 Stand up", ok: () => !!seated, f: stand });
    function sleep(x, z, ry) {
      if (st.en > 85) return note("You are not tired enough to sleep.");
      AV.pose = "sleep"; player.position.set(x, .91, z); player.rotation.y = ry;
      fade(2600, () => { st.en = 100; st.hp = clamp(st.hp + 20); st.hu = clamp(st.hu - 12); st.hy = clamp(st.hy - 8); st.md = clamp(st.md + 10); },
        () => { AV.pose = null; player.position.set(x + Math.cos(ry) * 1.7, .91, z - Math.sin(ry) * 1.7); note("You slept well. Energy restored."); });
    }
    function wash() { fade(1500, () => { st.hy = 100; st.md = clamp(st.md + 6); }, () => note("Fresh and clean!")); }

    // ---------- food, fridge, cooker, kiosks ----------
    const FOOD = { rice: ["Rice", 15], tomato: ["Tomatoes", 6], chicken: ["Chicken", 25], fish: ["Fish", 20], yam: ["Yam", 12], plantain: ["Plantain", 8], eggs: ["Eggs", 10], bread: ["Bread", 7], oil: ["Cooking oil", 12] };
    const SNACKS = [["Waakye plate", 20, 35, 4], ["Kelewele", 8, 14, 3], ["Sobolo drink", 5, 8, 2], ["Bottled water", 3, 4, 0]];
    const RECIPES = [["Jollof rice", { rice: 1, tomato: 1, oil: 1 }, 40, 10], ["Fried rice & chicken", { rice: 1, chicken: 1, oil: 1 }, 45, 10], ["Fried yam & fish", { yam: 1, fish: 1, oil: 1 }, 45, 10], ["Omelette & bread", { eggs: 1, bread: 1, oil: 1 }, 30, 6], ["Fried plantain", { plantain: 1, oil: 1 }, 25, 5]];
    function fridge() {
      const ks = Object.keys(FOOD).filter(k => st.food[k] > 0);
      show(ttl("Your fridge") + (ks.length ? ks.map(k => '<div style="padding:5px 2px">' + FOOD[k][0] + " \u00D7 " + st.food[k] + "</div>").join("") : '<div style="padding:6px 0">Empty. Buy groceries at a kiosk, in the mall, or on your laptop.</div>') + CLOSE, hide);
    }
    function cook() {
      const draw = () => show(ttl("Cooker") + RECIPES.map((r, i) => {
        const ok = Object.keys(r[1]).every(k => (st.food[k] || 0) >= r[1][k]);
        return '<button data-i="' + i + '" style="' + BS + (ok ? "" : ";opacity:.5") + '">' + r[0] + (ok ? " \u00B7 cook" : " \u00B7 need " + Object.keys(r[1]).map(k => FOOD[k][0]).join(", ")) + "</button>";
      }).join("") + CLOSE, d => {
        if (d.x) return hide();
        const r = RECIPES[+d.i]; if (!Object.keys(r[1]).every(k => (st.food[k] || 0) >= r[1][k])) return note("You are missing ingredients.");
        hide(); busy = true; note("Cooking " + r[0] + "\u2026");
        setTimeout(() => { Object.keys(r[1]).forEach(k => st.food[k] -= r[1][k]); st.hu = clamp(st.hu + r[2]); st.md = clamp(st.md + r[3]); st.hp = clamp(st.hp + 3); st.en = clamp(st.en + 5); busy = false; note("Enjoy your " + r[0] + "!"); }, 3500);
      });
      draw();
    }
    function kiosk(online) {
      const px = p => online ? Math.ceil(p * 1.1) : p;
      const draw = () => show(ttl(online ? "Online groceries (+10%)" : "Kiosk") + "<small>Cash: GH\u00A2" + cash() + "</small>" +
        (online ? "" : '<div style="margin:6px 0;color:#c9a54a;font-weight:700">Eat now</div>' + SNACKS.map((s, i) => '<button data-s="' + i + '" style="' + BS + '">' + s[0] + " \u00B7 GH\u00A2" + s[1] + " \u00B7 +" + s[2] + " hunger</button>").join("")) +
        '<div style="margin:6px 0;color:#c9a54a;font-weight:700">Groceries for your fridge</div>' +
        Object.keys(FOOD).map(k => '<button data-g="' + k + '" style="' + BS + '">' + FOOD[k][0] + " \u00B7 GH\u00A2" + px(FOOD[k][1]) + " \u00B7 have " + (st.food[k] || 0) + "</button>").join("") + CLOSE, d => {
        if (d.x) return hide();
        if (d.s !== undefined) { const s = SNACKS[+d.s]; if (cash() < s[1]) return note("Not enough cash."); pay(s[1], s[0]); st.hu = clamp(st.hu + s[2]); st.md = clamp(st.md + s[3]); note("Yum! " + s[0]); }
        else { const g = FOOD[d.g], c = px(g[1]); if (cash() < c) return note("Not enough cash."); pay(c, g[0]); st.food[d.g] = (st.food[d.g] || 0) + 1; note(g[0] + " added to your fridge"); }
        draw();
      });
      draw();
    }
    const spots = [[K.MX - 11, K.MZ - 14], [K.MX + 11, K.MZ - 14]];
    R.forEach((c, k) => { const odd = k % 2, s1 = odd ? 1 : -1, s2 = odd ? -1 : 1; spots.push([odd ? -100 : 40, c + s1 * 9.2], [c + s2 * 9.2, odd ? 40 : -100]); });
    spots.forEach(s => points.push({ x: s[0], z: s[1], r: 3.8, t: "\uD83D\uDED2 Kiosk", ok: () => !busy && !seated, f: () => kiosk(false) }));

    // ---------- laptop ----------
    function laptop() {
      show(ttl("\uD83D\uDCBB Laptop") + '<button data-a="work" style="' + BS + '">Freelance work \u00B7 +GH\u00A240\u201390</button><button data-a="shop" style="' + BS + '">Order groceries online</button><button data-a="prop" style="' + BS + '">Property listings</button><button data-a="homes" style="' + BS + '">My homes &amp; rent</button>' + CLOSE, d => {
        if (d.x) return hide();
        if (d.a === "work") {
          if (st.en < 20) return note("Too tired to work. Rest or sleep first."); if (st.hu < 10) return note("You are too hungry to focus. Eat something.");
          hide(); busy = true; note("Working\u2026");
          setTimeout(() => { const g = 40 + Math.floor(Math.random() * 51); earn(g, "Freelance work"); st.en = clamp(st.en - 15); st.hu = clamp(st.hu - 6); st.md = clamp(st.md - 2); busy = false; note("Job done! +GH\u00A2" + g); }, 3000);
        } else if (d.a === "shop") kiosk(true);
        else if (d.a === "prop") allListings();
        else if (d.a === "homes") myHomes();
      });
    }
    // ---------- furniture that does things (villa + every home) ----------
    function reg(list, ox, oz, ok, skipWard) {
      list.forEach(f => {
        const id = f[2], ry = f[3], sc = f[4] || 1, x = ox + f[0], z = oz + f[1], fx = Math.sin(ry), fz = Math.cos(ry);
        const A = (px, pz, r, t, fn) => points.push({ x: px, z: pz, r, t, f: fn, ok: p => !busy && !seated && (!ok || ok(p)) });
        if (/^bed/.test(id)) A(x, z, 2.8, "\uD83D\uDECF\uFE0F Sleep", () => sleep(x, z, ry));
        else if (id === "fridge") A(x + fx * 1.1, z + fz * 1.1, 1.7, "\uD83E\uDDCA Fridge", fridge);
        else if (id === "counter" || id === "kit2") A(x + fx, z + fz, 2.6, "\uD83C\uDF73 Cook", cook);
        else if (id === "desk") { const sx = x + fx * .9 * sc, sz = z + fz * .9 * sc; A(sx, sz, 2, "\uD83D\uDCBB Laptop", () => { sit(sx, sz, ry + P); laptop(); }); }
        else if (id === "sofa" || id === "chair") A(x, z, 2.4, "\uD83D\uDECB\uFE0F Sit", () => sit(x, z, ry));
        else if (id === "dining") { [[1, P], [-1, 0]].forEach(s => { const sx = x + fx * .75 * sc * s[0], sz = z + fz * .75 * sc * s[0]; A(sx, sz, 1.6, "\uD83C\uDF7D\uFE0F Sit", () => sit(sx, sz, ry + s[1])); }); }
        else if (id === "bath") A(x, z, 2.4, "\uD83D\uDEC1 Wash", wash);
        else if (id === "wardrobe" && !skipWard) A(x + fx, z + fz, 1.8, "\uD83D\uDC54 Wardrobe", () => K.styler("wardrobe"));
      });
    }
    reg(window.ACCRA_VILLA || [], VX, VZ, null, true);

    // ---------- home interiors (built the first time you walk in) ----------
    const TPL = {
      room: { W: 6, D: 5, c: "#d8c9ad", p: [], f: [[-2, 1.5, "bed1", P], [2, 2.2, "wardrobe", P], [2.65, -1, "kit2", -P / 2], [2.6, .9, "fridge", -P / 2], [-.3, 2.3, "tv", P], [.4, -.3, "chair", 0, .9]] },
      hall: { W: 10, D: 5, c: "#d8c9ad", p: [[1, -1.65, .3, 1.7], [1, 1.65, .3, 1.7]], f: [[-3, 1.6, "bed2", P], [-3.6, -1.8, "wardrobe", 0], [2.2, -1.6, "sofa", 0], [2.2, 2.3, "tv", P], [4.65, .2, "kit2", -P / 2], [4.6, 2, "fridge", -P / 2], [-3.8, .3, "bath", 0]] },
      studio: { W: 8, D: 6, c: "#cfc3ae", p: [], f: [[-3, 2, "bed2", P], [.6, 2.65, "wardrobe", P], [3.2, 2.6, "tv", P], [2.4, -1, "sofa", 0], [3.65, -2, "kit2", -P / 2], [3.6, .5, "fridge", -P / 2], [-3.6, -.4, "desk", P / 2], [-3.2, -2.2, "bath", 0]] },
      apt1: { W: 10, D: 7, c: "#cfc3ae", p: [[-1.5, -2.35, .3, 2.3], [-1.5, 2.4, .3, 2.2]], f: [[-3.4, 2.3, "bed2", P], [-3, -3.2, "wardrobe", 0], [-4.5, 0, "desk", P / 2], [-3.8, -1.9, "bath", 0], [2.2, -1.6, "sofa", 0], [2.2, 3.2, "tv", P], [1.6, .8, "dining", 0], [4.65, .5, "kit2", -P / 2], [4.6, 2.3, "fridge", -P / 2]] },
      house: { W: 14, D: 9, c: "#cdbfa5", p: [[-1.5, -3.5, .3, 2], [-1.5, 0, .3, 2], [-1.5, 3.5, .3, 2], [-4.325, 0, 5.35, .3]], f: [[-4.3, -3.5, "bed2", 0], [-6.4, -1.2, "wardrobe", P / 2], [-4.3, 3.5, "bed1", P], [-6.4, 1.5, "desk", P / 2], [-2.8, .9, "bath", 0], [2.5, -2.5, "sofa", 0], [2.5, 4.1, "tv", P], [4.5, 1, "dining", 0, 1.2], [6.65, -1.5, "kit2", -P / 2], [6.6, .4, "fridge", -P / 2]] },
      mansion: { W: 18, D: 12, c: "#d6c9b0", p: [[-1.5, -4.25, .3, 3.5], [-1.5, 0, .3, 2], [-1.5, 4.25, .3, 3.5], [-5.325, 0, 7.35, .3]], f: [[-5.5, -5, "bed2", 0, 1.1], [-8.4, -1.5, "wardrobe", P / 2], [-5.5, 5, "bed2", P, 1.1], [-8.4, 2, "desk", P / 2], [-3.4, .9, "bath", 0], [3, -3.5, "sofa", 0, 1.2], [6, -3.5, "sofa", 0], [3, 5.7, "tv", P, 1.4], [5.5, 2.2, "dining", 0, 1.3], [8.65, -3, "kit2", -P / 2], [8.6, -1, "fridge", -P / 2], [7.5, 5.5, "shelf", P], [-.5, -2.5, "chair", 0]] }
    };
    const built = {};
    function build(u) {
      if (built[u.id]) return built[u.id];
      const T = TPL[u.tpl], n = Object.keys(built).length, sx = -285 + (n % 4) * 35, sz = -285 + Math.floor(n / 4) * 35, W = T.W, D = T.D, H = 3.2;
      const wall = (x, z, w, d) => box(w, H, d, sx + x, H / 2, sz + z, "#efe7d2");
      wall(0, D / 2, W, .3); wall(-W / 2, 0, .3, D); wall(W / 2, 0, .3, D);
      const hw = W / 2 - .9; wall(-(W / 2 + .9) / 2, -D / 2, hw, .3); wall((W / 2 + .9) / 2, -D / 2, hw, .3);   // 1.8 m doorway
      T.p.forEach(p => wall(p[0], p[1], p[2], p[3]));
      box(W, .05, D, sx, .03, sz, T.c, false);
      T.f.forEach(f => item(f[2], sx + f[0], sz + f[1], f[3], false, f[4] || 1));
      const here = p => Math.abs(p.x - sx) < W / 2 && Math.abs(p.z - sz) < D / 2;
      reg(T.f, sx, sz, here);
      points.push({ x: sx, z: sz - D / 2 + 1.1, r: 1.9, t: "\uD83D\uDEAA Leave", ok: () => !busy && !seated && here(player.position), f: leave });
      return (built[u.id] = { sx, sz, D, W });
    }
    function enter(u, door) {
      if (busy) return; const b = build(u);
      fade(700, () => { ret = door; inside = u.id; tp(b.sx, b.sz - b.D / 2 + 1.6); player.rotation.y = 0; }, () => note("Welcome to " + u.name));
    }
    function leave() { if (!inside) return; if (seated) stand(); fade(600, () => { const r = ret || { x: VX, z: VZ + 12 }; inside = null; tp(r.x, r.z); }); }

    // ---------- property listings: doors on real buildings ----------
    const WEEK = 600, UNITS = {}, LISTS = [], used = new Set();
    const bds = scene.meshes.filter(m => m.name === "bd" || m.name === "amh");
    const hOf = m => m.getBoundingInfo().boundingBox.extendSize.y * 2;
    const inBlock = (m, i, j) => m.position.x > R[i] && m.position.x < R[i + 1] && m.position.z > R[j] && m.position.z < R[j + 1];
    function pick(i, j, tall) {
      const c = bds.filter(m => !used.has(m) && inBlock(m, i, j));
      if (tall) c.sort((a, b) => hOf(b) - hOf(a));
      else c.sort((a, b) => Math.hypot(a.position.x - R[i] - 12, a.position.z - R[j] - 12) - Math.hypot(b.position.x - R[i] - 12, b.position.z - R[j] - 12));
      const m = c[0]; if (m) used.add(m); return m;
    }
    const nearestRoad = v => R.reduce((a, r) => Math.abs(v - r) < Math.abs(a) ? v - r : a, 1e9);
    function door(b, l1, l2, col) {
      const e = b.getBoundingInfo().boundingBox.extendSize, w = e.x * 2, d = e.z * 2, dx = nearestRoad(b.position.x), dz = nearestRoad(b.position.z);
      let ox = 0, oz = 0, half;
      if (Math.abs(dz) <= Math.abs(dx)) { oz = -Math.sign(dz) || 1; half = d / 2; } else { ox = -Math.sign(dx) || 1; half = w / 2; }
      const gate = b.metadata && b.metadata.gate;
      if (gate) { ox = b.metadata.n[0]; oz = b.metadata.n[1]; half = Math.abs(oz) ? d / 2 : w / 2; }
      else { const dm = B.MeshBuilder.CreateBox("dr", { width: ox ? .3 : 2.2, height: 3.2, depth: oz ? .3 : 2.2 }, scene);
        dm.position.set(b.position.x + ox * (half + .15), 1.6, b.position.z + oz * (half + .15)); dm.material = mat(col); dm.isPickable = false; }
      const dt = new B.DynamicTexture("ds", { width: 512, height: 128 }, scene, false), c = dt.getContext();
      c.fillStyle = "#17191c"; c.fillRect(0, 0, 512, 128); c.fillStyle = "#c9a54a"; c.font = "bold 40px system-ui"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(l1, 256, 40, 490);
      c.fillStyle = "#ffffff"; c.font = "bold 28px system-ui"; c.fillText(l2, 256, 92, 490); dt.update();
      const sn = B.MeshBuilder.CreatePlane("dsn", { width: 7, height: 1.75 }, scene);
      if (gate) sn.position.set(gate[0], 2.6, gate[1]); else sn.position.set(b.position.x + ox * (half + .2), 4.9, b.position.z + oz * (half + .2));
      sn.rotation.y = Math.atan2(-ox, -oz); sn.isPickable = false; if (gate) sn.scaling.set(.7, .7, 1);
      const mt = new B.StandardMaterial("dsm", scene); mt.diffuseTexture = dt; mt.emissiveTexture = dt; mt.disableLighting = true; mt.backFaceCulling = false; sn.material = mt;
      return { x: b.position.x + ox * (half + 2.4), z: b.position.z + oz * (half + 2.4) };
    }
    const TU = [["studio", "Studio apartment", "studio", 80, 8000], ["1bed", "1-bedroom apartment", "apt1", 140, 14000], ["2bed", "2-bedroom apartment", "house", 220, 24000], ["pent", "Penthouse", "mansion", 500, 80000]];
    ["Airport Heights", "Kotoka Residence", "Skyline Towers", "Runway View"].forEach((nm, n) => {
      const b = pick(n < 2 ? 0 : 1, 0, true); if (!b) return;
      const units = TU.map(t => (UNITS["T" + n + t[0]] = { id: "T" + n + t[0], name: nm + " \u00B7 " + t[1], tpl: t[2], rent: Math.round(t[3] * (1 + .1 * n)), buy: Math.round(t[4] * (1 + .1 * n)), dist: "Airport City" }));
      LISTS.push({ name: nm + " \u2014 Apartments", units, door: door(b, nm, "Apartments \u00B7 studio to penthouse", "#c9a54a") });
    });
    [["osu1", "Osu 1-bed apartment", "Osu", 0, 1, "apt1", 150, 14000], ["osu2", "Osu 2-bed flat", "Osu", 0, 2, "house", 230, 24000], ["mak1", "Makola single room", "Makola", 1, 1, "room", 35, 2500],
     ["mak2", "Makola chamber & hall", "Makola", 1, 2, "hall", 60, 5000], ["cen1", "Central Accra studio", "Central Accra", 2, 3, "studio", 90, 8000], ["lab1", "Labadi beach house", "Labadi", 1, 3, "house", 320, 38000],
     ["eln1", "East Legon 4-bed house", "East Legon", 2, 0, "house", 380, 52000], ["elm1", "East Legon mansion", "East Legon", 3, 0, "mansion", 650, 120000], ["amo1", "Amoamah family house", "Amoamah Estate", 3, 1, "house", 200, 26000], ["amo2", "Amoamah garden house", "Amoamah Estate", 3, 1, "house", 240, 32000], ["amo3", "Amoamah poolside house", "Amoamah Estate", 3, 1, "mansion", 300, 42000]].forEach(h => {
      const b = pick(h[3], h[4], false); if (!b) return;
      const u = UNITS[h[0]] = { id: h[0], name: h[1], tpl: h[5], rent: h[6], buy: h[7], dist: h[2] };
      LISTS.push({ name: h[1], units: [u], door: door(b, h[1], "Rent GH\u00A2" + h[6] + "/wk \u00B7 Buy GH\u00A2" + h[7].toLocaleString(), "#2a7ab8") });
    });
    // ---- ownership + marketplace: owners can list their homes for sale or rent; everyone sees the listings ----
    const ME = localStorage.getItem("accra-name") || "You";
    const mk = ls("accra-market", {});
    const saveMk = () => sv("accra-market", mk);
    const NET = () => (AV.net ? AV.net() : null);
    const bcast = () => { const n = NET(); if (n) n.emit("propMarket", mk); };
    { const n = NET(); if (n) { n.on("propMarket", d => { Object.keys(d || {}).forEach(id => { if (d[id] && d[id].owner !== ME) mk[id] = d[id]; }); saveMk(); }); n.on("adminGift", d => { earn(d.amount, "Gift from admin"); note("Admin sent you GH\u00A2" + d.amount); }); } }
    const priceOf = u => { const m = mk[u.id]; return { buy: m && m.mode === "sale" ? m.price : u.buy, rent: m && m.mode === "rent" ? m.price : u.rent }; };
    function unitRow(u, atDoor) {
      const k = st.keys[u.id], m = mk[u.id], p = priceOf(u), sale = m && m.mode === "sale", rl = m && m.mode === "rent";
      let status = "Available now", col = "#c9d1d9";
      if (k && k.t === "own") { status = "You own this" + (m ? " \u00B7 listed for " + (sale ? "sale" : "rent") + " GH\u00A2" + m.price.toLocaleString() : ""); col = "#69f0ae"; }
      else if (k) { status = "You rent this"; col = "#69f0ae"; }
      else if (m) { status = (m.owner === ME ? "Your listing" : "Listed by " + m.owner) + " \u00B7 " + (sale ? "FOR SALE" : "FOR RENT"); col = "#ffd24a"; }
      return '<div style="margin:6px 0;padding:7px;background:rgba(255,255,255,.1);border-radius:10px"><b>' + u.name + "</b><br><small>" + u.dist + " \u00B7 rent GH\u00A2" + p.rent + "/wk \u00B7 buy GH\u00A2" + p.buy.toLocaleString() + '</small><br><small style="color:' + col + '">' + status + "</small><br>" +
        (!k && !sale ? '<button data-r="' + u.id + '" style="' + SB + '">Rent</button>' : "") + (!(k && k.t === "own") && !rl ? '<button data-b="' + u.id + '" style="' + SB + '">Buy</button>' : "") +
        (k && atDoor ? '<button data-e="' + u.id + '" style="' + SB + '">Enter</button>' : "") + "</div>";
    }
    const propClick = (redraw, door) => d => {
      if (d.x) return hide();
      const id = d.r || d.b || d.e, u = UNITS[id]; if (!u) return;
      if (d.e) { hide(); return enter(u, door); }
      const p = priceOf(u), m = mk[id];
      if (d.r) { if (cash() < p.rent) return note("Not enough cash. First week costs GH\u00A2" + p.rent); pay(p.rent, "Rent: " + u.name); st.keys[id] = { t: "rent", due: st.play + WEEK }; note("Rented! Rent is charged every 10 minutes of play."); }
      else { if (cash() < p.buy) return note("Not enough cash. Price GH\u00A2" + p.buy.toLocaleString()); pay(p.buy, "Bought: " + u.name); st.keys[id] = { t: "own" }; if (m && m.mode === "sale") { delete mk[id]; saveMk(); bcast(); } note("Congratulations, you own " + u.name + "!"); }
      redraw();
    };
    function myHomes() {
      const draw = () => show(ttl("My homes") + (Object.keys(st.keys).filter(id => UNITS[id]).map(id => {
        const k = st.keys[id], u = UNITS[id], m = mk[id];
        return '<div style="margin:6px 0;padding:7px;background:rgba(255,255,255,.1);border-radius:10px"><b>' + u.name + "</b><br><small>" +
          (k.t === "own" ? (m ? "Owned \u00B7 listed for " + (m.mode === "sale" ? "sale" : "rent") + " GH\u00A2" + m.price.toLocaleString() : "Owned") : "Rent GH\u00A2" + u.rent + "/wk \u00B7 next payment in " + Math.max(0, Math.ceil((k.due - st.play) / 60)) + " min") + "</small><br>" +
          (k.t === "own" ? (m ? '<button data-lx="' + id + '" style="' + SB + '">Remove listing</button>' : '<button data-ls="' + id + '" style="' + SB + '">List for sale</button><button data-lr="' + id + '" style="' + SB + '">List for rent</button>') : '<button data-mo="' + id + '" style="' + SB + '">Move out</button>') + "</div>";
      }).join("") || '<div style="padding:6px 0">You do not rent or own any extra homes yet. Your villa is yours already.</div>') + CLOSE, d => {
        if (d.x) return hide();
        const id = d.ls || d.lr || d.lx || d.mo, u = UNITS[id]; if (!u) return;
        if (d.ls) { const v = Math.round(+prompt("Asking price in GH\u00A2", u.buy)); if (!(v > 0)) return; mk[id] = { owner: ME, mode: "sale", price: v }; }
        else if (d.lr) { const v = Math.round(+prompt("Weekly rent in GH\u00A2", u.rent)); if (!(v > 0)) return; mk[id] = { owner: ME, mode: "rent", price: v }; }
        else if (d.lx) delete mk[id];
        else if (d.mo) { delete st.keys[id]; if (inside === id) leave(); }
        saveMk(); bcast(); draw();
      });
      draw();
    }
    function listing(l, door) { const draw = () => show(ttl(l.name) + "<small>Cash: GH\u00A2" + cash() + "</small>" + l.units.map(u => unitRow(u, true)).join("") + CLOSE, propClick(draw, door)); draw(); }
    function allListings() { const draw = () => show(ttl("Property listings") + "<small>Rent or buy online, then go to the building's door to enter.</small>" + Object.values(UNITS).map(u => unitRow(u, false)).join("") + CLOSE, propClick(draw, null)); draw(); }
    LISTS.forEach(l => points.push({ x: l.door.x, z: l.door.z, r: 3.4, t: () => l.units.some(u => st.keys[u.id]) ? "\uD83D\uDD11 " + l.name : "\uD83C\uDFE0 View, rent or buy", ok: () => !busy && !seated, f: () => listing(l, l.door) }));

    // ---------- rent, vitals, saving ----------
    function rentCheck() {
      Object.keys(st.keys).forEach(id => {
        const k = st.keys[id], u = UNITS[id]; if (!u || k.t !== "rent" || st.play < k.due) return;
        if (cash() >= u.rent) { pay(u.rent, "Rent: " + u.name); k.due += WEEK; note("Rent paid: " + u.name + " GH\u00A2" + u.rent); }
        else { delete st.keys[id]; note("Evicted from " + u.name + " (rent unpaid)"); if (inside === id) leave(); }
      });
    }
    function passOut() {
      st.hp = 30; st.hu = Math.max(st.hu, 40); st.en = Math.max(st.en, 40);
      const fine = Math.min(50, Math.floor(cash() * .1)); if (fine) pay(fine, "Hospital bill");
      if (seated) stand(); AV.pose = null;
      const HP = window.ACCRA_PLACES && window.ACCRA_PLACES.hp;
      fade(800, () => { inside = null; if (HP) tp(HP.ox, HP.oz); else tp(VX, VZ + 12); }, () => note("You passed out and woke up " + (HP ? "at Accra Hospital" : "at home") + ". Bill GH\u00A2" + fine));
    }
    let lx = player.position.x, lz = player.position.z, acc = 0, saveT = 0, rentT = 0;
    scene.onBeforeRenderObservable.add(() => {
      const dt = Math.min(engine.getDeltaTime() / 1000, .1);
      const mv = Math.hypot(player.position.x - lx, player.position.z - lz) / Math.max(dt, .001); lx = player.position.x; lz = player.position.z;
      st.play += dt;
      st.hu = clamp(st.hu - dt * .035); st.hy = clamp(st.hy - dt * .012);
      st.en = clamp(st.en - dt * (.012 + (driving || mv > 40 ? 0 : mv * .0045)));
      if (seated) { st.en = clamp(st.en + dt * .6); st.md = clamp(st.md + dt * .15); }
      const bad = st.hu < 8 || st.en < 4;
      st.hp = clamp(st.hp + dt * (bad ? -.25 : (st.hu > 40 && st.en > 25 ? .04 : 0)));
      if (st.hu < 20 || st.hy < 20) st.md = clamp(st.md - dt * .05); else st.md = clamp(st.md + (60 - st.md) * dt * .002);
      if (st.hp <= 0 && !busy) passOut();
      acc += dt; if (acc > .5) { acc = 0; paintHud(); }
      saveT += dt; if (saveT > 5) { saveT = 0; sv("accra-life", st); }
      rentT += dt; if (rentT > 2) { rentT = 0; rentCheck(); }
    });
    // ---------- Hospital (HP) and Police Department (PD) ----------
    const PL = window.ACCRA_PLACES || {};
    let freeAt = 0;
    function hospital() {
      show(ttl("\uD83C\uDFE5 Accra Hospital") + "<small>Health " + Math.round(st.hp) + "% \u00B7 Cash GH\u00A2" + cash() + "</small>" +
        '<button data-h="30" style="' + BS + '">Check-up \u00B7 GH\u00A230 \u00B7 +40 health</button><button data-h="80" style="' + BS + '">Full treatment \u00B7 GH\u00A280 \u00B7 full health, +25 energy</button><button data-h="0" style="' + BS + '">Emergency care (free if you cannot pay)</button>' + CLOSE, d => {
        if (d.x) return hide();
        const f = +d.h;
        if (f === 0) { if (cash() >= 30) return note("Free care is only for people who cannot pay."); if (st.play < freeAt) return note("Please wait a few minutes before free care again."); freeAt = st.play + 180; st.hp = clamp(st.hp + 25); return note("A nurse treated you. +25 health"); }
        if (cash() < f) return note("Not enough cash.");
        pay(f, "Hospital"); if (f === 30) st.hp = clamp(st.hp + 40); else { st.hp = 100; st.en = clamp(st.en + 25); }
        note("Treated. Health " + Math.round(st.hp) + "%"); hospital();
      });
    }
    const TIPS = ["Keep your phone safe in busy markets like Makola.", "Always lock your door when you leave home.", "Do not drive when you are exhausted.", "Eat and rest: low health makes you pass out."];
    function police() {
      show(ttl("\uD83D\uDE93 Police Department") + '<button data-j="patrol" style="' + BS + '">Patrol shift \u00B7 +GH\u00A290 \u00B7 uses 25 energy</button><button data-j="comm" style="' + BS + '">Community service \u00B7 +GH\u00A245 \u00B7 uses 12 energy</button><button data-j="tip" style="' + BS + '">Safety tip</button>' + CLOSE, d => {
        if (d.x) return hide();
        if (d.j === "tip") return note(TIPS[Math.floor(Math.random() * TIPS.length)]);
        const patrol = d.j === "patrol", cost = patrol ? 25 : 12, gain = patrol ? 90 : 45;
        if (st.en < cost) return note("Too tired for this shift."); if (st.hu < 10) return note("Eat something first.");
        hide(); busy = true; note(patrol ? "On patrol\u2026" : "Community service\u2026");
        setTimeout(() => { earn(gain, patrol ? "Police patrol" : "Community service"); st.en = clamp(st.en - cost); st.hu = clamp(st.hu - 8); st.md = clamp(st.md + 3); busy = false; note("Shift done. +GH\u00A2" + gain); }, 4000);
      });
    }
    if (PL.hp) points.push({ x: PL.hp.x, z: PL.hp.z, r: 3.2, t: "\uD83C\uDFE5 Hospital desk", ok: () => !busy && !seated, f: hospital });
    if (PL.pd) points.push({ x: PL.pd.x, z: PL.pd.z, r: 3.2, t: "\uD83D\uDE93 Police desk", ok: () => !busy && !seated, f: police });

    // ---------- admin (tap the "ACCRA LIFE" label 5 times) ----------
    const ADMIN_CODE = "ACCRA-ADMIN-2026";   // change this. It only protects this device: online gifts must also be checked by the server.
    const TELE = { mall: [35, 12], stadium: [110, 12], hospital: [110, 80], police: [35, 80], villa: [VX, VZ + 12], airport: [-60, -66] };
    function adminPanel() {
      show(ttl("\uD83D\uDD27 Admin") + "<small>Play-money and test tools</small>" + [500, 5000, 50000, 500000].map(a => '<button data-m="' + a + '" style="' + BS + '">Give myself GH\u00A2' + a.toLocaleString() + "</button>").join("") +
        '<button data-p="1" style="' + BS + '">Give play money to an online player\u2026</button><button data-v="1" style="' + BS + '">Refill my health, energy, hunger</button>' +
        Object.keys(TELE).map(t => '<button data-t="' + t + '" style="' + BS + '">Go to: ' + t + "</button>").join("") + CLOSE, d => {
        if (d.x) return hide();
        if (d.m) { earn(+d.m, "Admin grant"); note("You received GH\u00A2" + (+d.m).toLocaleString()); }
        else if (d.v) { st.hp = st.en = st.hu = st.hy = st.md = 100; note("Refilled"); }
        else if (d.t) { hide(); tp(TELE[d.t][0], TELE[d.t][1]); }
        else if (d.p) { const to = prompt("Player name"), amount = Math.round(+prompt("Amount in GH\u00A2")), n = NET(); if (!to || !(amount > 0)) return; if (!n) return note("Not online: no server connection."); n.emit("adminGive", { to, amount, code: ADMIN_CODE }); note("Request sent. The server must support adminGive."); }
      });
    }
    { const pill = document.querySelector(".pill"); let taps = 0, tt = 0;
      if (pill) pill.addEventListener("click", () => { const t = Date.now(); taps = t - tt < 900 ? taps + 1 : 1; tt = t; if (taps >= 5) { taps = 0; if (prompt("Admin code") === ADMIN_CODE) adminPanel(); else note("Wrong code"); } }); }

    console.log("Accra life loaded:", LISTS.length, "property doors");
    note("Life systems on \u2014 watch your health, energy and hunger");
  } catch (err) { console.error("accra-life failed (game still runs):", err); try { K0 && K0.note("\u26A0 Life: " + err.message); } catch (e) {} }
})();
