/* accra-airport.js - Kotoka International Airport, laid out like the reference: runway with thresholds, taxiway,
 * apron with aircraft and jet bridges, glass terminal, control tower, helipads, fuel tanks, cargo sheds,
 * car parks, a drop-off road, an access road to the city, billboards and palms.
 * Uses the game's own helpers: box(), mat(), palm(), and the shadow generator sg. Loaded before phone.js,
 * so the airport appears on the phone map. */
(function () {
  try {
    const B = BABYLON;
    const C = { x: -420, z: -300 };                       // airport centre, west of the city
    const X = x => C.x + x, Z = z => C.z + z;

    function flat(hex) { return mat(hex); }
    function text(t, x, y, z, w, h, bg, fg, flatOnGround) {
      const dt = new B.DynamicTexture("apt_t" + t.length, { width: 512, height: 128 }, scene, false), c = dt.getContext();
      c.fillStyle = bg; c.fillRect(0, 0, 512, 128);
      c.fillStyle = fg; c.font = "bold 64px system-ui"; c.textAlign = "center"; c.textBaseline = "middle";
      c.fillText(t, 256, 66, 490); dt.update();
      const p = B.MeshBuilder.CreatePlane("apt_txt", { width: w, height: h }, scene);
      p.position.set(x, y, z); p.isPickable = false;
      if (flatOnGround) p.rotation.x = Math.PI / 2;
      const m = new B.StandardMaterial("apt_tm" + t, scene);
      m.diffuseTexture = dt; m.emissiveTexture = dt; m.disableLighting = true; m.backFaceCulling = false;
      p.material = m;
      return p;
    }
    function aircraft(x, z) {                              // a parked passenger jet, nose towards the terminal
      const fus = B.MeshBuilder.CreateCylinder("apt_fus", { diameter: 3.4, height: 26, tessellation: 10 }, scene);
      fus.rotation.z = Math.PI / 2; fus.position.set(X(x), 2.4, Z(z)); fus.material = flat("#f4f4f2");
      fus.checkCollisions = true; if (sg.addShadowCaster) sg.addShadowCaster(fus);
      const fin = box(.4, 4.2, 3.4, X(x - 11), 4.4, Z(z), "#1d3b6b", true);
      box(5.4, .25, 26, X(x + 1), 1.9, Z(z), "#e4e7ea", true);                            // wings
      box(1.8, .25, 6, X(x - 10), 2.1, Z(z), "#e4e7ea", false);
    }

    // ----- runway (north), numbers, threshold stripes, edge lights -----
    box(260, .1, 30, X(0), .06, Z(-70), "#2b2d31", false);
    for (let i = -120; i <= 120; i += 16) box(6, .12, .6, X(i), .08, Z(-70), "#f2f2f2", false);        // centre line
    for (let i = -124; i <= -112; i += 3) box(.5, .12, 22, X(i), .08, Z(-70), "#f2f2f2", false);       // threshold 09
    for (let i = 112; i <= 124; i += 3) box(.5, .12, 22, X(i), .08, Z(-70), "#f2f2f2", false);        // threshold 27
    text("09", X(-112), .09, Z(-70), 12, 6, "#2b2d31", "#ffffff", true);
    text("27", X(112), .09, Z(-70), 12, 6, "#2b2d31", "#ffffff", true);
    for (let i = -125; i <= 125; i += 18) { box(.5, .2, .5, X(i), .2, Z(-85.5), "#ffe27a", false); box(.5, .2, .5, X(i), .2, Z(-54.5), "#ffe27a", false); }

    // ----- taxiway (yellow edges) and apron -----
    box(260, .1, 14, X(0), .05, Z(-50), "#3a3c42", false);
    box(260, .12, .4, X(0), .07, Z(-57.2), "#e6c700", false);
    box(260, .12, .4, X(0), .07, Z(-42.8), "#e6c700", false);
    box(300, .1, 50, X(0), .05, Z(-18), "#c9ced4", false);

    // ----- parked aircraft and jet bridges -----
    [-96, -60, -24, 12, 48, 84].forEach(x => { aircraft(x, -18); box(3, 3.2, 12, X(x), 1.6, Z(4), "#b8bec6", false); });

    // ----- terminal: long glass front, roof, sign, departures board -----
    box(230, 11, 22, X(0), 5.5, Z(27), "#e9ecef", true);
    box(226, 6.4, .4, X(0), 3.6, Z(16.2), "#2e5a7a", false);                                       // glass
    box(236, .8, 26, X(0), 11.4, Z(27), "#9aa5ad", false);                                        // roof
    text("KOTOKA INTERNATIONAL AIRPORT", X(0), 13.5, Z(16.4), 48, 6, "#17191c", "#fcd116", false);   // sign
    box(30, 2.4, .3, X(-70), 8, Z(16.1), "#101216", false);                                       // departures board
    box(30, 2.4, .3, X(70), 8, Z(16.1), "#101216", false);

    // ----- control tower -----
    const tw = B.MeshBuilder.CreateCylinder("apt_tower", { diameter: 4, height: 26, tessellation: 14 }, scene);
    tw.position.set(X(150), 13, Z(40)); tw.material = flat("#e9ecef"); tw.checkCollisions = true;
    const cab = B.MeshBuilder.CreateCylinder("apt_cab", { diameter: 9, height: 3.2, tessellation: 16 }, scene);
    cab.position.set(X(150), 27.5, Z(40)); cab.material = flat("#2e5a7a"); cab.checkCollisions = true;
    const ball = B.MeshBuilder.CreateSphere("apt_ball", { diameter: 1.4 }, scene);
    ball.position.set(X(150), 30.4, Z(40)); ball.material = flat("#ff3b3b");

    // ----- helipads -----
    [-172, -144].forEach(x => {
      const ring = B.MeshBuilder.CreateTorus("apt_hp", { diameter: 12, thickness: .6, tessellation: 24 }, scene);
      ring.position.set(X(x), .14, Z(20)); ring.scaling.y = .05; ring.material = flat("#fcd116"); ring.isPickable = false;
      box(.1, .1, 1, X(x), .12, Z(20), "#fcd116", false);
      box(.3, .1, 5, X(x), .12, Z(20), "#f2f2f2", false);
    });

    // ----- fuel tanks and cargo sheds (west, away from the terminal) -----
    [[-158, -4], [-158, -18], [-158, -32]].forEach(p => {
      const t = B.MeshBuilder.CreateCylinder("apt_tank", { diameter: 7, height: 6, tessellation: 18 }, scene);
      t.position.set(X(p[0]), 3, Z(p[1])); t.material = flat("#dfe3e8"); t.checkCollisions = true;
    });
    box(30, 8, 20, X(150), 4, Z(-22), "#cfd6dc", true);                                          // cargo shed

    // ----- car park, drop-off road, billboards, palms -----
    box(120, .1, 24, X(-60), .05, Z(70), "#3a3d44", false);
    box(120, .1, 24, X(60), .05, Z(70), "#3a3d44", false);
    for (let i = -56; i <= 56; i += 8) { box(.2, .12, 10, X(-60 + i), .08, Z(70), "#f2f2f2", false); box(.2, .12, 10, X(60 + i), .08, Z(70), "#f2f2f2", false); }
    box(240, .1, 12, X(0), .05, Z(58), "#2b2d31", false);                                           // drop-off road
    box(240, .2, .6, X(0), .15, Z(64), "#9aa5ad", false);                                          // kerb
    const boards = [["WELCOME TO GHANA", "#7a2d4a", -90], ["FLY SAFE", "#d9822b", -30], ["ACCRA", "#2456a6", 30], ["KOTOKA", "#2e7d32", 90]];
    boards.forEach(b => {
      box(.4, 6, .4, X(b[2]), 3, Z(83), "#555a63", false);
      text(b[0], X(b[2]), 5.8, Z(83.3), 12, 4, b[1], "#ffffff", false);
    });
    [-130, -100, 100, 130].forEach(x => palm(X(x), Z(88)));

    // ----- access road from the city avenue (z -150) to the drop-off road -----
    box(135, .06, 8, (X(-120) + -165) / 2, .04, -150, "#2b2d31", false);     // avenue west from the city edge
    box(8, .06, 92, X(-120), .04, -196, "#2b2d31", false);                    // south to the drop-off road

    // ----- where the airport is, for the phone map and the game -----
    window.ACCRA_AIRPORT = { name: "Kotoka International Airport", x: C.x + 0, z: C.z + 58 };
    (window.ACCRA_LANDMARKS = window.ACCRA_LANDMARKS || []).push({ n: "Kotoka International Airport", x: C.x, z: C.z + 58 });
    (window.ACCRA_MODULES = window.ACCRA_MODULES || {}).airport = 1;
    console.log("Kotoka airport ready");
  } catch (err) { console.error("accra-airport failed:", err); }
})();
