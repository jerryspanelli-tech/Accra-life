/* greater-accra-map.js
 * Replacement Greater Accra world layout.
 * Coordinates are metres. X runs west to east; negative Z is north.
 * The 4x4 district grid is retained as the engine contract, but the geography,
 * landmark anchors and arterial routes are rebuilt around Accra's real layout.
 */
(function (root) {
  "use strict";
  const grid = [-5000, -2500, 0, 2500, 5000];
  const cellCenters = [-3750, -1250, 1250, 3750];
  const localRoadOffsets = [-600, 600];
  // Each inner array is one west-to-east column; entries run north to south.
  const districts = [
    ["Achimota", "Kaneshie", "Mamprobi", "Chorkor"],
    ["Dzorwulu", "North Ridge", "Accra Central", "Jamestown"],
    ["East Legon", "Airport Residential", "Osu", "Labadi"],
    ["Airport City", "Cantonments", "Labone", "Teshie"]
  ];
  const roadLines = [...grid];
  cellCenters.forEach(c => localRoadOffsets.forEach(o => roadLines.push(c + o)));
  roadLines.sort((a, b) => a - b);

  // Main landmarks are placed relative to the districts they belong to.
  const places = {
    spawn: { x: -1050, z: 950 },
    villa: { x: 3400, z: -3350 },
    estate: { x: 3150, z: -950 },
    mall: { x: 3600, z: -1750 },
    makola: { x: -1050, z: 1050 },
    stadium: { x: -250, z: 1450 },
    blackStarSquare: { x: -180, z: 1770 },
    nkrumahPark: { x: -820, z: 1020 },
    artsCentre: { x: -430, z: 1430 },
    nationalTheatre: { x: 380, z: 820 },
    jamestownLighthouse: { x: -1750, z: 3300 },
    osuCastle: { x: 1250, z: 2850 },
    circle: { x: -1450, z: -1050 },
    militaryHospital: { x: 650, z: -1750 },
    achimotaForest: { x: -3900, z: -4150 },
    universityOfGhana: { x: 3300, z: -4500 },
    police: { x: -3900, z: -1200 },
    hospital: { x: -1250, z: -3850 },
    dealer: { x: -3900, z: 1250 },
    pub: { x: 1450, z: 1250 },
    airport: { x: 3750, z: -3550 },
    labadiBeach: { x: 1450, z: 4450 },
    quarry: { x: -6500, z: -3900 },
    goldworks: { x: 6100, z: 800 },
    tema: { x: 8200, z: 1650 },
    temaHarbour: { x: 8750, z: 2050 },
    busStation: { x: -1350, z: 2250 },
    atms: [
      [-4050,-1400],[-1450,-3900],[1450,-1450],[3900,-1450],
      [-3900,1450],[-950,2250],[1450,1450],[3900,3900],
      [-2250,-950],[1450,-3900]
    ]
  };

  const namedRoads = [
    {
      name: "N1 George Bush Highway", type: "highway", width: 22,
      points: [[-4300,-5600],[-4300,-3900],[-3900,-2500],[-2600,-1700],[-900,-1350],[900,-1150],[2600,-700],[4700,-250]]
    },
    {
      name: "Ring Road Central", type: "arterial", width: 18,
      points: [[-2050,-500],[-1750,-1250],[-950,-1750],[250,-1650],[1150,-950],[1350,100],[950,1050],[150,1750],[-1050,1900],[-2050,1150],[-2250,250],[-2050,-500]]
    },
    {
      name: "Liberation Road", type: "arterial", width: 18,
      points: [[3700,-4400],[3600,-3200],[2850,-2050],[2150,-850],[2350,250],[3200,1250],[4100,1800]]
    },
    {
      name: "Independence Avenue", type: "arterial", width: 14,
      points: [[-1450,-1050],[-1050,-450],[-650,250],[-180,1770],[350,2450]]
    },
    {
      name: "Spintex Road", type: "arterial", width: 20,
      points: [[1450,4200],[2700,3700],[4100,3200],[5550,2700],[7000,2150],[8200,1650]]
    },
    {
      name: "Accra–Tema Motorway", type: "highway", width: 22,
      points: [[3750,-3550],[4750,-2700],[5650,-1650],[6500,-650],[7350,550],[8200,1650]]
    },
    {
      name: "Tema Harbour Access Road", type: "arterial", width: 16,
      points: [[8200,1650],[8500,1850],[8750,2050]]
    },
    {
      name: "Kaneshie–Makola Connector", type: "arterial", width: 13,
      points: [[-3900,-850],[-2750,-250],[-1700,450],[-1050,1050]]
    },
    {
      name: "Labadi Coastal Road", type: "arterial", width: 14,
      points: [[1250,2850],[1450,3600],[1450,4450],[2600,4850],[3900,5000]]
    }
  ];

  root.ACCRA_MAP = {
    version: 5,
    scale: 1,
    expansion: 1,
    grid,
    cellCenters,
    localRoadOffsets,
    roadLines,
    highwayStartZ: -5600,
    coastlineZ: 5200,
    cityBounds: { minX: -5500, maxX: 9200, minZ: -6000, maxZ: 5600 },
    districts,
    places,
    namedRoads
  };
})(window);
