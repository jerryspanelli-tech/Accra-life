(function () {
    class AccraLocations {
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

        buildExpandedTerrain() {
            const terrain = BABYLON.MeshBuilder.CreateGround(
                "expandedAccraTerrain",
                { width: 1800, height: 1600 },
                this.scene
            );

            terrain.position.y = -0.22;
            terrain.material = this.materials.grass;
        }

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
                    { width: 1500, height: 0.18, depth: road.width },
                    new BABYLON.Vector3(0, -0.04, road.z),
                    roadMat
                );

                for (let x = -720; x <= 720; x += 45) {
                    this.createBox(
                        `accraRoadDash${index}_${x}`,
                        { width: 18, height: 0.035, depth: 0.35 },
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
                    { width: road.width, height: 0.18, depth: 1400 },
                    new BABYLON.Vector3(road.x, -0.03, 0),
                    roadMat
                );

                for (let z = -660; z <= 660; z += 45) {
                    this.createBox(
                        `accraVerticalDash${index}_${z}`,
                        { width: 0.35, height: 0.035, depth: 18 },
                        new BABYLON.Vector3(road.x, 0.065, z),
                        lineMat
                    );
                }
            });

            this.createBox(
                "accraCentralConnector",
                { width: 1000, height: 0.18, depth: 14 },
                new BABYLON.Vector3(0, -0.015, 190),
                roadMat
            );

            this.addLandmark("Accra Main Road Network", 0, 80);
        }

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

                buildingMat.diffuseColor = BABYLON.Color3.FromHexString(colors[district.type]);

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

                        const buildingX = district.x + (col - 2) * spacingX;
                        const buildingZ = district.z + (row - 1.5) * spacingZ;

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
                            new BABYLON.Vector3(buildingX, height / 2, buildingZ),
                            buildingMat
                        );

                        building.checkCollisions = true;

                        if (seed % 3 === 0) {
                            this.createBox(
                                `districtRoof${districtIndex}_${row}_${col}`,
                                { width: width + 1, height: 0.7, depth: depth + 1 },
                                new BABYLON.Vector3(buildingX, height + 0.35, buildingZ),
                                this.materials.dark
                            );
                        }
                    }
                }

                this.addLandmark(district.name, district.x, district.z);
            });
        }

        buildAdditionalLandmarks() {
            const park = BABYLON.MeshBuilder.CreateGround(
                "kwameNkrumahPark",
                { width: 90, height: 75 },
                this.scene
            );
            park.position.set(-250, 0.015, -300);
            park.material = this.materials.grass;

            this.addLandmark("Kwame Nkrumah Memorial Park", -250, -300);
        }

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
            this.addLandmark("Accra Mall", x, z);
        }

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
            this.addLandmark("Accra Vibes Pub & Lounge", x, z);
        }

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

        buildIndependenceSquareComplex() {
            const x = 0;
            const z = -300;
            this.createBox(
                "independenceSquarePlatform",
                { width: 100, height: 1, depth: 75 },
                new BABYLON.Vector3(x, 0.5, z),
                this.materials.concrete
            );
            this.addLandmark("Independence Square", x, z);
        }

        buildAccraSportsStadium() {
            const x = 180;
            const z = -200;

            const stadium = BABYLON.MeshBuilder.CreateCylinder(
                "accraStadiumStructure",
                { diameterTop: 180, diameterBottom: 200, height: 24, tessellation: 48, cap: BABYLON.Mesh.NO_CAP },
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

            const centerCircle = BABYLON.MeshBuilder.CreateTorus(
                "pitchCenterCircle",
                { diameter: 22, thickness: 0.3 },
                this.scene
            );
            centerCircle.position.set(x, 0.4, z);
            centerCircle.material = this.materials.dark;

            this.addLandmark("Accra Sports Stadium", x, z);
        }
    }

    window.AccraLocations = AccraLocations;
    window.ACCRA_MODULES = window.ACCRA_MODULES || {};
    window.ACCRA_MODULES.locations = 1;
})();
