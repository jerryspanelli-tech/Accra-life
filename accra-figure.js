/* accra-figure.js - the figure for you, other players, police and bouncers.
 * Options: gender (male/female), skinTone (hex), shirtHex (hex), hairStyle (dreads/braids/afro/fade/bald),
 * hatStyle (none/cap/beanie/hood), police (true = Ghana Police uniform). Built from rounded shapes, no model file. */
(function () {
  try {
    const C3 = h => BABYLON.Color3.FromHexString(h);
    const mats = {};
    const M = h => mats[h] || (mats[h] = Object.assign(new BABYLON.StandardMaterial("ff" + h, scene), { diffuseColor: C3(h), specularColor: new BABYLON.Color3(.08, .08, .08) }));
    const DEF = { gender: "male", skinTone: "#6b4028", shirtHex: "#1f5c3a", hairStyle: "dreads", hatStyle: "none", police: false };
    const SHORTS = "#15171c", SNEAK = "#f4f4f2", SOCK = "#c8102e", STRIPE = "#fcd116", DREAD = "#1a1410", EYE = "#0d0d0d";
    const NAVY = "#1b2a4a", BLACK = "#101216", HIVIS = "#e6e300", REFL = "#f2f2f2", GOLD = "#c9a54a";
    const autos = [];

    // accept both the new option names and the older ones used by the police code
    function norm(o) {
      o = o || {};
      return {
        gender: o.gender, skinTone: o.skinTone || (typeof o.skin === "string" ? o.skin : undefined),
        shirtHex: o.shirtHex || o.shirt, hairStyle: o.hairStyle, hatStyle: o.hatStyle,
        // officers are recognised by their police shirt colour too, so the uniform always shows
        police: !!o.police || (o.shirt === "#1d3b6b" || o.shirtHex === "#1d3b6b")
      };
    }

    function human(opt) {
      const cfg = norm(opt), o = {};
      Object.keys(DEF).forEach(k => { o[k] = cfg[k] !== undefined && cfg[k] !== "" ? cfg[k] : DEF[k]; });
      if (o.police) { o.shirtHex = NAVY; o.hatStyle = "cap"; o.hairStyle = "bald"; }
      const fem = o.gender === "female";
      const SH = fem ? .23 : .27;            // shoulder offset
      const HX = fem ? .15 : .12;            // hip offset
      const torsoHex = o.police ? NAVY : o.shirtHex;

      const root = new BABYLON.TransformNode("ffig", scene);
      const g = new BABYLON.TransformNode("fg", scene); g.parent = root;
      const P = (kind, oo, x, y, z, hex, par) => {
        const m = BABYLON.MeshBuilder["Create" + kind]("fp", oo, scene);
        m.parent = par || g; m.position.set(x, y, z); m.material = M(hex); m.isPickable = false; m.checkCollisions = false;
        return m;
      };
      const piv = (x, y) => { const t = new BABYLON.TransformNode("fpv", scene); t.parent = g; t.position.set(x, y, 0); return t; };

      // torso and hips: one connected shape, so there are no gaps
      P("Capsule", { height: fem ? .68 : .72, radius: fem ? .18 : .2, tessellation: 12 }, 0, 1.3, 0, torsoHex);
      P("Capsule", { height: .3, radius: fem ? .19 : .17, tessellation: 10 }, 0, .98, 0, o.police ? BLACK : SHORTS);
      // neck and head, the neck overlaps both the torso and the head
      P("Cylinder", { height: .16, diameter: .13, tessellation: 10 }, 0, 1.6, 0, o.skinTone);
      P("Sphere", { diameter: .27, segments: 12 }, 0, 1.74, .02, o.skinTone);
      [-1, 1].forEach(s => P("Box", { width: .04, height: .035, depth: .03 }, s * .06, 1.76, .15, EYE));

      // hair
      if (o.hairStyle === "dreads") { for (let i = -3; i <= 3; i++) P("Cylinder", { height: .5, diameter: .045, tessellation: 6 }, i * .045, 1.56, -.2, DREAD); }
      else if (o.hairStyle === "braids") { for (let i = -3; i <= 3; i++) P("Cylinder", { height: fem ? .62 : .46, diameter: .035, tessellation: 6 }, i * .06, 1.56, -.16, DREAD); }
      else if (o.hairStyle === "afro") { P("Sphere", { diameter: .42, segments: 10 }, 0, 1.84, -.03, DREAD); }
      else if (o.hairStyle === "fade") { P("Sphere", { diameter: .29, segments: 10 }, 0, 1.82, -.01, DREAD).scaling.set(1, .5, 1); }

      // hats and hoods
      if (o.hatStyle === "hood") { P("Sphere", { diameter: .36, segments: 10 }, 0, 1.82, -.1, o.shirtHex).scaling.set(1, .9, .9); }
      if (o.hatStyle === "beanie") { P("Sphere", { diameter: .3, segments: 10 }, 0, 1.86, 0, "#c9d13a").scaling.set(1, .6, 1); }
      if (o.hatStyle === "cap") {
        const capHex = o.police ? BLACK : "#3a3a44";
        P("Cylinder", { height: .09, diameterTop: .24, diameterBottom: .28, tessellation: 14 }, 0, 1.92, 0, capHex);
        P("Box", { width: .22, height: .02, depth: .13 }, 0, 1.87, .2, capHex);
        if (o.police) P("Box", { width: .07, height: .06, depth: .02 }, 0, 1.94, .135, GOLD);   // cap badge
      }

      // police uniform details: hi-vis vest, reflective band, badge, belt
      if (o.police) {
        P("Box", { width: .38, height: .42, depth: .3 }, 0, 1.3, .02, HIVIS);
        P("Box", { width: .39, height: .04, depth: .31 }, 0, 1.2, .02, REFL);
        P("Box", { width: .39, height: .04, depth: .31 }, 0, 1.44, .02, REFL);
        P("Box", { width: .06, height: .06, depth: .02 }, -.1, 1.38, .2, GOLD);   // chest badge
        P("Box", { width: .4, height: .05, depth: .28 }, 0, .97, 0, BLACK);       // belt
      }

      // arms: a shoulder joint at the top, so the arm is always attached
      const sleeve = o.police ? NAVY : o.shirtHex;
      const arms = [-1, 1].map(s => {
        const a = piv(s * SH, 1.5);
        P("Sphere", { diameter: .18, segments: 10 }, 0, 0, 0, sleeve, a);             // shoulder joint
        P("Capsule", { height: .42, radius: .085, tessellation: 10 }, 0, -.22, 0, sleeve, a);
        P("Sphere", { diameter: .16, segments: 8 }, 0, -.44, 0, o.skinTone, a);       // elbow
        P("Capsule", { height: .34, radius: .07, tessellation: 10 }, 0, -.6, 0, o.skinTone, a);
        P("Sphere", { diameter: .12, segments: 8 }, 0, -.8, 0, o.skinTone, a);        // hand
        return a;
      });

      // legs: hip joint at the top; trousers for police, track shorts and sneakers for civilians
      const legs = [-1, 1].map(s => {
        const q = piv(s * HX, 1.0);
        P("Sphere", { diameter: .17, segments: 10 }, 0, 0, 0, o.police ? BLACK : SHORTS, q);   // hip joint
        if (o.police) {
          P("Cylinder", { height: .8, diameterTop: .26, diameterBottom: .21, tessellation: 12 }, 0, -.45, 0, BLACK, q);
          P("Box", { width: .2, height: .13, depth: .34 }, 0, -.93, .06, BLACK, q);            // boots
        } else {
          P("Cylinder", { height: .42, diameterTop: .3, diameterBottom: .26, tessellation: 12 }, 0, -.21, 0, SHORTS, q);
          P("Capsule", { height: .42, radius: .085, tessellation: 10 }, 0, -.6, 0, o.skinTone, q);
          P("Cylinder", { height: .1, diameter: .17, tessellation: 10 }, 0, -.86, 0, SOCK, q);
          P("Cylinder", { height: .02, diameter: .19, tessellation: 10 }, 0, -.84, 0, STRIPE, q);
          P("Box", { width: .2, height: .12, depth: .34 }, 0, -.94, .06, SNEAK, q);
        }
        return q;
      });

      return { root, g, al: arms[0], ar: arms[1], ll: legs[0], lr: legs[1], pk: [], ph: 0, sp: 0 };
    }

    // swing the arms and legs while walking
    function walk(h, sp, dt) {
      h.ph += dt * (2 + sp * 1.1);
      const k = Math.min(1, sp / 3), s = Math.sin(h.ph) * .85 * k;
      h.ll.rotation.x = s; h.lr.rotation.x = -s;
      h.al.rotation.x = -s; h.ar.rotation.x = s;
      h.g.position.y = Math.abs(Math.cos(h.ph)) * .05 * k;
    }

    // police and bouncers walk here
    scene.onBeforeRenderObservable.add(() => {
      const dt = Math.min(engine.getDeltaTime() / 1000, .05);
      autos.forEach(h => { if (!h.root.isDisposed()) walk(h, h.sp || 0, dt); });
    });

    window.AccraFigure = { human, walk };

    // replace the old box people used by the police and bouncers
    if (window.AccraAssets) {
      window.AccraAssets.createCharacter = (scn, o) => {
        const h = human(o);
        autos.push(h);
        return { root: h.root, setMoving: v => { h.sp = v ? 3 : 0; } };
      };
    }

    // rebuild the player's figure with the chosen look
    if (window.ACCRA_AVATAR && window.ACCRA_AVATAR.apply) window.ACCRA_AVATAR.apply();

    (window.ACCRA_MODULES = window.ACCRA_MODULES || {}).figure = 1;
    console.log("Accra figure ready");
  } catch (err) { console.error("accra-figure failed:", err); }
})();
