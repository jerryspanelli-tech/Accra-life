/* accra-model.js - uses a real humanoid model (X_Bot.glb, placed in the same repo folder as babylon.html) for the player.
 * If the file is missing, the game keeps its built-in figure. The model plays its walk animation while you move.
 * The model is scaled to 1.8 m and stands on the ground. Outfit colours from the wardrobe do not apply to this model. */
(function () {
  try {
    const AV = window.ACCRA_AVATAR;
    if (!AV) { console.log("accra-model: avatar not ready"); return; }
    const loadScript = src => new Promise((res, rej) => { const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
    let model = null, group = null, lx = player.position.x, lz = player.position.z, moving = false;
    const hideFigure = () => {
      if (!model) return;
      player.getChildMeshes().forEach(m => { if (!model.meshes.includes(m)) m.isVisible = false; });
    };
    async function start() {
      await loadScript("https://cdn.babylonjs.com/loaders/babylon.glTF2FileLoader.min.js");
      // accept the file under either name: X_Bot.glb or X Bot.glb (GitHub and phones sometimes change the underscore)
      let r = null;
      for (const name of ["X_Bot.glb", "X Bot.glb", "X%20Bot.glb"]) {
        try { r = await BABYLON.SceneLoader.ImportMeshAsync("", "./", name, scene); if (r && r.meshes.length) break; } catch (e) { r = null; }
      }
      if (!r || !r.meshes.length) throw new Error("X_Bot.glb not found");
      if (!r || !r.meshes.length) throw new Error("empty model");
      const root = r.meshes[0];
      const bb = root.getHierarchyBoundingVectors(true);
      const h = bb.max.y - bb.min.y, s = 1.8 / Math.max(h, .001);
      root.parent = player;
      root.scaling.setAll(s);
      root.position.set(0, -.91 - bb.min.y * s, 0);
      model = r;
      group = r.animationGroups && r.animationGroups.length ? r.animationGroups[0] : null;
      if (group) group.stop();
      console.log("Accra model ready:", r.meshes.length, "parts");
      if (window.ACCRA_LIFE) window.ACCRA_LIFE.api.note("Character model loaded (X Bot)");
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
    start().catch(() => { console.log("accra-model: X_Bot.glb not found, using the built-in figure"); if (window.ACCRA_LIFE) window.ACCRA_LIFE.api.note("X_Bot.glb not found in the repo. Upload it next to babylon.html."); });
    (window.ACCRA_MODULES = window.ACCRA_MODULES || {}).model = 1;
  } catch (err) { console.error("accra-model failed:", err); }
})();
