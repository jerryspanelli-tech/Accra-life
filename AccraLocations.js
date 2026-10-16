
import * as BABYLON from "@babylonjs/core";

export class AccraLocations {
    constructor(scene) {
        this.scene = scene;
        this.landmarks = [];
        this.waterZones = [];
        this.built = false;

        // Shared materials
        this.materials = {
            concrete: this.makeMaterial(
                "accraConcrete",
                "#888b90"
            ),
            glass: this.makeMaterial(
                "accraGlass",
                "#48a6c7",
                "#102c3b"
            ),
            dark: this.makeMaterial(
                "accraDark",
                "#292d35"
            ),
            gold: this.makeMaterial(
                "accraGold",
                "#f4bd32",
                "#8a5700"
            ),
            sand: this.makeMaterial(
                "accraSand",
                "#d7bd87"
            ),
            water: this.makeMaterial(
                "accraWater",
                "#167fa8",
                "#06445c",
                0.82
            ),
            grass: this.makeMaterial(
                "accraGrass",
                "#378345"
            ),
            white: this.makeMaterial(
                "accraWhite",
                "#eeeeea"
            )
        };
    }

    makeMaterial(name, color, emissive = "#000000", alpha = 1) {
        const material = new BABYLON.StandardMaterial(
            name,
            this.scene
        );

        material.diffuseColor =
            BABYLON.Color3.FromHexString(color);

        material.emissiveColor =
            BABYLON.Color3.FromHexString(emissive);

        material.alpha = alpha;
        return material;
    }

    createBox(name, size, position, material) {
        const mesh = BABYLON.MeshBuilder.CreateBox(
            name,
            size,
            this.scene
        );

        mesh.position.copyFrom(position);

        if (material) {
            mesh.material = material;
        }

        return mesh;
    }

    addLandmark(name, x, z) {
        this.landmarks.push({
            name,
            pos: new BABYLON.Vector3(x, 0, z)
        });
    }

    buildFullAccraMap() {
        if (this.built) return this.landmarks;

        this.buildAccraMall();
        this.buildSocialPubsAndNightlife();
        this.buildLabadiBeachAndSwimming();
        this.buildIndependenceSquareComplex();
        this.buildAccraSportsStadium();

        this.built = true;
        return this.landmarks;
    }

    // 1. ACCRA MALL
    buildAccraMall() {
        const centerX = -80;
        const centerZ = 180;

        this.createBox(
            "accraMallMain",
            { width: 140, height: 24, depth: 90 },
            new BABYLON.Vector3(centerX, 12, centerZ),
            this.materials.concrete
        );

        // Upper facade
        this.createBox(
            "accraMallUpperFacade",
            { width: 132, height: 7, depth: 2 },
            new BABYLON.Vector3(centerX, 17, 133),
            this.materials.dark
        );

        // Large front windows
        for (let i = 0; i < 10; i++) {
            this.createBox(
                `accraMallWindow${i}`,
                { width: 10, height: 8, depth: 0.8 },
                new BABYLON.Vector3(
                    centerX - 58 + i * 13,
                    10,
                    134
                ),
                this.materials.glass
            );
        }

        // Roof sign
        this.createBox(
            "accraMallSign",
            { width: 48, height: 4, depth: 1 },
            new BABYLON.Vector3(centerX, 23, 133),
            this.materials.gold
        );

        // Entrance canopy
        this.createBox(
            "accraMallEntrance",
            { width: 30, height: 2, depth: 12 },
            new BABYLON.Vector3(centerX, 5, 120),
            this.materials.dark
        );

        this.addLandmark(
            "Accra Mall",
            centerX,
            centerZ
        );
    }

    // 2. PUB AND NIGHTLIFE
    buildSocialPubsAndNightlife() {
        const x = 120;
        const z = -60;

        this.createBox(
            "accraVibesPub",
            { width: 55, height: 18, depth: 40 },
            new BABYLON.Vector3(x, 9, z),
            this.materials.dark
        );

        // Rooftop
        this.createBox(
            "pubRooftop",
            { width: 59, height: 2, depth: 44 },
            new BABYLON.Vector3(x, 19, z),
            this.materials.concrete
        );

        // Front glass panels
        for (let i = 0; i < 5; i++) {
            this.createBox(
                `pubWindow${i}`,
                { width: 7, height: 7, depth: 0.6 },
                new BABYLON.Vector3(
                    x - 21 + i * 10.5,
                    8,
                    z - 20.3
                ),
                this.materials.glass
            );
        }

        // Glowing sign
        this.createBox(
            "pubNeonSign",
            { width: 28, height: 5, depth: 1 },
            new BABYLON.Vector3(x, 14, z - 21),
            this.materials.gold
        );

        // Outdoor patio
        this.createBox(
            "pubPatio",
            { width: 65, height: 0.4, depth: 28 },
            new BABYLON.Vector3(x, 0.2, z + 34),
            this.materials.concrete
        );

        // Patio lights
        for (let i = 0; i < 4; i++) {
            const poleX = x - 24 + i * 16;

            this.createBox(
                `pubLightPole${i}`,
                { width: 0.5, height: 7, depth: 0.5 },
                new BABYLON.Vector3(poleX, 3.5, z + 42),
                this.materials.dark
            );

            const light = new BABYLON.PointLight(
                `pubLight${i}`,
                new BABYLON.Vector3(poleX, 6, z + 42),
                this.scene
            );

            light.diffuse = new BABYLON.Color3(
                1, 0.65, 0.25
            );
            light.intensity = 0.5;
            light.range = 18;
        }

        this.addLandmark(
            "Accra Vibes Pub & Lounge",
            x,
            z
        );
    }

    // 3. LABADI BEACH AND SWIMMING
    buildLabadiBeachAndSwimming() {
        const x = 250;
        const waterZ = -420;

        // Sand beach
        this.createBox(
            "labadiBeachSand",
            { width: 400, height: 0.5, depth: 80 },
            new BABYLON.Vector3(x, 0, -280),
            this.materials.sand
        );

        // Ocean surface
        const ocean = BABYLON.MeshBuilder.CreateGround(
            "labadiOcean",
            { width: 400, height: 240 },
            this.scene
        );

        ocean.position.set(x, 0.05, waterZ);
        ocean.material = this.materials.water;

        // Beach changing facility
        this.createBox(
            "labadiBeachFacility",
            { width: 24, height: 8, depth: 14 },
            new BABYLON.Vector3(x + 90, 4, -310),
            this.materials.white
        );

        // Lifeguard tower
        this.createBox(
            "beachLifeguardTower",
            { width: 5, height: 9, depth: 5 },
            new BABYLON.Vector3(x - 100, 4.5, -310),
            this.materials.gold
        );

        // Rectangular swimming boundaries
        this.waterZones.push({
            center: new BABYLON.Vector3(x, 0, waterZ),
            halfWidth: 200,
            halfDepth: 120
        });

        this.addLandmark(
            "Labadi Beach",
            x,
            -280
        );
    }

    checkSwimming(position) {
        return this.waterZones.some((zone) => {
            return (
                Math.abs(position.x - zone.center.x)
                    <= zone.halfWidth &&
                Math.abs(position.z - zone.center.z)
                    <= zone.halfDepth
            );
        });
    }

    // 4. INDEPENDENCE SQUARE
    buildIndependenceSquareComplex() {
        const x = 0;
        const z = -300;

        // Main ceremonial platform
        this.createBox(
            "independenceSquarePlatform",
            { width: 100, height: 1, depth: 75 },
            new BABYLON.Vector3(x, 0.5, z),
            this.materials.concrete
        );

        // Monument pillars
        for (let i = 0; i < 2; i++) {
            this.createBox(
                `independencePillar${i}`,
                { width: 5, height: 22, depth: 7 },
                new BABYLON.Vector3(
                    x + (i === 0 ? -15 : 15),
                    11.5,
                    z
                ),
                this.materials.white
            );
        }

        // Crossbeam
        this.createBox(
            "independenceArchBeam",
            { width: 38, height: 5, depth: 9 },
            new BABYLON.Vector3(x, 22, z),
            this.materials.white
        );

        // Central monument
        this.createBox(
            "independenceMonument",
            { width: 10, height: 14, depth: 8 },
            new BABYLON.Vector3(x, 8, z + 22),
            this.materials.gold
        );

        this.addLandmark(
            "Independence Square",
            x,
            z
        );
    }

    // 5. ACCRA SPORTS STADIUM
    buildAccraSportsStadium() {
        const x = 180;
        const z = -200;

        // Open-sided oval stadium walls
        const stadium = BABYLON.MeshBuilder.CreateCylinder(
            "accraStadiumStructure",
            {
                diameterTop: 180,
                diameterBottom: 200,
                height: 24,
                tessellation: 48,
                cap: BABYLON.Mesh.NO_CAP
            },
            this.scene
        );

        stadium.scaling.z = 1.2;
        stadium.position.set(x, 12, z);
        stadium.material = this.materials.concrete;

        // Green playing field
        const field = BABYLON.MeshBuilder.CreateGround(
            "accraStadiumPitch",
            { width: 105, height: 155 },
            this.scene
        );

        field.position.set(x, 0.3, z);
        field.material = this.materials.grass;

        // Pitch boundary lines
        const lineMat = this.materials.white;

        this.createBox(
            "pitchCenterLine",
            { width: 0.3, height: 0.08, depth: 155 },
            new BABYLON.Vector3(x, 0.38, z),
            lineMat
        );

        this.createBox(
            "pitchHalfwayLine",
            { width: 105, height: 0.08, depth: 0.3 },
            new BABYLON.Vector3(x, 0.38, z),
            lineMat
        );

        this.addLandmark(
            "Accra Sports Stadium",
            x,
            z
        );
    }
}
