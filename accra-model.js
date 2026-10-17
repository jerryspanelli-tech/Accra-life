/* accra-model.js - the player uses the humanoid model X_Bot.glb (or "X Bot.glb") from the same repo folder as babylon.html.
 * The model's walk clip is stopped and its arms and legs are moved in code: arms hang down at rest, and legs and arms
 * swing while you walk. If the model can't load, the built-in figure stays and the real reason is shown on screen. */
(function () {
  try {
    const AV = window.ACCRA_AVATAR;
    if (!AV) { console.log("accra-model: avatar not ready"); return; }
    const say = m => { console.log(m); if (window.ACCRA_LIFE && window.ACCRA_LIFE.api) window.ACCRA_LIFE.api.note(m); };
    const loadScript = src => new Promise((res, rej) => {
      if (BABYLON.SceneLoader && BABYLON.SceneLoader.IsPluginForExtensionAvailable && BABYLON.SceneLoader.IsPluginForExtensionAvailable(".glb")) return res();
      const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = () => rej(new Error("glTF loader script blocked")); document.head.appendChild(s);
    });
    const folder = new URL("./", window.location.href).href;
    const ARM_DOWN = 1.2;           // how far the arms hang down from the T-pose (radians)
    const LEG_SWING = .5, ARM_SWING = .45;

    let model = null, failed = false, limbs = [], phase = 0, amp = 0, lx = player.position.x, lz = player.position.z;

    // the old blocky figure stays hidden from the first frame, and only comes back if the model fails to load
    const hideFigure = () => {
      const keep = model ? model.meshes : [];
      player.getChildMeshes().forEach(m => { if (!keep.includes(m)) m.isVisible = !!failed; });
    };

    // find the arm and leg bones and take over their rotation
    function findLimbs() {
      const re = /(LeftArm|RightArm|LeftUpLeg|RightUpLeg)$/;
      const nodes = scene.transformNodes.filter(n => re.test(n.name || ""));
      return nodes.map(n => {
        const side = /Left/.test(n.name) ? 1 : -1;
        const isArm = /Arm$/.test(n.name);
        const q = n.rotationQuaternion;
        const rest = (q ? q.toEulerAngles() : n.rotation).clone();
        n.rotationQuaternion = null;
        n.rotation = rest.clone();
        // which way the arm points, so the arm can be lowered toward the ground
        const child = n.getChildren().find(c => c.position && c.position.length() > 0);
        const dirX = child && Math.abs(child.position.x) > .01 ? Math.sign(child.position.x) : side;
        return { node: n, rest, side, isArm, dirX };
      });
    }

    async function start() {
      await loadScript("https://cdn.babylonjs.com/loaders/babylon.glTF2FileLoader.min.js");
      let r = null, lastErr = "";
      for (const name of ["X_Bot.glb", "X Bot.glb"]) {
        try {
          const got = await BABYLON.SceneLoader.ImportMeshAsync("", folder, name, scene);
          if (got && got.meshes && got.meshes.length) { r = got; break; }
          lastErr = name + ": no meshes";
        } catch (e) { lastErr = name + ": " + (e && e.message ? e.message : e); }
      }
      if (!r) throw new Error("model not loaded (" + lastErr + ")");

      const root = r.meshes[0];
      const bb = root.getHierarchyBoundingVectors(true);
      const h = bb.max.y - bb.min.y, s = 1.8 / Math.max(h, .001);
      root.parent = player;
      root.scaling.setAll(s);
      root.position.set(0, -.91 - bb.min.y * s, 0);
      model = r;

      // stop the built-in clip so it can't fight the code-driven limbs
      if (r.animationGroups) r.animationGroups.forEach(g => g.stop());
      limbs = findLimbs();
      say("Character model loaded: " + (r.skeletons && r.skeletons.length ? r.skeletons[0].bones.length : 0) + " bones, " + limbs.length + " limb bones moved in code");
    }

    scene.onBeforeRenderObservable.add(() => {
      const dt = Math.min(Math.max(engine.getDeltaTime() / 1000, .001), .1);
      const sp = Math.hypot(player.position.x - lx, player.position.z - lz) / dt;
      lx = player.position.x; lz = player.position.z;
      hideFigure();
      if (!model || !limbs.length) return;
      const posed = !!(window.ACCRA_AVATAR && window.ACCRA_AVATAR.pose);
      const moving = sp > .6 && !posed;
      // blend the walk on and off smoothly
      amp += ((moving ? 1 : 0) - amp) * Math.min(1, dt * 8);
      if (moving) phase += dt * (5 + Math.min(sp, 6)) ;
      const s = Math.sin(phase);
      limbs.forEach(L => {
        const n = L.node;
        if (posed) return;                                   // sitting or sleeping: leave the pose alone
        if (L.isArm) {
          const down = -L.dirX * ARM_DOWN;                  // hang the arm down
          n.rotation.z = L.rest.z + (down - L.rest.z) * 1;
          n.rotation.x = L.rest.x + (-s * ARM_SWING * L.side) * amp;
        } else {
          n.rotation.x = L.rest.x + (s * LEG_SWING * L.side) * amp;
        }
      });
    });

    start().catch(e => { failed = true; hideFigure(); say("Character model: " + (e && e.message ? e.message : e) + ". Using the built-in figure."); });
    (window.ACCRA_MODULES = window.ACCRA_MODULES || {}).model = 1;
  } catch (err) { console.error("accra-model failed:", err); }
})();
