// main-integration.js - paste into your main game file (where `scene`, `engine`
// and `characterEngine` already exist). Delete your old swimming/registerBeforeRender block.
import * as BABYLON from '@babylonjs/core';
import { AccraLocations } from './AccraLocations.js';
import { InteriorFurnishing } from './InteriorFurnishing.js';
import { RoomLights, DayNightCycle, SwimPhysics } from './AccraSystems.js';

// --- World ---
const accraLocations = new AccraLocations(scene);
accraLocations.buildFullAccraMap();

const roomLights = new RoomLights(scene);
const furnishing = new InteriorFurnishing(scene, roomLights);
furnishing.spawnHouseInterior(new BABYLON.Vector3(-150, 0, 100));

// --- Day/night: lights come on automatically at night ---
const dayNight = new DayNightCycle(scene, {
    dayLengthSec: 240,
    startHour: 8,
    onNightChange: (night) => roomLights.setAll(night)
});

// --- Swimming ---
const swim = new SwimPhysics(accraLocations.waterZones);
const swimVel = new BABYLON.Vector3();

// --- Input (replace with your own movement input if you have one) ---
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    if (e.key.toLowerCase() === 'f') {
        furnishing.checkApplianceInteraction(characterEngine.playerMesh.position);
    }
});
window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

// --- Game loop ---
scene.onBeforeRenderObservable.add(() => {
    const dt = engine.getDeltaTime() / 1000;

    const moveX = (keys['d'] ? 1 : 0) - (keys['a'] ? 1 : 0);
    const moveZ = (keys['w'] ? 1 : 0) - (keys['s'] ? 1 : 0);

    const swimming = swim.update(characterEngine.playerMesh, swimVel, dt, {
        x: moveX, z: moveZ, dive: !!keys['shift']
    });

    if (swimming) {
        characterEngine.currentState = 'SWIMMING';
    } else if (characterEngine.currentState === 'SWIMMING') {
        characterEngine.currentState = 'IDLE';
    }
    // When `swimming` is true, skip your normal gravity/walk code.
});
