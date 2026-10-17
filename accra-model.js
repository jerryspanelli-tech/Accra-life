/* accra-model.js - the player uses the real humanoid model X_Bot.glb (or "X Bot.glb") from the same repo folder as babylon.html.
 * If it can't be loaded, the game keeps its built-in figure and shows the real reason on screen.
 * The model is scaled to 1.8 m, stands on the ground and plays its walk animation while you move. */
(function () {
  try {
    const AV = window.ACCRA_AVATAR;
    if (!AV) { console.log("accra-model: avatar not ready"); return; }
    const say = m => { console.log(m); if (window.ACCRA_LIFE && window.ACCRA_LIFE.api) window.ACCRA_LIFE.api.note(m); };
    const loadScript = src => new Promise((res, rej) => {
      if (BABYLON.SceneLoader && BABYLON.SceneLoader.IsPluginForExtensionAvailable && BABYLON.SceneLoader.IsPluginForExtensionAvailable(".glb")) return res();
      const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = () => rej(new Error("glTF loader script blocked")); document.head.appendChild(s);
    });
    let model = null, group = null, lx = player.position.x, lz = player.position.z, moving = false;
    const hideFigure = () => {
      if (!model) return;
      player.getChildMeshes().forEach(m => { if (!model.meshes.includes(m)) m.isVisible = false; });
    };
    // the folder that babylon.html is in, so the model is found wherever the game is hosted
    const folder = new URL("./", window.location.href).href;

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
      group = r.animationGroups && r.animationGroups.length ? r.animationGroups[0] : null;
      if (group) group.stop();
      say("Character model loaded (X Bot)");
    }

    scene.onBeforeRenderObservable.add(() => {
      if (!model) return;
      const dt = Math.max(engine.getDeltaTime() / 1000, .001);
      const sp = Math.hypot(player.position.x - lx, player.position.z - lz) / dt;
      lx = player.position.x; lz = player.position.z;
      hideFigure();
      const nowMoving = sp > .6 && !(window.ACCRA_AVATAR && window.ACCRA_AVATAR.pose);
      if (group && nowMoving !== moving) {
        moving = nowMoving;
        if (moving) group.start(true, 1.0); else group.stop();
      }
    });

    start().catch(e => say("Character model: " + (e && e.message ? e.message : e) + ". Using the built-in figure."));
    (window.ACCRA_MODULES = window.ACCRA_MODULES || {}).model = 1;
  } catch (err) { console.error("accra-model failed:", err); }
})();
