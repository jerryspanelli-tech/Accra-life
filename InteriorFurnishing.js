// InteriorFurnishing.js - Interactive appliances (TV, Radio, Fan, Bed, Lights)
import * as BABYLON from '@babylonjs/core';

export class InteriorFurnishing {
    // roomLights is optional: pass a RoomLights instance to get working lights
    constructor(scene, roomLights = null) {
        this.scene = scene;
        this.roomLights = roomLights;
        this.interactiveAppliances = [];
    }

    spawnHouseInterior(houseCenter) {
        // 1. Bed
        const bed = BABYLON.MeshBuilder.CreateBox("houseBed", { width: 6, height: 2, depth: 4 }, this.scene);
        bed.position = houseCenter.add(new BABYLON.Vector3(-10, 1, -10));
        const bedMat = new BABYLON.StandardMaterial("bedMat", this.scene);
        bedMat.diffuseColor = new BABYLON.Color3(0.1, 0.6, 0.2);
        bed.material = bedMat;

        // 2. TV
        const tv = BABYLON.MeshBuilder.CreateBox("livingTV", { width: 5, height: 3, depth: 0.5 }, this.scene);
        tv.position = houseCenter.add(new BABYLON.Vector3(0, 5, 14));
        const tvMat = new BABYLON.StandardMaterial("tvMat", this.scene);
        const tvOff = new BABYLON.Color3(0.1, 0.1, 0.2);
        const tvOn = new BABYLON.Color3(0.8, 0.9, 1);
        tvMat.emissiveColor = tvOff;
        tv.material = tvMat;

        let tvIsOn = false;
        this.interactiveAppliances.push({
            name: "Smart TV",
            mesh: tv,
            onInteract: () => {
                tvIsOn = !tvIsOn;
                tvMat.emissiveColor = tvIsOn ? tvOn : tvOff;
            }
        });

        // 3. Fan (spins only when switched on)
        const fan = BABYLON.MeshBuilder.CreateCylinder("roomFan", { diameter: 2, height: 0.2 }, this.scene);
        fan.position = houseCenter.add(new BABYLON.Vector3(5, 7, 0));
        let fanOn = false;
        this.scene.onBeforeRenderObservable.add(() => {
            if (fanOn) fan.rotation.y += 0.25;
        });
        this.interactiveAppliances.push({
            name: "Ceiling Fan",
            mesh: fan,
            onInteract: () => { fanOn = !fanOn; }
        });

        // 4. Radio
        const radio = BABYLON.MeshBuilder.CreateBox("roomRadio", { width: 1.5, height: 1, depth: 1 }, this.scene);
        radio.position = houseCenter.add(new BABYLON.Vector3(-4, 3, 5));
        const radioMat = new BABYLON.StandardMaterial("radioMat", this.scene);
        radioMat.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        radio.material = radioMat;

        this.interactiveAppliances.push({
            name: "Afrobeats Radio",
            mesh: radio,
            onInteract: () => console.log("[Accra Life] Playing Highlife & Afrobeats on Radio")
        });

        // 5. Lights (needs RoomLights)
        if (this.roomLights) {
            this.interactiveAppliances.push(
                this.roomLights.addLight("livingLight", houseCenter.add(new BABYLON.Vector3(0, 8, 0))),
                this.roomLights.addLight("bedroomLight", houseCenter.add(new BABYLON.Vector3(-10, 8, -10)))
            );
        }
    }

    checkApplianceInteraction(playerPos) {
        for (const item of this.interactiveAppliances) {
            if (BABYLON.Vector3.Distance(playerPos, item.mesh.position) < 3.5) {
                item.onInteract();
                break;
            }
        }
    }
}
