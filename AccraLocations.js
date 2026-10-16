import * as BABYLON from "@babylonjs/core";

export class AccraLocations {
    constructor(scene) {
        this.scene = scene;
        this.landmarks = [];
        this.waterZones = [];
        this.built = false;
        this.materials = {};

        this.createMaterials();
    }

    createMaterials() {
        const make = (name, color, emissive = "#000000", alpha = 1) => {
            const mat = new BABYLON.StandardMaterial(name, this.scene);
            mat.diffuseColor = BABYLON.Color3.FromHexString(color);
            mat.emissiveColor = BABYLON.Color3.FromHexString(emissive);
            mat.alpha = alpha;
            if (alpha < 1) {
                mat.backFaceCulling = false;
            }
            return mat;
        };

        this.materials = {
            concrete: make("accraConcrete", "#888b90"),
            glass: make("accraGlass", "#48a6c7", "#102c3b"),
            dark: make("accraDark", "#292d35"),
            gold: make("accraGold", "#f4bd32", "#8a5700"),
            sand: make("accraSand", "#d7bd87"),
            water: make("accraWater", "#167fa8", "#06445c", 0.82),
            grass: make("accraGrass", "#378345"),
            white: make("accraWhite", "#eeeeea"),
            road: make("accraAsphalt", "#303238"),
            roadLine: make("accraRoadLine", "#f0dca1"),
            red: make("accraRed", "#b84c3b"),
            orange: make("accraOrange", "#d78c43"),
            cream: make("accraCream", "#e5d3ad"),
            blue: make("accraBlue", "#5596b5"),
            green: make("accraGreen", "#397d45"),
            brown: make("accraBrown", "#805638")
        };
    }

    createBox(name, size, position, material) {
        const mesh = BABYLON.MeshBuilder.CreateBox(
            name,
            size,
            this.scene
        );
        mesh.position.copyFrom(position);
        if (material) mesh.material = material;
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

        // Build the environment before placing buildings and landmarks.
        this.buildExpandedTerrain();
        this.buildAccraRoadNetwork();
        this.buildAccraNeighborhoods();
        this.buildAdditionalLandmarks();

        this.buildAccraMall();
        this.buildSocialPubsAndNightlife();
        this.buildLabadiBeachAndSwimming();
        this.buildIndependenceSquareComplex();
        this.buildAccraSportsStadium();

        this.built = true;
        return this.landmarks;
    }

    // --------------------------------------------------
    // 1. EXPANDED TERRAIN
    // --------------------------------------------------

    buildExpandedTerrain() {
        const terrain = BABYLON.MeshBuilder.CreateGround(
            "expandedAccraTerrain",
            { width: 1800, height: 1600 },
            this.scene
        );

        terrain.position.y = -0.22;
        terrain.material = this.materials.grass;
    }

    // --------------------------------------------------
    // 2. MAIN ACCRA ROAD NETWORK
    // --------------------------------------------------

    buildAccraRoadNetwork() {
        const roadMat = this.materials.road;
        const lineMat = this.materials.roadLine;

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
            this.createBox(
                `accraEastWestRoad${index}`,
                {
                    width: 1500,
                    height: 0.18,
                    depth: road.width
                },
                new BABYLON.Vector3(0, -0.04, road.z),
                roadMat
            );

            for (let x = -720; x <= 720; x += 45) {
                this.createBox(
                    `accraRoadDash${index}_${x}`,
                    {
                        width: 18,
                        height: 0.035,
                        depth: 0.35
                    },
                    new BABYLON.Vector3(x, 0.06, road.z),
                    lineMat
                );
            }
        });

        const verticalRoads = [
            { x: -700, width: 22 },
            { x: -500, width: 18 },
            { x: -300, width: 22 },
            { x: 0, width: 24 },
            { x: 300, width: 18 },
            { x: 500, width: 22 },
            { x: 700, width: 24 }
        ];

        verticalRoads.forEach((road, index) => {
            this.createBox(
                `accraNorthSouthRoad${index}`,
                {
                    width: road.width,
                    height: 0.18,
                    depth: 1400
                },
                new BABYLON.Vector3(road.x, -0.03, 0),
                roadMat
            );

            for (let z = -660; z <= 660; z += 45) {
                this.createBox(
                    `accraVerticalDash${index}_${z}`,
                    {
                        width: 0.35,
                        height: 0.035,
                        depth: 18
                    },
                    new BABYLON.Vector3(road.x, 0.065, z),
                    lineMat
                );
            }
        });

        // Additional connecting road through the city.
        this.createBox(
            "accraCentralConnector",
            { width: 1000, height: 0.18, depth: 14 },
            new BABYLON.Vector3(0, -0.015, 190),
            roadMat
        );

        this.addLandmark("Accra Main Road Network", 0, 80);
    }

    // --------------------------------------------------
    // 3. ACCRA NEIGHBORHOODS
    // --------------------------------------------------

    buildAccraNeighborhoods() {
        const districts = [
            { name: "Makola Market", x: -500, z: -80, type: "market" },
            { name: "Osu", x: 400, z: -60, type: "commercial" },
            { name: "Nima", x: -500, z: 220, type: "dense" },
            { name: "Achimota", x: -500, z: 450, type: "residential" },
            { name: "Kasoa", x: -700, z: -450, type: "residential" },
            { name: "East Legon", x: 500, z: 400, type: "luxury" },
            { name: "Airport Residential Area", x: 700, z: -250, type: "modern" },
            { name: "Tema", x: 700, z: 580, type: "industrial" },
            { name: "Labadi", x: 400, z: -480, type: "residential" },
            { name: "Central Accra", x: 0, z: 80, type: "commercial" }
        ];

        const colors = {
            market: "#ad7045",
            commercial: "#858d96",
            dense: "#b58b60",
            residential: "#d0b68b",
            luxury: "#e4d7bd",
            modern: "#7095a9",
            industrial: "#777d80"
        };

        districts.forEach((district, districtIndex) => {
            const buildingMat = new BABYLON.StandardMaterial(
                `districtMaterial${districtIndex}`,
                this.scene
            );

            buildingMat.diffuseColor =
                BABYLON.Color3.FromHexString(colors[district.type]);

            const isDense = district.type === "dense";
            const isLuxury = district.type === "luxury";
            const isModern = district.type === "modern";
            const isIndustrial = district.type === "industrial";
            const isMarket = district.type === "market";

            for (let row = 0; row < 4; row++) {
                for (let col = 0; col < 5; col++) {
                    const seed = districtIndex * 17 + row * 7 + col * 3;

                    let width = 17 + (seed % 9);
                    let depth = 15 + ((seed * 2) % 8);
                    let height = 8 + ((seed * 5) % 12);

                    if (isDense) {
                        width = 13 + (seed % 5);
                        depth = 13 + ((seed * 2) % 5);
                        height = 6 + (seed % 7);
                    }

                    if (isLuxury) {
                        width = 24 + (seed % 8);
                        depth = 22 + (seed % 7);
                        height = 8 + (seed % 8);
                    }

                    if (isModern) {
                        width = 20 + (seed % 8);
                        depth = 18 + (seed % 7);
                        height = 20 + (seed % 30);
                    }

                    if (isIndustrial) {
                        width = 30 + (seed % 10);
                        depth = 26 + (seed % 8);
                        height = 9 + (seed % 7);
                    }

                    if (isMarket) {
                        width = 12 + (seed % 6);
                        depth = 12 + ((seed * 2) % 6);
                        height = 5 + (seed % 6);
                    }

                    const spacingX = isDense || isMarket ? 23 : 36;
                    const spacingZ = isDense || isMarket ? 22 : 35;

                    const buildingX =
                        district.x + (col - 2) * spacingX;
                    const buildingZ =
                        district.z + (row - 1.5) * spacingZ;

                    // Leave some room around main roads.
                    if (
                        Math.abs(buildingX) < 18 ||
                        [-650, -570, -380, -150, 80, 300, 520, 680]
                            .some(z => Math.abs(buildingZ - z) < 17)
                    ) {
                        continue;
                    }

                    const building = this.createBox(
                        `district${districtIndex}Building${row}_${col}`,
                        { width, height, depth },
                        new BABYLON.Vector3(
                            buildingX,
                            height / 2,
                            buildingZ
                        ),
                        buildingMat
                    );

                    building.checkCollisions = true;

                    // Small contrasting roof for selected buildings.
                    if (seed % 3 === 0) {
                        this.createBox(
                            `districtRoof${districtIndex}_${row}_${col}`,
                            { width: width + 1, height: 0.7, depth: depth + 1 },
                            new BABYLON.Vector3(
                                buildingX,
                                height + 0.35,
                                buildingZ
                            ),
                            this.materials.dark
                        );
                    }

                    // Market stalls get colorful awnings.
                    if (isMarket && col % 2 === 0) {
                        this.createBox(
                            `marketAwning${row}_${col}`,
                            { width: width + 1, height: 1, depth: 3 },
                            new BABYLON.Vector3(
                                buildingX,
                                3,
                                buildingZ + depth / 2 + 1
                            ),
                            col % 4 === 0
                                ? this.materials.red
                                : this.materials.gold
                        );
                    }
                }
            }

            // East Legon: larger premium homes and taller buildings.
            if (isLuxury) {
                for (let i = 0; i < 3; i++) {
                    const height = 48 + i * 12;
                    const towerX = district.x + 100 + i * 30;
                    const towerZ = district.z + 55;

                    const tower = this.createBox(
                        `eastLegonTower${i}`,
                        { width: 18, height, depth: 18 },
                        new BABYLON.Vector3(
                            towerX,
                            height / 2,
                            towerZ
                        ),
                        this.materials.blue
                    );

                    tower.checkCollisions = true;

                    this.createBox(
                        `eastLegonTowerRoof${i}`,
                        { width: 20, height: 2, depth: 20 },
                        new BABYLON.Vector3(
                            towerX,
                            height + 1,
                            towerZ
                        ),
                        this.materials.dark
                    );
                }

                // Large residential houses.
                for (let i = 0; i < 3; i++) {
                    const houseX = district.x - 90 + i * 48;
                    const houseZ = district.z + 105;

                    this.createBox(
                        `eastLegonMansion${i}`,
                        { width: 36, height: 12, depth: 30 },
                        new BABYLON.Vector3(houseX, 6, houseZ),
                        this.materials.cream
                    );

                    this.createBox(
                        `eastLegonMansionRoof${i}`,
                        { width: 39, height: 2, depth: 33 },
                        new BABYLON.Vector3(houseX, 13, houseZ),
                        this.materials.red
                    );
                }
            }

            this.addLandmark(
                district.name,
                district.x,
                district.z
            );
        });
    }

    // --------------------------------------------------
    // 4. ADDITIONAL LANDMARKS
    // --------------------------------------------------

    buildAdditionalLandmarks() {
        // Kwame Nkrumah Memorial Park.
        const park = BABYLON.MeshBuilder.CreateGround(
            "kwameNkrumahPark",
            { width: 90, height: 75 },
            this.scene
        );

        park.position.set(-250, 0.015, -300);
        park.material = this.materials.grass;

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
        monument.material = this.materials.white;

        // Kotoka International Airport terminal.
        const terminal = this.createBox(
            "kotokaAirportTerminal",
            { width: 110, height: 18, depth: 38 },
            new BABYLON.Vector3(650, 9, -320),
            this.materials.blue
        );

        terminal.checkCollisions = true;

        this.createBox(
            "airportTerminalRoof",
            { width: 114, height: 2, depth: 42 },
            new BABYLON.Vector3(650, 19, -320),
            this.materials.dark
        );

        // Runway.
        this.createBox(
            "kotokaAirportRunway",
            { width: 320, height: 0.15, depth: 32 },
            new BABYLON.Vector3(650, 0.02, -380),
            this.materials.road
        );

        for (let x = 510; x <= 790; x += 35) {
            this.createBox(
                `airportRunwayMark${x}`,
                { width: 15, height: 0.03, depth: 0.5 },
                new BABYLON.Vector3(x, 0.11, -380),
                this.materials.white
            );
        }

        // Tema warehouses.
        for (let i = 0; i < 4; i++) {
            const warehouseX = 580 + i * 48;

            const warehouse = this.createBox(
                `temaWarehouse${i}`,
                { width: 36, height: 12, depth: 28 },
                new BABYLON.Vector3(warehouseX, 6, 620),
                this.materials.cream
            );

            warehouse.checkCollisions = true;

            this.createBox(
                `temaWarehouseRoof${i}`,
                { width: 38, height: 1.5, depth: 30 },
                new BABYLON.Vector3(warehouseX, 12.75, 620),
                this.materials.dark
            );
        }

        // Stylized tall Accra office tower.
        const tower = this.createBox(
            "accraOfficeTower",
            { width: 32, height: 100, depth: 30 },
            new BABYLON.Vector3(370, 50, 270),
            this.materials.blue
        );

        tower.checkCollisions = true;

        this.createBox(
            "accraOfficeTowerRoof",
            { width: 35, height: 3, depth: 33 },
            new BABYLON.Vector3(370, 101.5, 270),
            this.materials.gold
        );

        // A small public park in the city.
        const cityPark = BABYLON.MeshBuilder.CreateGround(
            "accraCityPark",
            { width: 65, height: 55 },
            this.scene
        );

        cityPark.position.set(120, 0.025, 400);
        cityPark.material = this.materials.grass;

        // Simple trees.
        for (let i = 0; i < 8; i++) {
            const treeX = 95 + (i % 4) * 16;
            const treeZ = 382 + Math.floor(i / 4) * 28;

            const trunk = BABYLON.MeshBuilder.CreateCylinder(
                `accraParkTreeTrunk${i}`,
                { diameter: 1.5, height: 5 },
                this.scene
            );

            trunk.position.set(treeX, 2.5, treeZ);
            trunk.material = this.materials.brown;

            const leaves = BABYLON.MeshBuilder.CreateSphere(
                `accraParkTreeLeaves${i}`,
                { diameter: 7, segments: 6 },
                this.scene
            );

            leaves.position.set(treeX, 6.5, treeZ);
            leaves.material = this.materials.green;
        }

        this.addLandmark("Kwame Nkrumah Memorial Park", -250, -300);
        this.addLandmark("Kotoka International Airport", 650, -320);
        this.addLandmark("Accra Office Tower", 370, 270);
        this.addLandmark("Tema Industrial Area", 650, 620);
        this.addLandmark("Accra City Park", 120, 400);
    }

    // --------------------------------------------------
    // 5. ACCRA MALL
    // --------------------------------------------------

    buildAccraMall() {
        const x = -80;
        const z = 180;

        const mall = this.createBox(
            "accraMallMain",
            { width: 140, height: 24, depth: 90 },
            new BABYLON.Vector3(x, 12, z),
            this.materials.concrete
        );

        mall.checkCollisions = true;

        this.createBox(
            "accraMallUpperFacade",
            { width: 132, height: 7, depth: 2 },
            new BABYLON.Vector3(x, 17, z - 46),
            this.materials.dark
        );

        for (let i = 0; i < 10; i++) {
            this.createBox(
                `accraMallWindow${i}`,
                { width: 10, height: 8, depth: 0.8 },
                new BABYLON.Vector3(
                    x - 58 + i * 13,
                    10,
                    z - 45.5
                ),
                this.materials.glass
            );
        }

        this.createBox(
            "accraMallSign",
            { width: 48, height: 4, depth: 1 },
            new BABYLON.Vector3(x, 23, z - 46),
            this.materials.gold
        );

        this.createBox(
            "accraMallEntrance",
            { width: 30, height: 2, depth: 12 },
            new BABYLON.Vector3(x, 5, z - 57),
            this.materials.dark
        );

        this.addLandmark("Accra Mall", x, z);
    }

    // --------------------------------------------------
    // 6. PUBS AND NIGHTLIFE
    // --------------------------------------------------

    buildSocialPubsAndNightlife() {
        const x = 120;
        const z = -60;

        const pub = this.createBox(
            "accraVibesPub",
            { width: 55, height: 18, depth: 40 },
            new BABYLON.Vector3(x, 9, z),
            this.materials.dark
        );

        pub.checkCollisions = true;

        this.createBox(
            "pubRooftop",
            { width: 59, height: 2, depth: 44 },
            new BABYLON.Vector3(x, 19, z),
            this.materials.concrete
        );

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

        this.createBox(
            "pubNeonSign",
            { width: 28, height: 5, depth: 1 },
            new BABYLON.Vector3(x, 14, z - 21),
            this.materials.gold
        );

        this.createBox(
            "pubPatio",
            { width: 65, height: 0.4, depth: 28 },
            new BABYLON.Vector3(x, 0.2, z + 34),
            this.materials.concrete
        );

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

            light.diffuse = new BABYLON.Color3(1, 0.65, 0.25);
            light.intensity = 0.5;
            light.range = 18;
        }

        this.addLandmark("Accra Vibes Pub & Lounge", x, z);
    }

    // --------------------------------------------------
    // 7. LABADI BEACH AND SWIMMING
    // --------------------------------------------------

    buildLabadiBeachAndSwimming() {
        const x = 250;
        const beachZ = -280;
        const waterZ = -420;

        const beach = BABYLON.MeshBuilder.CreateGround(
            "labadiBeachSand",
            { width: 400, height: 80 },
            this.scene
        );

        beach.position.set(x, 0.015, beachZ);
        beach.material = this.materials.sand;

        const ocean = BABYLON.MeshBuilder.CreateGround(
            "labadiOcean",
            { width: 400, height: 240 },
            this.scene
        );

        ocean.position.set(x, 0.025, waterZ);
        ocean.material = this.materials.water;

        const facility = this.createBox(
            "labadiBeachFacility",
            { width: 24, height: 8, depth: 14 },
            new BABYLON.Vector3(x + 90, 4, -310),
            this.materials.white
        );

        facility.checkCollisions = true;

        this.createBox(
            "beachLifeguardTower",
            { width: 5, height: 9, depth: 5 },
            new BABYLON.Vector3(x - 100, 4.5, -310),
            this.materials.gold
        );

        this.waterZones.push({
            center: new BABYLON.Vector3(x, 0, waterZ),
            halfWidth: 200,
            halfDepth: 120
        });

        this.addLandmark("Labadi Beach", x, beachZ);
    }

    checkSwimming(position) {
        return this.waterZones.some(zone => (
            Math.abs(position.x - zone.center.x) <= zone.halfWidth &&
            Math.abs(position.z - zone.center.z) <= zone.halfDepth
        ));
    }

    // --------------------------------------------------
    // 8. INDEPENDENCE SQUARE
    // --------------------------------------------------

    buildIndependenceSquareComplex() {
        const x = 0;
        const z = -300;

        this.createBox(
            "independenceSquarePlatform",
            { width: 100, height: 1, depth: 75 },
            new BABYLON.Vector3(x, 0.5, z),
            this.materials.concrete
        );

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

        this.createBox(
            "independenceArchBeam",
            { width: 38, height: 5, depth: 9 },
            new BABYLON.Vector3(x, 22, z),
            this.materials.white
        );

        this.createBox(
            "independenceMonument",
            { width: 10, height: 14, depth: 8 },
            new BABYLON.Vector3(x, 8, z + 22),
            this.materials.gold
        );

        this.addLandmark("Independence Square", x, z);
    }

    // --------------------------------------------------
    // 9. ACCRA SPORTS STADIUM
    // --------------------------------------------------

    buildAccraSportsStadium() {
        const x = 180;
        const z = -200;

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
        stadium.checkCollisions = true;

        const field = BABYLON.MeshBuilder.CreateGround(
            "accraStadiumPitch",
            { width: 105, height: 155 },
            this.scene
        );

        field.position.set(x, 0.3, z);
        field.material = this.materials.grass;

        this.createBox(
            "pitchCenterLine",
            { width: 0.3, height: 0.08, depth: 155 },
            new BABYLON.Vector3(x, 0.38, z),
            this.materials.white
        );

        this.createBox(
            "pitchHalfwayLine",
            { width: 105, height: 0.08, depth: 0.3 },
            new BABYLON.Vector3(x, 0.38, z),
            this.materials.white
        );

// Center circle.
const centerCircle = BABYLON.MeshBuilder.CreateTorus(
  "pitchCenterCircle",
  { diameter: 22, thickness: 0.3 },
  this.scene
);

centerCircle.position.set(x, 0.4, z);
centerCircle.material = this.materialManager;

this.addLandmark("Accra Sports Stadium");
window.AccraLocations = AccraLocations;
window.ACCRA_MODULES = window.ACCRA_MODULES || {};
window.ACCRA_MODULES.locations = 1;
})();
