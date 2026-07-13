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
   SCENE
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

const camera =
  new THREE.PerspectiveCamera(
    55,
    window.innerWidth /
      window.innerHeight,
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

const renderer =
  new THREE.WebGLRenderer({
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

const controls =
  new OrbitControls(
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
   LIGHTING
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

directionalLight.shadow.camera.left =
  -35;

directionalLight.shadow.camera.right =
  35;

directionalLight.shadow.camera.top =
  35;

directionalLight.shadow.camera.bottom =
  -35;

scene.add(
  directionalLight
);


const fillLight =
  new THREE.DirectionalLight(
    0x9ecbff,
    1.1
  );

fillLight.position.set(
  -12,
  10,
  -8
);

scene.add(
  fillLight
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

const road =
  new THREE.Mesh(
    new THREE.PlaneGeometry(
      18,
      220
    ),

    new THREE.MeshStandardMaterial({
      color: 0x25292e,
      roughness: 0.82,
      metalness: 0.08
    })
  );

road.rotation.x =
  -Math.PI / 2;

road.receiveShadow = true;

cityGroup.add(
  road
);


/* =====================================================
   OUTER GROUND
===================================================== */

const outerGroundMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x4d565d,
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
   ROAD MARKINGS
===================================================== */

const yellowLineMaterial =
  new THREE.MeshStandardMaterial({
    color: 0xf2cc35,
    roughness: 0.75
  });

for (
  let z = -105;
  z <= 105;
  z += 6.5
) {
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


const whiteLineMaterial =
  new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.8
  });

function createRoadEdgeLine(x) {
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

createRoadEdgeLine(-7.6);
createRoadEdgeLine(7.6);


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

  sidewalk.castShadow = true;
  sidewalk.receiveShadow = true;

  cityGroup.add(
    sidewalk
  );
}

createSidewalk(-12);
createSidewalk(12);


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
   BUILDINGS
===================================================== */

const buildingColors = [
  0x36414d,
  0x4a5661,
  0x606b74,
  0x2f3740,
  0x786f68,
  0x424c58
];

const windowMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x89c7ff,
    emissive: 0x18354d,
    emissiveIntensity: 0.45,
    roughness: 0.25,
    metalness: 0.35
  });

function createBuilding(
  x,
  z,
  width,
  height,
  depth
) {
  const buildingMaterial =
    new THREE.MeshStandardMaterial({
      color:
        buildingColors[
          Math.floor(
            Math.random() *
            buildingColors.length
          )
        ],
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
      buildingMaterial
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
    depth
  );
}


function createBuildingWindows(
  building,
  width,
  height,
  depth
) {
  const floors =
    Math.max(
      2,
      Math.floor(height / 2.5)
    );

  const columns =
    Math.max(
      2,
      Math.floor(width / 1.8)
    );

  const spacing =
    width / columns;

  for (
    let floor = 1;
    floor < floors;
    floor += 1
  ) {
    for (
      let column = 0;
      column < columns;
      column += 1
    ) {
      const frontWindow =
        new THREE.Mesh(
          new THREE.PlaneGeometry(
            0.68,
            0.8
          ),
          windowMaterial
        );

      frontWindow.position.set(
        building.position.x -
          width / 2 +
          spacing / 2 +
          column * spacing,

        floor * 2.1,

        building.position.z -
          depth / 2 -
          0.011
      );

      frontWindow.rotation.y =
        Math.PI;

      cityGroup.add(
        frontWindow
      );


      const backWindow =
        frontWindow.clone();

      backWindow.position.z =
        building.position.z +
        depth / 2 +
        0.011;

      backWindow.rotation.y = 0;

      cityGroup.add(
        backWindow
      );
    }
  }
}


function generateBuildings() {
  for (
    let z = -100;
    z <= 100;
    z += 13
  ) {
    createBuilding(
      -19,
      z,
      8 + Math.random() * 4,
      10 + Math.random() * 24,
      9
    );

    createBuilding(
      19,
      z,
      8 + Math.random() * 4,
      10 + Math.random() * 24,
      9
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
  const tower =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        width,
        height,
        width
      ),

      new THREE.MeshStandardMaterial({
        color: 0x596b7c,
        roughness: 0.5,
        metalness: 0.25
      })
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


  const bulb =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.18,
        12,
        12
      ),
      lampBulbMaterial
    );

  bulb.position.set(
    x < 0 ? 0.78 : -0.78,
    4.53,
    0
  );

  lampGroup.add(
    bulb
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
  createStreetLight(-8.7, z);
  createStreetLight(8.7, z);
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
  createTree(-11.2, z + 4);
  createTree(11.2, z - 3);
}


/* =====================================================
   SIMPLE PARKED CARS
===================================================== */

function createSimpleCar(
  x,
  z,
  color,
  rotationY
) {
  const car =
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

  car.add(
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

  car.add(
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

      car.add(
        wheel
      );
    }
  );

  car.position.set(
    x,
    0.02,
    z
  );

  car.rotation.y =
    rotationY;

  cityGroup.add(
    car
  );
}

createSimpleCar(
  -6.2,
  28,
  0x1e5aa8,
  0
);

createSimpleCar(
  6.2,
  -28,
  0x9b2525,
  Math.PI
);

createSimpleCar(
  -6.2,
  -65,
  0x383838,
  0
);

createSimpleCar(
  6.2,
  68,
  0xb0b0b0,
  Math.PI
);


/* =====================================================
   WALKING PEDESTRIANS
===================================================== */

const pedestrians = [];

const pedestrianColors = [
  0x2f5fa7,
  0x8b3f3f,
  0x3f7a4a,
  0x7d5a9e,
  0xb06c2e,
  0x444444,
  0x168a8a
];

const pedestrianSkinColors = [
  0xc98f65,
  0xe0ad87,
  0x9d6849,
  0x7c4f37
];


function createPedestrian(
  x,
  z,
  direction = 1,
  speed = 1
) {
  const pedestrian =
    new THREE.Group();

  const skinMaterial =
    new THREE.MeshStandardMaterial({
      color:
        pedestrianSkinColors[
          Math.floor(
            Math.random() *
            pedestrianSkinColors.length
          )
        ],
      roughness: 0.9
    });

  const shirtMaterial =
    new THREE.MeshStandardMaterial({
      color:
        pedestrianColors[
          Math.floor(
            Math.random() *
            pedestrianColors.length
          )
        ],
      roughness: 0.85
    });

  const pantsMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x252a30,
      roughness: 0.9
    });

  const shoeMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x171717,
      roughness: 0.95
    });


  const head =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.18,
        12,
        10
      ),
      skinMaterial
    );

  head.position.y = 1.72;
  head.castShadow = true;

  pedestrian.add(
    head
  );


  const body =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.45,
        0.7,
        0.25
      ),
      shirtMaterial
    );

  body.position.y = 1.2;
  body.castShadow = true;

  pedestrian.add(
    body
  );


  const leftArmPivot =
    new THREE.Group();

  leftArmPivot.position.set(
    -0.3,
    1.48,
    0
  );

  const leftArm =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.12,
        0.65,
        0.12
      ),
      shirtMaterial
    );

  leftArm.position.y = -0.3;
  leftArm.castShadow = true;

  leftArmPivot.add(
    leftArm
  );

  pedestrian.add(
    leftArmPivot
  );


  const rightArmPivot =
    new THREE.Group();

  rightArmPivot.position.set(
    0.3,
    1.48,
    0
  );

  const rightArm =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.12,
        0.65,
        0.12
      ),
      shirtMaterial
    );

  rightArm.position.y = -0.3;
  rightArm.castShadow = true;

  rightArmPivot.add(
    rightArm
  );

  pedestrian.add(
    rightArmPivot
  );


  const leftLegPivot =
    new THREE.Group();

  leftLegPivot.position.set(
    -0.13,
    0.85,
    0
  );

  const leftLeg =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.15,
        0.75,
        0.16
      ),
      pantsMaterial
    );

  leftLeg.position.y = -0.36;
  leftLeg.castShadow = true;

  leftLegPivot.add(
    leftLeg
  );

  const leftShoe =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.18,
        0.12,
        0.32
      ),
      shoeMaterial
    );

  leftShoe.position.set(
    0,
    -0.76,
    0.08
  );

  leftLegPivot.add(
    leftShoe
  );

  pedestrian.add(
    leftLegPivot
  );


  const rightLegPivot =
    new THREE.Group();

  rightLegPivot.position.set(
    0.13,
    0.85,
    0
  );

  const rightLeg =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.15,
        0.75,
        0.16
      ),
      pantsMaterial
    );

  rightLeg.position.y = -0.36;
  rightLeg.castShadow = true;

  rightLegPivot.add(
    rightLeg
  );

  const rightShoe =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.18,
        0.12,
        0.32
      ),
      shoeMaterial
    );

  rightShoe.position.set(
    0,
    -0.76,
    0.08
  );

  rightLegPivot.add(
    rightShoe
  );

  pedestrian.add(
    rightLegPivot
  );


  pedestrian.position.set(
    x,
    0.28,
    z
  );

  pedestrian.rotation.y =
    direction > 0
      ? 0
      : Math.PI;

  pedestrian.userData = {
    direction,
    speed,
    walkTime:
      Math.random() *
      Math.PI *
      2,
    leftArmPivot,
    rightArmPivot,
    leftLegPivot,
    rightLegPivot
  };

  cityGroup.add(
    pedestrian
  );

  pedestrians.push(
    pedestrian
  );
}


createPedestrian(
  -12,
  -70,
  1,
  1.05
);

createPedestrian(
  -12,
  -10,
  -1,
  0.85
);

createPedestrian(
  -11.5,
  55,
  -1,
  1.1
);

createPedestrian(
  12,
  -45,
  1,
  0.9
);

createPedestrian(
  12,
  20,
  -1,
  1.15
);

createPedestrian(
  11.5,
  75,
  -1,
  0.95
);


function updatePedestrians(delta) {
  pedestrians.forEach(
    (pedestrian) => {
      const data =
        pedestrian.userData;

      pedestrian.position.z +=
        data.direction *
        data.speed *
        delta;

      data.walkTime +=
        delta * 7;

      const swing =
        Math.sin(
          data.walkTime
        ) * 0.55;

      data.leftArmPivot.rotation.x =
        swing;

      data.rightArmPivot.rotation.x =
        -swing;

      data.leftLegPivot.rotation.x =
        -swing;

      data.rightLegPivot.rotation.x =
        swing;

      pedestrian.position.y =
        0.28 +
        Math.abs(
          Math.sin(
            data.walkTime
          )
        ) * 0.025;

      if (
        pedestrian.position.z > 102
      ) {
        pedestrian.position.z =
          -102;
      }

      if (
        pedestrian.position.z < -102
      ) {
        pedestrian.position.z =
          102;
      }
    }
  );
}


/* =====================================================
   CHARACTER LOADERS AND VARIABLES
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
   LOADING SCREEN
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
  console.error(
    message
  );

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
      Array.isArray(
        object.material
      )
        ? object.material
        : [object.material];

    materials.forEach(
      (material) => {
        if (material.map) {
          material.map.colorSpace =
            THREE.SRGBColorSpace;

          material.map.needsUpdate =
            true;
        }

        material.needsUpdate =
          true;
      }
    );
  });
}


/* =====================================================
   CHARACTER SIZE AND POSITION
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
    Number.isFinite(
      originalSize.y
    ) &&
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

  model.position.x -=
    center.x;

  model.position.z -=
    center.z;

  model.position.y -=
    scaledBox.min.y;

  model.updateMatrixWorld(true);
}


/* =====================================================
   CLEAN ANIMATION
===================================================== */

function cleanAnimationClip(clip) {
  clip.tracks =
    clip.tracks.filter(
      (track) => {
        const trackName =
          track.name.toLowerCase();

        return !trackName.endsWith(
          ".scale"
        );
      }
    );

  return clip;
}


/* =====================================================
   LOAD FBX ANIMATION
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
            animationFBX.animations
              .length === 0
          ) {
            reject(
              new Error(
                `No animation was found in ${path}`
              )
            );

            return;
          }

          let clip =
            animationFBX
              .animations[0];

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
              `Failed to load ${name}: ${
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
  return Promise.race([
    loadFBXAnimation(
      name,
      path
    ),

    new Promise(
      (_, reject) => {
        setTimeout(() => {
          reject(
            new Error(
              `${name} animation timed out`
            )
          );
        }, timeout);
      }
    )
  ]);
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

  const characterTimeout =
    setTimeout(() => {
      showLoadingError(
        "Character loading is taking too long."
      );
    }, 90000);

  fbxLoader.load(
    cacheBustedPath,

    async (fbx) => {
      clearTimeout(
        characterTimeout
      );

      try {
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
        const percentage =
          Math.round(
            (
              progress.loaded /
              progress.total
            ) * 100
          );

        updateLoadingText(
          `Loading character: ${percentage}%`
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
        "Character loading failed:",
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
      await loadAnimationWithTimeout(
        name,
        path,
        30000
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
        `Unable to load ${name}:`,
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
    return;
  }

  if (
    currentAction ===
      nextAction &&
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
        button.dataset
          .animation === name
      );
    });
}


/* =====================================================
   FINISHED ANIMATIONS
===================================================== */

function handleFinishedAnimation(
  event
) {
  if (
    event.action ===
      actions.pointing ||
    event.action ===
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
      rotationSpeed * delta;
  }

  if (turningRight) {
    character.rotation.y -=
      rotationSpeed * delta;
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
      movementSpeed * delta
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
        playAnimation(
          button.dataset.animation
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

  updatePedestrians(
    delta
  );

  controls.update();

  renderer.render(
    scene,
    camera
  );
}


/* =====================================================
   START
===================================================== */

loadCharacter();

animate();
