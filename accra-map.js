/* accra-map.js
 * Shared 1:10-scale city layout for the Babylon.js Accra Life game.
 * Coordinates are game metres; 10 game metres represent roughly 100 real-world metres.
 * x increases east, z increases south. District blocks and all major POIs use this source.
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
  root.ACCRA_MAP = {
    version: 2,
    scale: 10,
    grid,
    cellCenters,
    localRoadOffsets,
    roadLines,
    highwayStartZ: -850,
    coastlineZ: 850,
    cityBounds: { minX: -825, maxX: 825, minZ: -825, maxZ: 825 },
    districts,
    places: {
      spawn: { x: -200, z: 250 },
      villa: { x: 750, z: -600 },
      estate: { x: 600, z: -200 },
      mall: { x: 600, z: -600 },
      makola: { x: -200, z: 200 },
      stadium: { x: -250, z: -180 },
      police: { x: -600, z: -200 },
      hospital: { x: -200, z: -600 },
      dealer: { x: -600, z: 200 },
      pub: { x: 200, z: 200 },
      airport: { x: 200, z: -550 },
      labadiBeach: { x: 200, z: 700 },
      quarry: { x: -1200, z: -600 },
      goldworks: { x: 1200, z: 400 },
      tema: { x: 2500, z: 200 },
      busStation: { x: -200, z: 350 },
      atms: [
        [-600, -200], [-200, -600], [200, -200], [600, -200],
        [-600, 200], [-200, 400], [200, 200], [600, 400],
        [-400, 0], [400, 0]
      ]
    }
  };
})(window);
