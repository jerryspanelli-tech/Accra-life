
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
buildExpandedTerrain() {
    const grass = new BABYLON.StandardMaterial(
        "expandedAccraGrass",
        this.scene
    );

    grass.diffuseColor = new BABYLON.Color3(0.28, 0.43, 0.24);

    const terrain = BABYLON.MeshBuilder.CreateGround(
        "expandedAccraTerrain",
        { width: 1800, height: 1600 },
        this.scene
    );

    terrain.position.y = -0.2;
    terrain.material = grass;
}

buildAccraRoadNetwork() {
    const roadMat = new BABYLON.StandardMaterial(
        "accraAsphalt",
        this.scene
    );
    roadMat.diffuseColor = new BABYLON.Color3(0.19, 0.20, 0.22);

    const lineMat = new BABYLON.StandardMaterial(
        "accraRoadMarkings",
        this.scene
    );
    lineMat.diffuseColor = new BABYLON.Color3(0.92, 0.84, 0.56);

    // Main roads running east-west.
    const horizontalRoads = [
        { z: -650, width: 28 },
        { z: -570, width: 12 },
        { z: -380, width: 24 },
        { z: -150, width: 24 },
        { z: 80, width: 20 },
        { z: 300, width: 24 },
        { z: 520, width: 24 },
        { z: 680, width: 16 }
    ];

    horizontalRoads.forEach((road, index) => {
        const mesh = BABYLON.MeshBuilder.CreateBox(
            `accraEastWestRoad${index}`,
            {
                width: 1500,
                height: 0.18,
                depth: road.width
            },
            this.scene
        );

        mesh.position.set(0, 0.04, road.z);
        mesh.material = roadMat;

        // Dashed center markings.
        for (let x = -720; x <= 720; x += 45) {
            const dash = BABYLON.MeshBuilder.CreateBox(
                `accraRoadDash${index}_${x}`,
                {
                    width: 18,
                    height: 0.04,
                    depth: 0.35
                },
                this.scene
            );

            dash.position.set(x, 0.15, road.z);
            dash.material = lineMat;
        }
    });

    // Main connecting roads running north-south.
    const verticalRoads = [
        { x: -700, width: 22 },
        { x: -500, width: 18 },
        { x: -300, width: 22 },
        { x: 500, width: 22 },
        { x: 700, width: 24 }
    ];

    verticalRoads.forEach((road, index) => {
        const mesh = BABYLON.MeshBuilder.CreateBox(
            `accraNorthSouthRoad${index}`,
            {
                width: road.width,
                height: 0.18,
                depth: 1400
            },
            this.scene
        );

        mesh.position.set(road.x, 0.05, 0);
        mesh.material = roadMat;

        for (let z = -660; z <= 660; z += 45) {
            const dash = BABYLON.MeshBuilder.CreateBox(
                `accraVerticalDash${index}_${z}`,
                {
                    width: 0.35,
                    height: 0.04,
                    depth: 18
                },
                this.scene
            );

            dash.position.set(road.x, 0.16, z);
            dash.material = lineMat;
        }
    });

    // Add a major connecting road toward the city center.
    const centralConnector = BABYLON.MeshBuilder.CreateBox(
        "accraCentralConnector",
        {
            width: 1000,
            height: 0.18,
            depth: 14
        },
        this.scene
    );

    centralConnector.position.set(0, 0.06, 190);
    centralConnector.material = roadMat;

    // Record road network landmarks.
    this.addLandmark("Accra Main Road Network", 0, 80);
}

buildAccraNeighborhoods() {
    const districts = [
        {
            name: "Makola Market",
            x: -500,
            z: -80,
            type: "market"
        },
        {
            name: "Osu",
            x: 400,
            z: -60,
            type: "commercial"
        },
        {
            name: "Nima",
            x: -500,
            z: 220,
            type: "dense"
        },
        {
            name: "Achimota",
            x: -500,
            z: 450,
            type: "residential"
        },
        {
            name: "Kasoa",
            x: -700,
            z: -450,
            type: "residential"
        },
        {
            name: "East Legon",
            x: 500,
            z: 400,
            type: "luxury"
        },
        {
            name: "Airport Residential Area",
            x: 700,
            z: -250,
            type: "modern"
        },
        {
            name: "Tema",
            x: 700,
            z: 580,
            type: "industrial"
        }
    ];

    districts.forEach((district, districtIndex) => {
        const buildingMat = new BABYLON.StandardMaterial(
            `districtMaterial${districtIndex}`,
            this.scene
        );

        const colors = {
            market: new BABYLON.Color3(0.68, 0.40, 0.23),
            commercial: new BABYLON.Color3(0.62, 0.64, 0.67),
            dense: new BABYLON.Color3(0.72, 0.56, 0.39),
            residential: new BABYLON.Color3(0.77, 0.69, 0.54),
            luxury: new BABYLON.Color3(0.87, 0.83, 0.72),
            modern: new BABYLON.Color3(0.53, 0.65, 0.72),
            industrial: new BABYLON.Color3(0.49, 0.52, 0.54)
        };

        buildingMat.diffuseColor = colors[district.type];

        // Build varied city blocks, not one repeated giant building.
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 4; col++) {
                const seed = districtIndex * 13 + row * 7 + col * 3;

                let width = 17 + (seed % 9);
                let depth = 15 + ((seed * 2) % 8);
                let height = 8 + ((seed * 5) % 12);

                if (district.type === "dense") {
                    height = 6 + (seed % 6);
                    width = 13 + (seed % 5);
                }

                if (district.type === "luxury") {
                    width = 24 + (seed % 8);
                    depth = 22 + (seed % 7);
                    height = 8 + (seed % 8);
                }

                if (district.type === "modern") {
                    height = 18 + (seed % 28);
                    width = 20 + (seed % 8);
                }

                if (district.type === "industrial") {
                    width = 30 + (seed % 10);
                    depth = 26 + (seed % 8);
                    height = 9 + (seed % 7);
                }

                const spacingX = district.type === "dense" ? 24 : 36;
                const spacingZ = district.type === "dense" ? 23 : 35;

                const x = district.x + (col - 1.5) * spacingX;
                const z = district.z + (row - 1) * spacingZ;

                const building = BABYLON.MeshBuilder.CreateBox(
                    `district${districtIndex}Building${row}_${col}`,
                    {
                        width,
                        height,
                        depth
                    },
                    this.scene
                );

                building.position.set(x, height / 2, z);
                building.material = buildingMat;
            }
        }

        // Give East Legon a few taller premium buildings.
        if (district.type === "luxury") {
            for (let i = 0; i < 3; i++) {
                const tower = BABYLON.MeshBuilder.CreateBox(
                    `eastLegonTower${i}`,
                    {
                        width: 18,
                        height: 48 + i * 12,
                        depth: 18
                    },
                    this.scene
                );

                tower.position.set(
                    district.x + 75 + i * 26,
                    tower.getBoundingInfo().boundingBox.extendSize.y,
                    district.z + 25
                );

                tower.material = buildingMat;
            }
        }

        this.addLandmark(
            district.name,
            district.x,
            district.z
        );
    });
}

buildAdditionalLandmarks() {
    const makeMaterial = (name, color) => {
        const material = new BABYLON.StandardMaterial(
            name,
            this.scene
        );
        material.diffuseColor = BABYLON.Color3.FromHexString(color);
        return material;
    };

    const green = makeMaterial("landmarkGreen", "#36834b");
    const white = makeMaterial("landmarkWhite", "#e8e4d8");
    const blue = makeMaterial("landmarkBlue", "#5596b5");
    const gold = makeMaterial("landmarkGold", "#d6a52e");

    // Kwame Nkrumah Memorial Park — stylized monument.
    const park = BABYLON.MeshBuilder.CreateGround(
        "kwameNkrumahPark",
        { width: 90, height: 75 },
        this.scene
    );

    park.position.set(-250, 0.02, -300);
    park.material = green;

    const monument = BABYLON.MeshBuilder.CreateCylinder(
        "kwameNkrumahMonument",
        {
            diameterTop: 8,
            diameterBottom: 15,
            height: 30,
            tessellation: 8
        },
        this.scene
    );

    monument.position.set(-250, 15, -300);
    monument.material = white;

    // Airport terminal-inspired building.
    const terminal = BABYLON.MeshBuilder.CreateBox(
        "kotokaAirportTerminal",
        { width: 110, height: 18, depth: 38 },
        this.scene
    );

    terminal.position.set(650, 9, -320);
    terminal.material = blue;

    // Industrial warehouses in Tema.
    for (let i = 0; i < 3; i++) {
        const warehouse = BABYLON.MeshBuilder.CreateBox(
            `temaWarehouse${i}`,
            { width: 36, height: 12, depth: 28 },
            this.scene
        );

        warehouse.position.set(
            600 + i * 42,
            6,
            640
        );

        warehouse.material = white;
    }

    // A recognizable city-center office tower.
    const tower = BABYLON.MeshBuilder.CreateBox(
        "accraOfficeTower",
        { width: 32, height: 100, depth: 30 },
        this.scene
    );

    tower.position.set(370, 50, 270);
    tower.material = blue;

    const towerRoof = BABYLON.MeshBuilder.CreateBox(
        "accraOfficeTowerRoof",
        { width: 35, height: 3, depth: 33 },
        this.scene
    );

    towerRoof.position.set(370, 101.5, 270);
    towerRoof.material = gold;

    this.addLandmark(
        "Kwame Nkrumah Memorial Park",
        -250,
        -300
    );

    this.addLandmark(
        "Kotoka International Airport",
        650,
        -320
    );

    this.addLandmark(
        "Accra Office Tower",
        370,
        270
    );
}

            z
        );
    }
}
