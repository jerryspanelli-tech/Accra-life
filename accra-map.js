/* accra-map.js
 * Shared 1:10-scale Accra layout for the Babylon.js game.
 * Coordinates are game metres; x increases east and z increases south.
 * Major places and named routes are kept here so every game system uses one map.
 */
(function (root) {
  "use strict";
  const grid = [-800, -400, 0, 400, 800];
  const cellCenters = [-600, -200, 200, 600];
  const localRoadOffsets = [-100, 100];
  const districts = [
    ["Achimota", "Kaneshie", "Mamprobi", "Chorkor"],
    ["Dzorwulu", "North Ridge", "Accra Central", "Jamestown"],
    ["Airport Residential", "Airport City", "Osu", "Labadi"],
    ["East Legon", "Cantonments", "Labone", "Teshie"]
  ];
  const roadLines = [...grid];
  cellCenters.forEach(c => localRoadOffsets.forEach(o => roadLines.push(c + o)));
  roadLines.sort((a, b) => a - b);
  const places = {
    spawn: { x: -200, z: 250 },
    villa: { x: 750, z: -600 },
    estate: { x: 600, z: -200 },
    mall: { x: 600, z: -600 },
    makola: { x: -200, z: 200 },
    stadium: { x: -36, z: 160 },
    blackStarSquare: { x: -42, z: 202 },
    nkrumahPark: { x: -150, z: 105 },
    artsCentre: { x: -90, z: 140 },
    nationalTheatre: { x: 80, z: 50 },
    jamestownLighthouse: { x: -257, z: 430 },
    osuCastle: { x: 150, z: 300 },
    circle: { x: -200, z: -200 },
    militaryHospital: { x: 44, z: -233 },
    achimotaForest: { x: -600, z: -600 },
    universityOfGhana: { x: 600, z: -780 },
    police: { x: -600, z: -200 },
    hospital: { x: -200, z: -600 },
    dealer: { x: -600, z: 200 },
    pub: { x: 200, z: 200 },
    airport: { x: 200, z: -550 },
    labadiBeach: { x: 200, z: 700 },
    quarry: { x: -1200, z: -600 },
    goldworks: { x: 1200, z: 400 },
    tema: { x: 2500, z: 200 },
    temaHarbour: { x: 2600, z: 330 },
    busStation: { x: -200, z: 350 },
    atms: [
      [-670, -260], [-230, -660], [230, -230], [650, -230],
      [-650, 230], [-150, 350], [250, 250], [650, 450],
      [-350, -150], [250, -650]
    ]
  };
  const namedRoads = [
    { name: "N1 George Bush Highway", type: "highway", width: 18, points: [[-600, -650], [-200, -650], [0, -850], [250, -800], [600, -700]] },
    { name: "Ring Road Central", type: "arterial", width: 14, points: [[-450, -120], [-360, -300], [-120, -390], [180, -350], [390, -120], [350, 160], [120, 340], [-190, 350], [-420, 170], [-450, -120]] },
    { name: "Liberation Road", type: "arterial", width: 14, points: [[420, -550], [430, -360], [350, -160], [200, 40], [280, 230], [600, 350]] },
    { name: "Independence Avenue", type: "arterial", width: 12, points: [[-200, -200], [-150, -60], [-80, 80], [-42, 202], [40, 350]] },
    { name: "Spintex Road", type: "arterial", width: 16, points: [[250, 500], [520, 500], [850, 430], [1200, 350], [1650, 260], [2100, 200], [2500, 200]] }
  ];
  root.ACCRA_MAP = {
    version: 3,
    scale: 10,
    grid,
    cellCenters,
    localRoadOffsets,
    roadLines,
    highwayStartZ: -850,
    coastlineZ: 850,
    cityBounds: { minX: -825, maxX: 825, minZ: -825, maxZ: 825 },
    districts,
    places,
    namedRoads
  };
})(window);
