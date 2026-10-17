/* accra-carskin.js - gives the car you drive a new body. The old car parts are hidden (the physics box stays),
 * and a sedan body from AccraAssets is attached to the car, facing forward (+Z), sitting on the road. */
(function () {
  try {
    if (typeof car === "undefined" || !window.AccraAssets || !window.AccraAssets.createCar) { console.log("accra-carskin: waiting"); return; }
    car.getChildMeshes().forEach(m => { m.isVisible = false; });
    const skin = window.AccraAssets.createCar(scene, "sedan", { color: "#a3172b" });
    skin.parent = car;
    skin.rotation.y = -Math.PI / 2;     // car model faces +X, the driving car faces +Z
    skin.position.set(0, -.4, 0);
    window.ACCRA_CARSKIN = skin;
    (window.ACCRA_MODULES = window.ACCRA_MODULES || {}).carskin = 1;
    console.log("Accra car skin ready");
  } catch (err) { console.error("accra-carskin failed:", err); }
})();
