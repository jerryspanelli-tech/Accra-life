/* accra-weather.js - automatic weather. It changes by itself every 3 to 7 minutes of play, blending over 40 seconds:
 * sunny, cloudy, rain, thunderstorm (with lightning), harmattan haze. No player controls.
 * It changes the sky, fog, sunlight, rain particles and how dark the road looks. */
(function () {
  try {
    const B = BABYLON;
    const SKY = { sunny: "#8fc7ec", cloudy: "#a9b4bd", rain: "#6f7d88", storm: "#4a5560", haze: "#c9b48a" };
    const FOG = { sunny: 260, cloudy: 220, rain: 160, storm: 120, haze: 150 };
    const LIGHT = { sunny: 1.0, cloudy: .7, rain: .5, storm: .35, haze: .75 };
    const LABEL = { sunny: "Sunny", cloudy: "Cloudy", rain: "Rain", storm: "Thunderstorm", haze: "Harmattan haze" };
    const ORDER = Object.keys(SKY);
    const W = { now: "sunny", next: "sunny", clock: 0, changeAt: 0, mix: 1 };
    const pick = () => { const o = ORDER.filter(w => w !== W.now); return o[Math.floor(Math.random() * o.length)]; };
    const plan = () => { W.changeAt = W.clock + 180 + Math.random() * 240; W.next = pick(); W.mix = 0; };
    plan();

    // rain particles that follow the player
    const rain = new B.ParticleSystem("rain", 1400, scene);
    rain.emitter = new B.Vector3(0, 30, 0);
    rain.minEmitBox = new B.Vector3(-45, 0, -45); rain.maxEmitBox = new B.Vector3(45, 0, 45);
    rain.color1 = new B.Color4(.75, .85, 1, .5); rain.color2 = new B.Color4(.7, .8, .95, .4);
    rain.minSize = .05; rain.maxSize = .12; rain.minLifeTime = .6; rain.maxLifeTime = .9;
    rain.emitRate = 0; rain.direction1 = new B.Vector3(-.6, -14, -.6); rain.direction2 = new B.Vector3(.6, -18, .6);
    rain.gravity = new B.Vector3(0, -2, 0); rain.minEmitPower = 1; rain.maxEmitPower = 2; rain.updateSpeed = .03;
    rain.start();

    // lightning light for storms
    const bolt = new B.HemisphericLight("bolt", new B.Vector3(0, 1, 0), scene);
    bolt.intensity = 0; bolt.diffuse = new B.Color3(.8, .85, 1);
    let flash = 0, nextFlash = 0;

    scene.onBeforeRenderObservable.add(() => {
      const dt = Math.min(engine.getDeltaTime() / 1000, .1);
      W.clock += dt;
      if (W.clock >= W.changeAt) { W.now = W.next; plan(); }
      W.mix = Math.min(1, W.mix + dt / 40);
      const a = W.now, b = W.next, m = W.mix;
      const sky = B.Color3.Lerp(B.Color3.FromHexString(SKY[a]), B.Color3.FromHexString(SKY[b]), m);
      scene.clearColor = new B.Color4(sky.r, sky.g, sky.b, 1);
      scene.fogColor = sky;
      scene.fogEnd = FOG[a] + (FOG[b] - FOG[a]) * m;
      const light = LIGHT[a] + (LIGHT[b] - LIGHT[a]) * m;
      if (typeof sun !== "undefined") sun.intensity = 1.3 * light;
      if (typeof hemi !== "undefined") hemi.intensity = .75 * (.6 + .4 * light);
      const wet = Math.max((b === "rain" || b === "storm" ? m : 0), (a === "rain" || a === "storm" ? 1 - m : 0));
      const rate = b === "storm" || a === "storm" ? 1300 : (b === "rain" || a === "rain" ? 900 : 0);
      rain.emitRate = rate * wet;
      rain.emitter.x = player.position.x; rain.emitter.z = player.position.z;
      if ((a === "storm" || b === "storm") && W.clock > nextFlash) { nextFlash = W.clock + 12 + Math.random() * 20; flash = .35; }
      if (flash > 0) { flash -= dt; bolt.intensity = flash > .25 ? .9 : .3; } else bolt.intensity = 0;
      if (typeof roadM !== "undefined" && roadM.diffuseColor) roadM.diffuseColor = B.Color3.Lerp(new B.Color3(1, 1, 1), new B.Color3(.7, .72, .76), wet);
    });

    // the admin panel can pin the weather; "automatic" hands control back
    window.ACCRA_WEATHER = {
      label: () => LABEL[W.now] || W.now,
      set(name) { if (!LABEL[name]) return; W.now = name; W.next = name; W.mix = 1; W.changeAt = W.clock + 1e9; },
      auto() { W.changeAt = W.clock + 1; }
    };
    (window.ACCRA_MODULES = window.ACCRA_MODULES || {}).weather = 1;
  } catch (err) { console.error("accra-weather failed:", err); }
})();
