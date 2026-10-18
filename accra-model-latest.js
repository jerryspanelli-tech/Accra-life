/* accra-model.js - Player humanoid model loader and animation handler */
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
    let model = null, failed = false, limbs = [], phase = 0, amp = 0, lx = player.position.x, lz = player.position.z;
    let walkAnim = null, idleAnim = null;

    const hideFigure = () => {
      const keep = model ? model.meshes : [];
      player.getChildMeshes().forEach(m => { if (!keep.includes(m)) m.isVisible = !!failed; });
    };

    function findLimbs() {
      const re = /(LeftArm|RightArm|LeftUpLeg|RightUpLeg)/i;
      const seen = new Set(), nodes = [];
      const add = n => { if (n && n.name && re.test(n.name) && !seen.has(n)) { seen.add(n); nodes.push(n); } };

      scene.transformNodes.forEach(add);
      if (model && model.skeletons) {
        model.skeletons.forEach(sk => sk.bones.forEach(b => {
          if (b.getTransformNode && b.getTransformNode()) add(b.getTransformNode());
        }));
      }

      return nodes.map(n => {
        const name = n.name.toLowerCase();
        const side = name.includes("left") ? 1 : -1;
        const isArm = name.includes("arm");

        // Force quaternion off so Euler rotations stick cleanly
        n.rotationQuaternion = null;
        
        return { node: n, side, isArm };
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
      
      // Fix backward movement by turning the model around 180 degrees (Math.PI)
      root.rotation = new BABYLON.Vector3(0, Math.PI, 0);

      model = r;

      // Check for built-in animation clips inside the GLB
      if (r.animationGroups && r.animationGroups.length > 0) {
        r.animationGroups.forEach(g => {
          g.stop();
          const gName = g.name.toLowerCase();
          if (gName.includes("walk") || gName.includes("run")) walkAnim = g;
          if (gName.includes("idle")) idleAnim = g;
        });
      }

      limbs = findLimbs();
      hideFigure();
      say("Character model loaded successfully.");
    }

    scene.onBeforeRenderObservable.add(() => {
      const dt = Math.min(Math.max(engine.getDeltaTime() / 1000, .001), .1);
      const sp = Math.hypot(player.position.x - lx, player.position.z - lz) / dt;
      lx = player.position.x; lz = player.position.z;
      
      hideFigure();
      if (!model) return;

      const moving = sp > .6;

      // 1. Play built-in GLB animation clips if present
      if (walkAnim || idleAnim) {
        if (moving) {
          if (idleAnim) idleAnim.stop();
          if (walkAnim && !walkAnim.isPlaying) walkAnim.play(true);
        } else {
          if (walkAnim) walkAnim.stop();
          if (idleAnim && !idleAnim.isPlaying) idleAnim.play(true);
        }
        return;
      }

      // 2. Procedural limb animation fallback
      if (!limbs.length) return;

      amp += ((moving ? 1 : 0) - amp) * Math.min(1, dt * 8);
      if (moving) phase += dt * (5 + Math.min(sp, 6));
      const s = Math.sin(phase);

      limbs.forEach(L => {
        const n = L.node;
        if (L.isArm) {
          // Drop arms straight down to sides and swing backward/forward naturally
          n.rotation.z = L.side * 1.35; 
          n.rotation.y = 0;
          n.rotation.x = (s * 0.35 * L.side) * amp;
        } else {
          // Swing legs back and forth cleanly along pitch axis
          n.rotation.z = 0;
          n.rotation.y = 0;
          n.rotation.x = (-s * 0.45 * L.side) * amp;
        }
      });
    });

    start().catch(e => { 
      failed = true; 
      hideFigure(); 
      say("Character model: " + (e && e.message ? e.message : e) + ". Using built-in figure."); 
    });

    (window.ACCRA_MODULES = window.ACCRA_MODULES || {}).model = 1;
  } catch (err) { console.error("accra-model failed:", err); }
})();
