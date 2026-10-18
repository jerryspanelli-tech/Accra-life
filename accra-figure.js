/* accra-figure.js - the new figure: hooded top, track shorts, sneakers and dreadlocks.
 * Used for you, other players, police and bouncers. Built from rounded shapes, so no model file is needed. */
(function () {
  try {
    const C3 = h => BABYLON.Color3.FromHexString(h);
    const mats = {};
    const M = h => mats[h] || (mats[h] = Object.assign(new BABYLON.StandardMaterial("ff" + h, scene), { diffuseColor: C3(h), specularColor: new BABYLON.Color3(.08, .08, .08) }));
    const SKIN = "#6b4028", HOOD = "#1f5c3a", SHORTS = "#15171c", SNEAK = "#f4f4f2", SOCK = "#c8102e", STRIPE = "#fcd116", DREAD = "#1a1410", EYE = "#0d0d0d";
    const autos = [];

    function human() {
      const root = new BABYLON.TransformNode("ffig", scene);
      const g = new BABYLON.TransformNode("fg", scene); g.parent = root;
      const P = (kind, o, x, y, z, hex, par) => {
        const m = BABYLON.MeshBuilder["Create" + kind]("fp", o, scene);
        m.parent = par || g; m.position.set(x, y, z); m.material = M(hex); m.isPickable = false; m.checkCollisions = false;
        return m;
      };
      const piv = (x, y) => { const t = new BABYLON.TransformNode("fpv", scene); t.parent = g; t.position.set(x, y, 0); return t; };

      // hooded top and neck
      P("Capsule", { height: .72, radius: .2, tessellation: 10 }, 0, 1.3, 0, HOOD);
      P("Cylinder", { height: .12, diameter: .14, tessellation: 8 }, 0, 1.58, 0, SKIN);
      // head, hood at the back, eyes
      P("Sphere", { diameter: .28, segments: 8 }, 0, 1.72, .02, SKIN);
      P("Sphere", { diameter: .36, segments: 8 }, 0, 1.8, -.1, HOOD).scaling.set(1, .9, .9);
      [-1, 1].forEach(s => P("Box", { width: .04, height: .04, depth: .03 }, s * .06, 1.74, .15, EYE));
      // dreadlocks hanging down behind the hood
      for (let i = -3; i <= 3; i++) P("Cylinder", { height: .5, diameter: .045, tessellation: 6 }, i * .045, 1.55, -.3, DREAD);
      for (let i = -3; i <= 3; i++) P("Cylinder", { height: .44, diameter: .045, tessellation: 6 }, i * .045, 1.6, -.34, DREAD);

      // arms hang down at rest, with hood-top sleeves and dark-skin forearms
      const arms = [-1, 1].map(s => {
        const a = piv(s * .27, 1.5);
        P("Capsule", { height: .42, radius: .09, tessellation: 8 }, 0, -.2, 0, HOOD, a);
        P("Capsule", { height: .36, radius: .075, tessellation: 8 }, 0, -.57, 0, SKIN, a);
        P("Sphere", { diameter: .12, segments: 6 }, 0, -.8, 0, SKIN, a);
        return a;
      });

      // legs: track shorts, skin, red socks with a yellow stripe, white sneakers
      const legs = [-1, 1].map(s => {
        const q = piv(s * .12, 1.0);
        P("Cylinder", { height: .42, diameterTop: .3, diameterBottom: .26, tessellation: 10 }, 0, -.21, 0, SHORTS, q);
        P("Capsule", { height: .42, radius: .085, tessellation: 8 }, 0, -.6, 0, SKIN, q);
        P("Cylinder", { height: .1, diameter: .17, tessellation: 8 }, 0, -.86, 0, SOCK, q);
        P("Cylinder", { height: .02, diameter: .19, tessellation: 8 }, 0, -.84, 0, STRIPE, q);
        P("Box", { width: .2, height: .12, depth: .34 }, 0, -.94, .06, SNEAK, q);
        return q;
      });

      return { root, g, al: arms[0], ar: arms[1], ll: legs[0], lr: legs[1], pk: [], ph: 0, sp: 0 };
    }

    // swing the arms and legs while walking (same movement as before)
    function walk(h, sp, dt) {
      h.ph += dt * (2 + sp * 1.1);
      const k = Math.min(1, sp / 3), s = Math.sin(h.ph) * .85 * k;
      h.ll.rotation.x = s; h.lr.rotation.x = -s;
      h.al.rotation.x = -s; h.ar.rotation.x = s;
      h.g.position.y = Math.abs(Math.cos(h.ph)) * .05 * k;
    }

    // police and bouncers: their walk is driven here
    scene.onBeforeRenderObservable.add(() => {
      const dt = Math.min(engine.getDeltaTime() / 1000, .05);
      autos.forEach(h => { if (!h.root.isDisposed()) walk(h, h.sp || 0, dt); });
    });

    window.AccraFigure = { human, walk };

    // replace the old box people used by the police and bouncers
    if (window.AccraAssets) {
      window.AccraAssets.createCharacter = (scn, o) => {
        const h = human();
        autos.push(h);
        return { root: h.root, setMoving: v => { h.sp = v ? 3 : 0; } };
      };
    }

    // give the player the new figure straight away (the player's figure is rebuilt by apply())
    if (window.ACCRA_AVATAR && window.ACCRA_AVATAR.apply) window.ACCRA_AVATAR.apply();

    (window.ACCRA_MODULES = window.ACCRA_MODULES || {}).figure = 1;
    console.log("Accra figure ready");
  } catch (err) { console.error("accra-figure failed:", err); }
})();
