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
    let model = null, failed = false, phase = 0, amp = 0, lx = player.position.x, lz = player.position.z;
    let walkAnim = null, idleAnim = null;
    let skeleton = null;
    let boneMap = {};

    const hideFigure = () => {
      const keep = model ? model.meshes : [];
      player.getChildMeshes().forEach(m => { if (!keep.includes(m)) m.isVisible = !!failed; });
    };

    function mapSkeletonBones(sk) {
      if (!sk || !sk.bones) return;
      sk.bones.forEach(b => {
        const name = b.name.toLowerCase();
        if (name.includes("leftarm")) boneMap.leftArm = b;
        if (name.includes("rightarm")) boneMap.rightArm = b;
        if (name.includes("leftupleg")) boneMap.leftLeg = b;
        if (name.includes("rightupleg")) boneMap.rightLeg = b;
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
      
      // Rotate 180 degrees so character faces movement forward direction
      root.rotationQuaternion = null;   // clear the model's own rotation so the turn below takes effect
      root.rotation = new BABYLON.Vector3(0, Math.PI, 0);

      model = r;

      // Check for built-in GLB animation tracks
      if (r.animationGroups && r.animationGroups.length > 0) {
        r.animationGroups.forEach(g => {
          g.stop();
          const gName = g.name.toLowerCase();
          if (gName.includes("walk") || gName.includes("run")) walkAnim = g;
          if (gName.includes("idle")) idleAnim = g;
        });
      }

      if (r.skeletons && r.skeletons.length > 0) {
        skeleton = r.skeletons[0];
        mapSkeletonBones(skeleton);
      }

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

      // 1. Play built-in GLB animation clips if available
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

      // 2. Procedural bone animation driven via Babylon Skeleton API
      if (!skeleton) return;

      amp += ((moving ? 1 : 0) - amp) * Math.min(1, dt * 8);
      if (moving) phase += dt * (5 + Math.min(sp, 6));
      const s = Math.sin(phase);

      // Apply rotations directly through Babylon Bone Matrix calculations
      if (boneMap.leftArm) {
        const rot = BABYLON.Quaternion.RotationYawPitchRoll(0, 0, -1.35 + (s * 0.3 * amp));
        boneMap.leftArm.setRotationQuaternion(rot, BABYLON.Space.LOCAL);
      }
      if (boneMap.rightArm) {
        const rot = BABYLON.Quaternion.RotationYawPitchRoll(0, 0, 1.35 - (s * 0.3 * amp));
        boneMap.rightArm.setRotationQuaternion(rot, BABYLON.Space.LOCAL);
      }
      if (boneMap.leftLeg) {
        const rot = BABYLON.Quaternion.RotationYawPitchRoll(0, -s * 0.4 * amp, 0);
        boneMap.leftLeg.setRotationQuaternion(rot, BABYLON.Space.LOCAL);
      }
      if (boneMap.rightLeg) {
        const rot = BABYLON.Quaternion.RotationYawPitchRoll(0, s * 0.4 * amp, 0);
        boneMap.rightLeg.setRotationQuaternion(rot, BABYLON.Space.LOCAL);
      }
    });

    start().catch(e => { 
      failed = true; 
      hideFigure(); 
      say("Character model: " + (e && e.message ? e.message : e) + ". Using built-in figure."); 
    });

    (window.ACCRA_MODULES = window.ACCRA_MODULES || {}).model = 1;
  } catch (err) { console.error("accra-model failed:", err); }
})();
