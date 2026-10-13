// AccraLocations.js - fixed so it runs as a normal browser script (no import / export).
// Builds Independence Square with the Black Star Gate and the Labadi Beach swimming zone.
// The old Accra Mall, Accra Vibes Pub and Sports Stadium blocks are kept below but switched OFF,
// because the newer, enterable versions already live in accra-upgrade.js and must not be doubled.
(function () {
  class AccraLocations {
    constructor(scene, opts) {
      this.scene = scene; this.landmarks = []; this.waterZones = []; this.mats = {};
      this.opts = Object.assign({ oldMall: false, oldPub: false, oldStadium: false }, opts);
    }
    mat(hex, extra) {
      const k = hex + (extra ? "x" : "");
      if (!this.mats[k]) { const m = new BABYLON.StandardMaterial("loc" + k, this.scene); m.diffuseColor = BABYLON.Color3.FromHexString(hex); m.specularColor = new BABYLON.Color3(.05, .05, .05); if (extra) Object.assign(m, extra); this.mats[k] = m; }
      return this.mats[k];
    }
    box(w, h, d, x, y, z, hex, solid) {
      const m = BABYLON.MeshBuilder.CreateBox("loc", { width: w, height: h, depth: d }, this.scene);
      m.position.set(x, y, z); m.material = this.mat(hex); m.checkCollisions = !!solid;
      if (typeof sg !== "undefined" && h > .2) sg.addShadowCaster(m);
      return m;
    }
    sign(text, x, y, z, w, h, bg, fg) {
      const dt = new BABYLON.DynamicTexture("locsg", { width: 512, height: 128 }, this.scene, false), c = dt.getContext();
      c.fillStyle = bg; c.fillRect(0, 0, 512, 128); c.fillStyle = fg; c.font = "bold 46px system-ui"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(text, 256, 66, 490); dt.update();
      const p = BABYLON.MeshBuilder.CreatePlane("locsn", { width: w, height: h }, this.scene); p.position.set(x, y, z); p.isPickable = false;
      const mt = new BABYLON.StandardMaterial("locsm", this.scene); mt.diffuseTexture = dt; mt.emissiveTexture = dt; mt.disableLighting = true; mt.backFaceCulling = false; p.material = mt;
    }

    buildFullAccraMap() {
      if (this.opts.oldMall) this.buildAccraMall();
      if (this.opts.oldPub) this.buildSocialPubsAndNightlife();
      if (this.opts.oldStadium) this.buildAccraSportsStadium();
      this.buildLabadiBeachAndSwimming();
      this.buildIndependenceSquareComplex();
    }

    // ---- Labadi Beach: uses the sea already in the game (z 203 to 332) instead of a second ocean ----
    buildLabadiBeachAndSwimming() {
      this.waterZones.push({ minX: -278, maxX: 278, minZ: 203.5, maxZ: 332 });
      const wall = this.box(600, 6, 2, 0, 3, 335, "#000000", true); wall.isVisible = false;      // keeps swimmers inside the sea
      for (let i = 0; i < 28; i++) { const b = BABYLON.MeshBuilder.CreateSphere("buoy", { diameter: .9, segments: 4 }, this.scene); b.position.set(-270 + i * 20, .3, 330); b.material = this.mat(i % 2 ? "#ff7a1a" : "#ffffff"); b.isPickable = false; }
      [-120, -80, -40, 40, 80, 120].forEach((x, i) => {                                          // beach umbrellas and loungers
        this.box(.12, 3, .12, x, 1.5, 190, "#dddddd");
        const u = BABYLON.MeshBuilder.CreateCylinder("umb", { diameterTop: .2, diameterBottom: 4, height: 1, tessellation: 8 }, this.scene);
        u.position.set(x, 3.3, 190); u.material = this.mat(["#c8102e", "#fcd116", "#006b3f"][i % 3]); u.isPickable = false;
        this.box(.9, .25, 2, x + 1.6, .2, 191, "#f3e8c8");
      });
      this.box(2.6, .25, 2.6, 0, 3.2, 196, "#ffffff"); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(c => this.box(.2, 3.2, .2, c[0], 1.6, 196 + c[1], "#c8102e"));   // lifeguard tower
      this.box(.1, 1.4, .1, 0, 4.2, 196, "#cccccc"); this.box(1, .6, .05, .5, 4.6, 196, "#c8102e");
      window.ACCRA_WATER = { contains: p => this.checkSwimming(p) };
      this.landmarks.push({ name: "Labadi Beach Swimming Zone", pos: new BABYLON.Vector3(0, 0, 190) });
    }
    checkSwimming(p) {
      for (const z of this.waterZones) if (p.x > z.minX && p.x < z.maxX && p.z > z.minZ && p.z < z.maxZ) return true;
      return false;
    }

    // ---- Independence Square with the Black Star Gate, on the beach front south of the city ----
    buildIndependenceSquareComplex() {
      const Z = 186;
      this.box(64, .12, 30, 0, .08, Z, "#d3ccbb");                                               // paved square
      for (let i = 0; i < 3; i++) this.box(40 - i * 4, .5 + i * .5, 3, 0, .35 + i * .25, Z - 11 + i * 1.5, "#bdb5a2");   // ceremonial steps
      [-9, 9].forEach(x => this.box(4, 15, 4, x, 7.5, Z, "#2b2b2b", true));                    // gate pillars
      this.box(22, 4, 5, 0, 17, Z, "#2b2b2b", true);                                            // gate beam
      this.box(22.4, .5, 5.4, 0, 19.2, Z, "#c9a54a");
      this.sign("INDEPENDENCE SQUARE", 0, 17, Z - 2.6, 18, 2.6, "#111111", "#fcd116");
      const pos = [0, 0, 0], idx = [];                                                          // black star on top
      for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 1.1 : 2.8; pos.push(Math.cos(a) * r, Math.sin(a) * r, 0); }
      for (let i = 1; i <= 10; i++) idx.push(0, i, i === 10 ? 1 : i + 1);
      const nrm = []; BABYLON.VertexData.ComputeNormals(pos, idx, nrm);
      const star = new BABYLON.Mesh("blackstar", this.scene), vd = new BABYLON.VertexData(); vd.positions = pos; vd.indices = idx; vd.normals = nrm; vd.applyToMesh(star);
      star.material = this.mat("#0a0a0a", { backFaceCulling: false, twoSidedLighting: true }); star.position.set(0, 22.4, Z); star.isPickable = false;
      this.box(2.4, 1, 2.4, 0, .6, Z + 6, "#8a8a8a"); const fl = BABYLON.MeshBuilder.CreateCylinder("flame", { diameterTop: 0, diameterBottom: 1.2, height: 2, tessellation: 6 }, this.scene);
      fl.position.set(0, 2.1, Z + 6); fl.isPickable = false; fl.material = this.mat("#ff9a1a", { emissiveColor: new BABYLON.Color3(1, .55, .1), disableLighting: true }); // eternal flame
      for (let i = 0; i < 5; i++) { const x = -24 + i * 12; this.box(.2, 9, .2, x, 4.5, Z - 13, "#cccccc"); [["#c8102e", 8.4], ["#fcd116", 7.8], ["#006b3f", 7.2]].forEach(f => this.box(2.2, .6, .05, x + 1.2, f[1], Z - 13, f[0])); }   // Ghana flags
      this.landmarks.push({ name: "Independence Square", pos: new BABYLON.Vector3(0, 0, Z) });
    }

    // ---- OLD blocks, switched off by default (the new enterable mall, pub and stadium replace them) ----
    buildAccraMall() { const m = BABYLON.MeshBuilder.CreateBox("accraMallOld", { width: 140, height: 24, depth: 90 }, this.scene); m.position.set(-80, 12, 180); }
    buildSocialPubsAndNightlife() { const m = BABYLON.MeshBuilder.CreateBox("accraVibesPubOld", { width: 55, height: 18, depth: 40 }, this.scene); m.position.set(120, 9, -60); }
    buildAccraSportsStadium() { const s = BABYLON.MeshBuilder.CreateCylinder("accraStadiumOld", { diameter: 160, height: 28 }, this.scene); s.scaling.z = 220 / 160; s.position.set(180, 14, -200); }
  }
  window.AccraLocations = AccraLocations;
})();
