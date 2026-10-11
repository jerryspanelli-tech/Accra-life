// AccraLocations.js - Accra Mall, Social Pubs, and Swimming Zones (fixed)
import * as BABYLON from '@babylonjs/core';

export class AccraLocations {
    constructor(scene) {
        this.scene = scene;
        this.landmarks = [];
        this.waterZones = [];
    }

    buildFullAccraMap() {
        this.buildAccraMall();
        this.buildSocialPubsAndNightlife();
        this.buildLabadiBeachAndSwimming();
        // TODO: add these when you write them:
        // this.buildIndependenceSquareComplex();
        // this.buildAccraSportsStadium();
        // this.buildKotokaAirportFullComplex();
    }

    buildAccraMall() {
        const mallMain = BABYLON.MeshBuilder.CreateBox("accraMall", { width: 140, height: 24, depth: 90 }, this.scene);
        mallMain.position = new BABYLON.Vector3(-80, 12, 180);

        const mallMat = new BABYLON.StandardMaterial("mallMat", this.scene);
        mallMat.diffuseColor = new BABYLON.Color3(0.88, 0.88, 0.9);
        mallMain.material = mallMat;

        const entrance = BABYLON.MeshBuilder.CreateBox("mallEntrance", { width: 35, height: 16, depth: 6 }, this.scene);
        entrance.position = new BABYLON.Vector3(-80, 8, 133);
        const glassMat = new BABYLON.StandardMaterial("mallGlass", this.scene);
        glassMat.diffuseColor = new BABYLON.Color3(0.1, 0.3, 0.5);
        glassMat.alpha = 0.6;
        entrance.material = glassMat;

        this.landmarks.push({ name: "Accra Mall Complex", pos: new BABYLON.Vector3(-80, 0, 180) });
    }

    buildSocialPubsAndNightlife() {
        const pub = BABYLON.MeshBuilder.CreateBox("localPub", { width: 45, height: 12, depth: 35 }, this.scene);
        pub.position = new BABYLON.Vector3(120, 6, -60);

        const pubMat = new BABYLON.StandardMaterial("pubMat", this.scene);
        pubMat.diffuseColor = new BABYLON.Color3(0.55, 0.25, 0.15);
        pub.material = pubMat;

        this.landmarks.push({ name: "Osu Local Pub & Spot", pos: new BABYLON.Vector3(120, 0, -60) });
    }

    buildLabadiBeachAndSwimming() {
        // Sits slightly below y=0 so it doesn't z-fight with ground
        const center = new BABYLON.Vector3(250, -0.05, -420);

        const oceanWater = BABYLON.MeshBuilder.CreateGround("oceanWater", { width: 400, height: 200 }, this.scene);
        oceanWater.position = center;

        const waterMat = new BABYLON.StandardMaterial("waterMat", this.scene);
        waterMat.diffuseColor = new BABYLON.Color3(0.1, 0.4, 0.65);
        waterMat.alpha = 0.85;
        oceanWater.material = waterMat;

        // Rectangle zone matching the mesh (used by SwimPhysics)
        this.waterZones.push({ center, halfW: 200, halfD: 100, surfaceY: 0 });

        this.landmarks.push({ name: "Labadi Beach Swimming Zone", pos: new BABYLON.Vector3(250, 0, -350) });
    }

    checkSwimming(p) {
        return this.waterZones.some(z =>
            Math.abs(p.x - z.center.x) < z.halfW &&
            Math.abs(p.z - z.center.z) < z.halfD);
    }
}
