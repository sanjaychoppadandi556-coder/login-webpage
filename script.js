import * as THREE from "three";

import { FBXLoader } from
  "three/addons/loaders/FBXLoader.js";

import { OrbitControls } from
  "three/addons/controls/OrbitControls.js";


/* =====================================================
   HTML ELEMENTS
===================================================== */

const container =
  document.getElementById("gameContainer");

const loadingScreen =
  document.getElementById("loadingScreen");

const loadingText =
  document.getElementById("loadingText");


/* =====================================================
   THREE.JS SCENE
===================================================== */

const scene = new THREE.Scene();

scene.background =
  new THREE.Color(0x62a8e5);

scene.fog =
  new THREE.Fog(
    0x62a8e5,
    40,
    150
  );


/* =====================================================
   CAMERA
===================================================== */

const camera = new THREE.PerspectiveCamera(
  55,
  window.innerWidth / window.innerHeight,
  0.1,
  300
);

camera.position.set(
  0,
  4,
  8
);


/* =====================================================
   RENDERER
===================================================== */

const renderer = new THREE.WebGLRenderer({
  antialias: true
});

renderer.setSize(
  window.innerWidth,
  window.innerHeight
);

renderer.setPixelRatio(
  Math.min(
    window.devicePixelRatio,
    2
  )
);

renderer.shadowMap.enabled = true;

renderer.shadowMap.type =
  THREE.PCFSoftShadowMap;

renderer.outputColorSpace =
  THREE.SRGBColorSpace;

renderer.toneMapping =
  THREE.ACESFilmicToneMapping;

renderer.toneMappingExposure = 1.1;

container.appendChild(
  renderer.domElement
);


/* =====================================================
   CAMERA CONTROLS
===================================================== */

const controls = new OrbitControls(
  camera,
  renderer.domElement
);

controls.enableDamping = true;
controls.enablePan = false;

controls.minDistance = 3;
controls.maxDistance = 14;

controls.maxPolarAngle =
  Math.PI / 2.05;

controls.target.set(
  0,
  1.5,
  0
);


/* =====================================================
   LIGHTS
===================================================== */

const hemisphereLight =
  new THREE.HemisphereLight(
    0xffffff,
    0x334455,
    2.4
  );

scene.add(
  hemisphereLight
);


const directionalLight =
  new THREE.DirectionalLight(
    0xffffff,
    3.2
  );

directionalLight.position.set(
  12,
  18,
  10
);

directionalLight.castShadow = true;

directionalLight.shadow.mapSize.set(
  2048,
  2048
);

directionalLight.shadow.camera.left = -35;
directionalLight.shadow.camera.right = 35;
directionalLight.shadow.camera.top = 35;
directionalLight.shadow.camera.bottom = -35;

scene.add(
  directionalLight
);


const cityFillLight =
  new THREE.DirectionalLight(
    0x9ecbff,
    1.2
  );

cityFillLight.position.set(
  -12,
  10,
  -8
);

scene.add(
  cityFillLight
);


/* =====================================================
   CITY GROUP
===================================================== */

const cityGroup =
  new THREE.Group();

scene.add(
  cityGroup
);


/* =====================================================
   ROAD
===================================================== */

const roadMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x25292e,
    roughness: 0.82,
    metalness: 0.08
  });

const road =
  new THREE.Mesh(
    new THREE.PlaneGeometry(
      18,
      220
    ),
    roadMaterial
  );

road.rotation.x =
  -Math.PI / 2;

road.position.y = 0;

road.receiveShadow = true;

cityGroup.add(
  road
);


/* =====================================================
   ROAD SHOULDERS
===================================================== */

const shoulderMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x3b3f43,
    roughness: 0.9
  });

function createRoadShoulder(x) {
  const shoulder =
    new THREE.Mesh(
      new THREE.PlaneGeometry(
        2,
        220
      ),
      shoulderMaterial
    );

  shoulder.rotation.x =
    -Math.PI / 2;

  shoulder.position.set(
    x,
    0.005,
    0
  );

  shoulder.receiveShadow = true;

  cityGroup.add(
    shoulder
  );
}

createRoadShoulder(-10);
createRoadShoulder(10);


/* =====================================================
   ROAD CENTER LINES
===================================================== */

const yellowLineMaterial =
  new THREE.MeshStandardMaterial({
    color: 0xf2cc35,
    roughness: 0.75
  });

function createRoadCenterLine(z) {
  const line =
    new THREE.Mesh(
      new THREE.PlaneGeometry(
        0.16,
        3.2
      ),
      yellowLineMaterial
    );

  line.rotation.x =
    -Math.PI / 2;

  line.position.set(
    0,
    0.015,
    z
  );

  cityGroup.add(
    line
  );
}

for (
  let z = -105;
  z <= 105;
  z += 6.5
) {
  createRoadCenterLine(z);
}


/* =====================================================
   SIDE ROAD LINES
===================================================== */

const whiteLineMaterial =
  new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.8
  });

function createSideRoadLine(x) {
  const line =
    new THREE.Mesh(
      new THREE.PlaneGeometry(
        0.12,
        220
      ),
      whiteLineMaterial
    );

  line.rotation.x =
    -Math.PI / 2;

  line.position.set(
    x,
    0.012,
    0
  );

  cityGroup.add(
    line
  );
}

createSideRoadLine(-7.6);
createSideRoadLine(7.6);


/* =====================================================
   SIDEWALKS
===================================================== */

const sidewalkMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x787d82,
    roughness: 0.95
  });

function createSidewalk(x) {
  const sidewalk =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        6,
        0.28,
        220
      ),
      sidewalkMaterial
    );

  sidewalk.position.set(
    x,
    0.12,
    0
  );

  sidewalk.receiveShadow = true;
  sidewalk.castShadow = true;

  cityGroup.add(
    sidewalk
  );
}

createSidewalk(-12);
createSidewalk(12);


/* =====================================================
   OUTER CITY GROUND
===================================================== */

const outerGroundMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x4c555d,
    roughness: 1
  });

function createOuterGround(x) {
  const ground =
    new THREE.Mesh(
      new THREE.PlaneGeometry(
        80,
        220
      ),
      outerGroundMaterial
    );

  ground.rotation.x =
    -Math.PI / 2;

  ground.position.set(
    x,
    -0.01,
    0
  );

  ground.receiveShadow = true;

  cityGroup.add(
    ground
  );
}

createOuterGround(-55);
createOuterGround(55);


/* =====================================================
   CROSSWALKS
===================================================== */

const crosswalkMaterial =
  new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.85
  });

function createCrosswalk(z) {
  for (
    let index = 0;
    index < 8;
    index += 1
  ) {
    const stripe =
      new THREE.Mesh(
        new THREE.PlaneGeometry(
          1.2,
          4.5
        ),
        crosswalkMaterial
      );

    stripe.rotation.x =
      -Math.PI / 2;

    stripe.position.set(
      -5.25 + index * 1.5,
      0.018,
      z
    );

    cityGroup.add(
      stripe
    );
  }
}

createCrosswalk(-14);
createCrosswalk(35);


/* =====================================================
   BUILDING MATERIALS
===================================================== */

const buildingColors = [
  0x36414d,
  0x4a5661,
  0x606b74,
  0x2f3740,
  0x786f68,
  0x424c58,
  0x59636e
];

const windowMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x89c7ff,
    emissive: 0x18354d,
    emissiveIntensity: 0.45,
    roughness: 0.25,
    metalness: 0.35
  });


/* =====================================================
   BUILDING WINDOWS
===================================================== */

function createBuildingWindows(
  building,
  width,
  height,
  depth,
  faces = ["front"]
) {
  const floors =
    Math.max(
      2,
      Math.floor(height / 2.4)
    );

  const windowsPerFloor =
    Math.max(
      2,
      Math.floor(width / 1.8)
    );

  const windowWidth = 0.68;
  const windowHeight = 0.8;

  if (faces.includes("front")) {
    for (
      let floor = 1;
      floor < floors;
      floor += 1
    ) {
      for (
        let column = 0;
        column < windowsPerFloor;
        column += 1
      ) {
        const windowMesh =
          new THREE.Mesh(
            new THREE.PlaneGeometry(
              windowWidth,
              windowHeight
            ),
            windowMaterial
          );

        const spacing =
          width / windowsPerFloor;

        windowMesh.position.set(
          building.position.x -
            width / 2 +
            spacing / 2 +
            column * spacing,

          floor * 2.1,

          building.position.z -
            depth / 2 -
            0.011
        );

        windowMesh.rotation.y =
          Math.PI;

        cityGroup.add(
          windowMesh
        );
      }
    }
  }

  if (faces.includes("back")) {
    for (
      let floor = 1;
      floor < floors;
      floor += 1
    ) {
      for (
        let column = 0;
        column < windowsPerFloor;
        column += 1
      ) {
        const windowMesh =
          new THREE.Mesh(
            new THREE.PlaneGeometry(
              windowWidth,
              windowHeight
            ),
            windowMaterial
          );

        const spacing =
          width / windowsPerFloor;

        windowMesh.position.set(
          building.position.x -
            width / 2 +
            spacing / 2 +
            column * spacing,

          floor * 2.1,

          building.position.z +
            depth / 2 +
            0.011
        );

        cityGroup.add(
          windowMesh
        );
      }
    }
  }
}


/* =====================================================
   CREATE BUILDING
===================================================== */

function createBuilding(
  x,
  z,
  width,
  height,
  depth
) {
  const color =
    buildingColors[
      Math.floor(
        Math.random() *
        buildingColors.length
      )
    ];

  const material =
    new THREE.MeshStandardMaterial({
      color,
      roughness: 0.78,
      metalness: 0.08
    });

  const building =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        width,
        height,
        depth
      ),
      material
    );

  building.position.set(
    x,
    height / 2 + 0.25,
    z
  );

  building.castShadow = true;
  building.receiveShadow = true;

  cityGroup.add(
    building
  );

  createBuildingWindows(
    building,
    width,
    height,
    depth,
    ["front", "back"]
  );

  return building;
}


/* =====================================================
   BUILDING ROOFTOPS
===================================================== */

function createRoofEquipment(
  x,
  y,
  z
) {
  const material =
    new THREE.MeshStandardMaterial({
      color: 0x30353a,
      roughness: 0.75,
      metalness: 0.3
    });

  const unit =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        1.8,
        0.8,
        1.4
      ),
      material
    );

  unit.position.set(
    x,
    y,
    z
  );

  unit.castShadow = true;

  cityGroup.add(
    unit
  );
}


/* =====================================================
   GENERATE CITY BUILDINGS
===================================================== */

function generateBuildings() {
  const spacing = 13;

  for (
    let z = -100;
    z <= 100;
    z += spacing
  ) {
    const leftHeight =
      10 + Math.random() * 24;

    const rightHeight =
      10 + Math.random() * 24;

    const leftWidth =
      8 + Math.random() * 4;

    const rightWidth =
      8 + Math.random() * 4;

    const leftBuilding =
      createBuilding(
        -19,
        z,
        leftWidth,
        leftHeight,
        9
      );

    const rightBuilding =
      createBuilding(
        19,
        z,
        rightWidth,
        rightHeight,
        9
      );

    createRoofEquipment(
      leftBuilding.position.x,
      leftHeight + 0.8,
      leftBuilding.position.z
    );

    createRoofEquipment(
      rightBuilding.position.x,
      rightHeight + 0.8,
      rightBuilding.position.z
    );
  }
}

generateBuildings();


/* =====================================================
   DISTANT TOWERS
===================================================== */

function createTower(
  x,
  z,
  width,
  height
) {
  const material =
    new THREE.MeshStandardMaterial({
      color: 0x596b7c,
      roughness: 0.5,
      metalness: 0.25
    });

  const tower =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        width,
        height,
        width
      ),
      material
    );

  tower.position.set(
    x,
    height / 2,
    z
  );

  tower.castShadow = true;
  tower.receiveShadow = true;

  cityGroup.add(
    tower
  );
}

createTower(-30, -90, 12, 48);
createTower(-12, -110, 14, 62);
createTower(10, -115, 15, 72);
createTower(30, -95, 12, 52);


/* =====================================================
   STREET LIGHTS
===================================================== */

const lampPostMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x202328,
    roughness: 0.55,
    metalness: 0.75
  });

const lampBulbMaterial =
  new THREE.MeshStandardMaterial({
    color: 0xffe9b0,
    emissive: 0xffc85a,
    emissiveIntensity: 2.4
  });

function createStreetLight(
  x,
  z
) {
  const lampGroup =
    new THREE.Group();

  const pole =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.08,
        0.12,
        4.7,
        10
      ),
      lampPostMaterial
    );

  pole.position.y = 2.35;
  pole.castShadow = true;

  lampGroup.add(
    pole
  );

  const arm =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.85,
        0.08,
        0.08
      ),
      lampPostMaterial
    );

  arm.position.set(
    x < 0 ? 0.38 : -0.38,
    4.6,
    0
  );

  lampGroup.add(
    arm
  );

  const lamp =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.18,
        12,
        12
      ),
      lampBulbMaterial
    );

  lamp.position.set(
    x < 0 ? 0.78 : -0.78,
    4.53,
    0
  );

  lampGroup.add(
    lamp
  );

  lampGroup.position.set(
    x,
    0.25,
    z
  );

  cityGroup.add(
    lampGroup
  );
}

for (
  let z = -90;
  z <= 90;
  z += 16
) {
  createStreetLight(
    -8.7,
    z
  );

  createStreetLight(
    8.7,
    z
  );
}


/* =====================================================
   TREES
===================================================== */

const trunkMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x5b3b24,
    roughness: 1
  });

const leafMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x286b35,
    roughness: 0.92
  });

function createTree(
  x,
  z
) {
  const treeGroup =
    new THREE.Group();

  const trunk =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.18,
        0.25,
        1.9,
        10
      ),
      trunkMaterial
    );

  trunk.position.y = 0.95;
  trunk.castShadow = true;

  treeGroup.add(
    trunk
  );

  const leaves =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        1,
        14,
        12
      ),
      leafMaterial
    );

  leaves.position.y = 2.45;

  leaves.scale.set(
    1,
    1.25,
    1
  );

  leaves.castShadow = true;

  treeGroup.add(
    leaves
  );

  treeGroup.position.set(
    x,
    0.25,
    z
  );

  cityGroup.add(
    treeGroup
  );
}

for (
  let z = -90;
  z <= 90;
  z += 14
) {
  createTree(
    -11.2,
    z + 4
  );

  createTree(
    11.2,
    z - 3
  );
}


/* =====================================================
   BENCHES
===================================================== */

const benchMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x5a3823,
    roughness: 0.85
  });

const benchMetalMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x25282c,
    roughness: 0.55,
    metalness: 0.7
  });

function createBench(
  x,
  z,
  rotationY
) {
  const benchGroup =
    new THREE.Group();

  const seat =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        2,
        0.18,
        0.55
      ),
      benchMaterial
    );

  seat.position.y = 0.65;
  seat.castShadow = true;

  benchGroup.add(
    seat
  );

  const back =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        2,
        0.7,
        0.14
      ),
      benchMaterial
    );

  back.position.set(
    0,
    1,
    0.22
  );

  back.castShadow = true;

  benchGroup.add(
    back
  );

  const legLeft =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.12,
        0.65,
        0.45
      ),
      benchMetalMaterial
    );

  legLeft.position.set(
    -0.7,
    0.32,
    0
  );

  benchGroup.add(
    legLeft
  );

  const legRight =
    legLeft.clone();

  legRight.position.x = 0.7;

  benchGroup.add(
    legRight
  );

  benchGroup.position.set(
    x,
    0.25,
    z
  );

  benchGroup.rotation.y =
    rotationY;

  cityGroup.add(
    benchGroup
  );
}

createBench(-12, 8, Math.PI / 2);
createBench(12, 22, -Math.PI / 2);
createBench(-12, -35, Math.PI / 2);
createBench(12, -52, -Math.PI / 2);


/* =====================================================
   TRASH BINS
===================================================== */

function createTrashBin(
  x,
  z
) {
  const material =
    new THREE.MeshStandardMaterial({
      color: 0x285d3a,
      roughness: 0.75,
      metalness: 0.25
    });

  const bin =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.35,
        0.4,
        1,
        14
      ),
      material
    );

  bin.position.set(
    x,
    0.75,
    z
  );

  bin.castShadow = true;

  cityGroup.add(
    bin
  );
}

createTrashBin(-10.8, 15);
createTrashBin(10.8, -18);
createTrashBin(-10.8, -50);
createTrashBin(10.8, 55);


/* =====================================================
   PARKED CARS
===================================================== */

function createSimpleCar(
  x,
  z,
  color,
  rotationY
) {
  const carGroup =
    new THREE.Group();

  const bodyMaterial =
    new THREE.MeshStandardMaterial({
      color,
      roughness: 0.45,
      metalness: 0.4
    });

  const body =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        1.8,
        0.6,
        3.6
      ),
      bodyMaterial
    );

  body.position.y = 0.65;
  body.castShadow = true;

  carGroup.add(
    body
  );

  const roof =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        1.45,
        0.55,
        1.8
      ),
      bodyMaterial
    );

  roof.position.set(
    0,
    1.2,
    -0.2
  );

  roof.castShadow = true;

  carGroup.add(
    roof
  );

  const wheelMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.9
    });

  const wheelPositions = [
    [-0.92, 0.38, 1.1],
    [0.92, 0.38, 1.1],
    [-0.92, 0.38, -1.1],
    [0.92, 0.38, -1.1]
  ];

  wheelPositions.forEach(
    ([wheelX, wheelY, wheelZ]) => {
      const wheel =
        new THREE.Mesh(
          new THREE.CylinderGeometry(
            0.32,
            0.32,
            0.2,
            14
          ),
          wheelMaterial
        );

      wheel.rotation.z =
        Math.PI / 2;

      wheel.position.set(
        wheelX,
        wheelY,
        wheelZ
      );

      wheel.castShadow = true;

      carGroup.add(
        wheel
      );
    }
  );

  carGroup.position.set(
    x,
    0.02,
    z
  );

  carGroup.rotation.y =
    rotationY;

  cityGroup.add(
    carGroup
  );
}

createSimpleCar(-6.2, 28, 0x1e5aa8, 0);
createSimpleCar(6.2, -28, 0x9b2525, Math.PI);
createSimpleCar(-6.2, -65, 0x383838, 0);
createSimpleCar(6.2, 68, 0xb0b0b0, Math.PI);


/* =====================================================
   LOADERS AND GLOBAL VARIABLES
===================================================== */

const fbxLoader =
  new FBXLoader();

const clock =
  new THREE.Clock();

let character = null;
let mixer = null;
let currentAction = null;

const actions = {};
const keys = {};


/* =====================================================
   CAMERA FOLLOW VARIABLES
===================================================== */

const previousCharacterPosition =
  new THREE.Vector3();

const characterMovementOffset =
  new THREE.Vector3();

const cameraTargetPosition =
  new THREE.Vector3();

let cameraFollowReady = false;


/* =====================================================
   MOVEMENT SETTINGS
===================================================== */

const movementSpeed = 2.7;
const rotationSpeed = 2.3;


/* =====================================================
   FILE PATHS
===================================================== */

const characterFile =
  "./models/character_optimized.fbx";

const animationFiles = {
  idle: "./models/Idle.fbx",
  walking: "./models/Walking.fbx",
  talking: "./models/Talking.fbx",
  pointing: "./models/Pointing.fbx",
  waving: "./models/Waving.fbx"
};

const loopingAnimations =
  new Set([
    "idle",
    "walking",
    "talking"
  ]);


/* =====================================================
   LOADING SCREEN HELPERS
===================================================== */

function updateLoadingText(message) {
  if (loadingText) {
    loadingText.textContent =
      message;
  }
}

function hideLoadingScreen() {
  if (loadingScreen) {
    loadingScreen.style.display =
      "none";
  }
}

function showLoadingError(message) {
  console.error(message);

  updateLoadingText(
    message
  );

  if (loadingScreen) {
    loadingScreen.style.display =
      "flex";
  }
}


/* =====================================================
   PREPARE CHARACTER
===================================================== */

function prepareCharacter(model) {
  model.traverse((object) => {
    if (
      !object.isMesh &&
      !object.isSkinnedMesh
    ) {
      return;
    }

    object.castShadow = true;
    object.receiveShadow = true;
    object.frustumCulled = false;

    if (!object.material) {
      return;
    }

    const materials =
      Array.isArray(object.material)
        ? object.material
        : [object.material];

    materials.forEach((material) => {
      if (material.map) {
        material.map.colorSpace =
          THREE.SRGBColorSpace;

        material.map.needsUpdate =
          true;
      }

      material.needsUpdate =
        true;
    });
  });
}


/* =====================================================
   SCALE AND POSITION CHARACTER
===================================================== */

function fitCharacterToScene(model) {
  model.updateMatrixWorld(true);

  const originalBox =
    new THREE.Box3().setFromObject(
      model
    );

  const originalSize =
    new THREE.Vector3();

  originalBox.getSize(
    originalSize
  );

  const desiredHeight = 2.8;

  if (
    Number.isFinite(originalSize.y) &&
    originalSize.y > 0
  ) {
    const scale =
      desiredHeight /
      originalSize.y;

    model.scale.multiplyScalar(
      scale
    );
  }

  model.updateMatrixWorld(true);

  const scaledBox =
    new THREE.Box3().setFromObject(
      model
    );

  const center =
    new THREE.Vector3();

  scaledBox.getCenter(
    center
  );

  model.position.x -= center.x;
  model.position.z -= center.z;
  model.position.y -= scaledBox.min.y;

  model.updateMatrixWorld(true);
}


/* =====================================================
   CLEAN ANIMATION CLIP
===================================================== */

function cleanAnimationClip(clip) {
  clip.tracks =
    clip.tracks.filter((track) => {
      const trackName =
        track.name.toLowerCase();

      return !trackName.endsWith(
        ".scale"
      );
    });

  return clip;
}


/* =====================================================
   LOAD ANIMATION
===================================================== */

function loadFBXAnimation(
  name,
  path
) {
  return new Promise(
    (resolve, reject) => {
      fbxLoader.load(
        path,

        (animationFBX) => {
          if (
            !animationFBX.animations ||
            animationFBX.animations.length === 0
          ) {
            reject(
              new Error(
                `No animation was found in ${path}`
              )
            );

            return;
          }

          let clip =
            animationFBX.animations[0];

          clip =
            cleanAnimationClip(
              clip
            );

          clip.name = name;

          const action =
            mixer.clipAction(
              clip
            );

          action.enabled = true;

          if (
            loopingAnimations.has(
              name
            )
          ) {
            action.setLoop(
              THREE.LoopRepeat,
              Infinity
            );

            action.clampWhenFinished =
              false;
          } else {
            action.setLoop(
              THREE.LoopOnce,
              1
            );

            action.clampWhenFinished =
              true;
          }

          actions[name] =
            action;

          resolve(
            action
          );
        },

        undefined,

        (error) => {
          reject(
            new Error(
              `Failed to load ${name} animation: ${
                error?.message ||
                "Unknown error"
              }`
            )
          );
        }
      );
    }
  );
}


/* =====================================================
   ANIMATION TIMEOUT
===================================================== */

function loadAnimationWithTimeout(
  name,
  path,
  timeout = 30000
) {
  return new Promise(
    (resolve, reject) => {
      let completed = false;

      const timer =
        setTimeout(() => {
          if (completed) {
            return;
          }

          completed = true;

          reject(
            new Error(
              `${name} animation timed out after ${timeout}ms`
            )
          );
        }, timeout);

      loadFBXAnimation(
        name,
        path
      )
        .then((action) => {
          if (completed) {
            return;
          }

          completed = true;

          clearTimeout(
            timer
          );

          resolve(
            action
          );
        })
        .catch((error) => {
          if (completed) {
            return;
          }

          completed = true;

          clearTimeout(
            timer
          );

          reject(
            error
          );
        });
    }
  );
}


/* =====================================================
   LOAD CHARACTER
===================================================== */

function loadCharacter() {
  updateLoadingText(
    "Loading character model..."
  );

  const cacheBustedPath =
    `${characterFile}?v=${Date.now()}`;

  console.log(
    "Loading character:",
    cacheBustedPath
  );

  const characterTimeout =
    setTimeout(() => {
      showLoadingError(
        "Character loading is taking too long. Check the file path and browser console."
      );
    }, 90000);

  fbxLoader.load(
    cacheBustedPath,

    async (fbx) => {
      clearTimeout(
        characterTimeout
      );

      try {
        console.log(
          "Character FBX loaded successfully.",
          fbx
        );

        character = fbx;

        character.position.set(
          0,
          0,
          0
        );

        character.rotation.set(
          0,
          0,
          0
        );

        prepareCharacter(
          character
        );

        fitCharacterToScene(
          character
        );

        character.position.y +=
          0.02;

        scene.add(
          character
        );

        mixer =
          new THREE.AnimationMixer(
            character
          );

        mixer.addEventListener(
          "finished",
          handleFinishedAnimation
        );

        previousCharacterPosition.copy(
          character.position
        );

        cameraTargetPosition.set(
          character.position.x,
          character.position.y + 1.4,
          character.position.z
        );

        controls.target.copy(
          cameraTargetPosition
        );

        cameraFollowReady = true;

        hideLoadingScreen();

        await loadAllAnimations();

        if (actions.idle) {
          playAnimation(
            "idle"
          );
        }
      } catch (error) {
        console.error(
          "Character setup failed:",
          error
        );

        showLoadingError(
          "Character loaded, but setup failed."
        );
      }
    },

    (progress) => {
      if (
        progress.lengthComputable &&
        progress.total > 0
      ) {
        const percent =
          Math.round(
            (
              progress.loaded /
              progress.total
            ) * 100
          );

        updateLoadingText(
          `Loading character: ${percent}%`
        );
      } else {
        const loadedMB =
          (
            progress.loaded /
            1024 /
            1024
          ).toFixed(1);

        updateLoadingText(
          `Loading character: ${loadedMB} MB`
        );
      }
    },

    (error) => {
      clearTimeout(
        characterTimeout
      );

      console.error(
        "Character FBX loading failed:",
        error
      );

      showLoadingError(
        "Failed to load character_optimized.fbx"
      );
    }
  );
}


/* =====================================================
   LOAD ALL ANIMATIONS
===================================================== */

async function loadAllAnimations() {
  const animationEntries =
    Object.entries(
      animationFiles
    );

  for (
    const [name, path]
    of animationEntries
  ) {
    try {
      console.log(
        `Loading ${name} animation:`,
        path
      );

      await loadAnimationWithTimeout(
        name,
        path,
        30000
      );

      console.log(
        `${name} animation loaded successfully.`
      );

      if (
        name === "idle" &&
        actions.idle &&
        !currentAction
      ) {
        playAnimation(
          "idle"
        );
      }
    } catch (error) {
      console.error(
        `Unable to load ${name} animation:`,
        error
      );
    }
  }
}


/* =====================================================
   PLAY ANIMATION
===================================================== */

function playAnimation(name) {
  const nextAction =
    actions[name];

  if (!nextAction) {
    console.warn(
      `Animation "${name}" is not loaded.`
    );

    return;
  }

  if (
    currentAction === nextAction &&
    nextAction.isRunning()
  ) {
    return;
  }

  if (currentAction) {
    currentAction.fadeOut(
      0.25
    );
  }

  nextAction
    .reset()
    .setEffectiveTimeScale(1)
    .setEffectiveWeight(1)
    .fadeIn(0.25)
    .play();

  currentAction =
    nextAction;

  document
    .querySelectorAll(
      "[data-animation]"
    )
    .forEach((button) => {
      button.classList.toggle(
        "active",
        button.dataset.animation ===
          name
      );
    });
}


/* =====================================================
   FINISHED ANIMATIONS
===================================================== */

function handleFinishedAnimation(
  event
) {
  const finishedAction =
    event.action;

  if (
    finishedAction ===
      actions.pointing ||
    finishedAction ===
      actions.waving
  ) {
    playAnimation(
      "idle"
    );
  }
}


/* =====================================================
   CAMERA FOLLOW
===================================================== */

function updateCameraFollow() {
  if (
    !character ||
    !cameraFollowReady
  ) {
    return;
  }

  characterMovementOffset.subVectors(
    character.position,
    previousCharacterPosition
  );

  camera.position.add(
    characterMovementOffset
  );

  cameraTargetPosition.set(
    character.position.x,
    character.position.y + 1.4,
    character.position.z
  );

  controls.target.lerp(
    cameraTargetPosition,
    0.18
  );

  previousCharacterPosition.copy(
    character.position
  );
}


/* =====================================================
   CHARACTER MOVEMENT
===================================================== */

function updateCharacterMovement(
  delta
) {
  if (!character) {
    return;
  }

  const movingForward =
    keys.KeyW ||
    keys.ArrowUp;

  const movingBackward =
    keys.KeyS ||
    keys.ArrowDown;

  const turningLeft =
    keys.KeyA ||
    keys.ArrowLeft;

  const turningRight =
    keys.KeyD ||
    keys.ArrowRight;

  if (turningLeft) {
    character.rotation.y +=
      rotationSpeed *
      delta;
  }

  if (turningRight) {
    character.rotation.y -=
      rotationSpeed *
      delta;
  }

  let movementDirection = 0;

  if (movingForward) {
    movementDirection = 1;
  }

  if (movingBackward) {
    movementDirection = -1;
  }

  if (
    movementDirection !== 0
  ) {
    const direction =
      new THREE.Vector3(
        0,
        0,
        movementDirection
      );

    direction.applyQuaternion(
      character.quaternion
    );

    direction.y = 0;

    direction.normalize();

    character.position.addScaledVector(
      direction,
      movementSpeed *
        delta
    );

    if (actions.walking) {
      playAnimation(
        "walking"
      );
    }
  } else if (
    currentAction ===
      actions.walking
  ) {
    if (actions.idle) {
      playAnimation(
        "idle"
      );
    }
  }

  updateCameraFollow();
}


/* =====================================================
   KEYBOARD CONTROLS
===================================================== */

window.addEventListener(
  "keydown",
  (event) => {
    keys[event.code] =
      true;

    if (
      event.code.startsWith(
        "Arrow"
      )
    ) {
      event.preventDefault();
    }
  }
);

window.addEventListener(
  "keyup",
  (event) => {
    keys[event.code] =
      false;
  }
);


/* =====================================================
   ANIMATION BUTTONS
===================================================== */

document
  .querySelectorAll(
    "[data-animation]"
  )
  .forEach((button) => {
    button.addEventListener(
      "click",
      () => {
        const animationName =
          button.dataset.animation;

        playAnimation(
          animationName
        );
      }
    );
  });


/* =====================================================
   WINDOW RESIZE
===================================================== */

window.addEventListener(
  "resize",
  () => {
    camera.aspect =
      window.innerWidth /
      window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );

    renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio,
        2
      )
    );
  }
);


/* =====================================================
   ANIMATION LOOP
===================================================== */

function animate() {
  requestAnimationFrame(
    animate
  );

  const delta =
    Math.min(
      clock.getDelta(),
      0.05
    );

  if (mixer) {
    mixer.update(
      delta
    );
  }

  updateCharacterMovement(
    delta
  );

  controls.update();

  renderer.render(
    scene,
    camera
  );
}


/* =====================================================
   START APPLICATION
===================================================== */

loadCharacter();

animate();
