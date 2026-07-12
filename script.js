import * as THREE from "three";

import { GLTFLoader } from
  "three/addons/loaders/GLTFLoader.js";

import { FBXLoader } from
  "three/addons/loaders/FBXLoader.js";

import { OrbitControls } from
  "three/addons/controls/OrbitControls.js";

const container = document.getElementById("gameContainer");
const loadingScreen = document.getElementById("loadingScreen");
const loadingText = document.getElementById("loadingText");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87bde8);
scene.fog = new THREE.Fog(0x87bde8, 20, 80);

const camera = new THREE.PerspectiveCamera(
  55,
  window.innerWidth / window.innerHeight,
  0.1,
  200
);

camera.position.set(0, 3.5, 7);

const renderer = new THREE.WebGLRenderer({
  antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(
  Math.min(window.devicePixelRatio, 2)
);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

container.appendChild(renderer.domElement);

const controls = new OrbitControls(
  camera,
  renderer.domElement
);

controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 3;
controls.maxDistance = 12;
controls.maxPolarAngle = Math.PI / 2.05;
controls.target.set(0, 1.5, 0);

const hemisphereLight = new THREE.HemisphereLight(
  0xffffff,
  0x445566,
  2.3
);

scene.add(hemisphereLight);

const directionalLight = new THREE.DirectionalLight(
  0xffffff,
  3
);

directionalLight.position.set(5, 10, 7);
directionalLight.castShadow = true;

directionalLight.shadow.mapSize.set(2048, 2048);
directionalLight.shadow.camera.left = -15;
directionalLight.shadow.camera.right = 15;
directionalLight.shadow.camera.top = 15;
directionalLight.shadow.camera.bottom = -15;

scene.add(directionalLight);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 100),
  new THREE.MeshStandardMaterial({
    color: 0x3b8b43,
    roughness: 0.9
  })
);

ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;

scene.add(ground);

const grid = new THREE.GridHelper(
  100,
  100,
  0xffffff,
  0xffffff
);

grid.material.opacity = 0.12;
grid.material.transparent = true;
grid.position.y = 0.01;

scene.add(grid);

const gltfLoader = new GLTFLoader();
const fbxLoader = new FBXLoader();
const clock = new THREE.Clock();

let character = null;
let mixer = null;
let currentAction = null;

const actions = {};
const keys = {};

const movementSpeed = 2.7;
const rotationSpeed = 2.3;

const animationFiles = {
  idle: "./models/Idle.fbx",
  walking: "./models/Walking.fbx",
  talking: "./models/Talking.fbx",
  pointing: "./models/Pointing.fbx",
  waving: "./models/Waving.fbx"
};

const loopingAnimations = new Set([
  "idle",
  "walking",
  "talking"
]);

function loadFBXAnimation(name, path) {
  return new Promise((resolve, reject) => {
    fbxLoader.load(
      path,

      (fbx) => {
        const clip = fbx.animations[0];

        if (!clip) {
          reject(
            new Error(`No animation found in ${path}`)
          );
          return;
        }

        clip.name = name;

        const action = mixer.clipAction(clip);

        if (loopingAnimations.has(name)) {
          action.setLoop(
            THREE.LoopRepeat,
            Infinity
          );

          action.clampWhenFinished = false;
        } else {
          action.setLoop(
            THREE.LoopOnce,
            1
          );

          action.clampWhenFinished = true;
        }

        actions[name] = action;
        resolve();
      },

      undefined,

      (error) => {
        reject(error);
      }
    );
  });
}

function prepareCharacter(model) {
  model.traverse((object) => {
    if (!object.isMesh) return;

    object.castShadow = true;
    object.receiveShadow = true;
    object.frustumCulled = false;

    if (!object.material) return;

    const materials = Array.isArray(object.material)
      ? object.material
      : [object.material];

    materials.forEach((material) => {
      if (material.map) {
        material.map.colorSpace =
          THREE.SRGBColorSpace;
      }

      material.needsUpdate = true;
    });
  });
}

function fitCharacterToScene(model) {
  const box = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();

  box.getSize(size);

  const desiredHeight = 2.8;

  if (size.y > 0) {
    const scale = desiredHeight / size.y;
    model.scale.setScalar(scale);
  }

  const scaledBox =
    new THREE.Box3().setFromObject(model);

  const center = new THREE.Vector3();
  scaledBox.getCenter(center);

  model.position.x -= center.x;
  model.position.z -= center.z;
  model.position.y -= scaledBox.min.y;
}

async function loadCharacter() {
  loadingText.textContent =
    "Loading character model...";

  gltfLoader.load(
    "./models/character_optimized.glb",

    async (gltf) => {
      character = gltf.scene;

      /*
       * Fixes the imported model lying on the ground.
       * If your model becomes upside down, change
       * -Math.PI / 2 to Math.PI / 2.
       */
      character.rotation.x = -Math.PI / 2;

      prepareCharacter(character);
      fitCharacterToScene(character);

      scene.add(character);

      mixer = new THREE.AnimationMixer(character);

      try {
        const animationEntries =
          Object.entries(animationFiles);

        for (
          let index = 0;
          index < animationEntries.length;
          index += 1
        ) {
          const [name, path] =
            animationEntries[index];

          loadingText.textContent =
            `Loading ${name} animation...`;

          await loadFBXAnimation(name, path);
        }

        playAnimation("idle");

        loadingScreen.style.display = "none";
      } catch (error) {
        console.error(
          "Animation loading error:",
          error
        );

        loadingText.textContent =
          "Character loaded, but an animation failed.";

        setTimeout(() => {
          loadingScreen.style.display = "none";
        }, 2000);
      }
    },

    (progress) => {
      if (!progress.total) return;

      const percentage = Math.round(
        (progress.loaded / progress.total) * 100
      );

      loadingText.textContent =
        `Loading character: ${percentage}%`;
    },

    (error) => {
      console.error(
        "Character loading failed:",
        error
      );

      loadingText.textContent =
        "Failed to load character_optimized.glb";
    }
  );
}

function playAnimation(name) {
  const nextAction = actions[name];

  if (!nextAction) {
    console.warn(
      `Animation "${name}" is not loaded.`
    );
    return;
  }

  if (currentAction === nextAction) return;

  if (currentAction) {
    currentAction.fadeOut(0.25);
  }

  nextAction
    .reset()
    .setEffectiveTimeScale(1)
    .setEffectiveWeight(1)
    .fadeIn(0.25)
    .play();

  currentAction = nextAction;

  document
    .querySelectorAll("[data-animation]")
    .forEach((button) => {
      button.classList.toggle(
        "active",
        button.dataset.animation === name
      );
    });
}

function updateCharacterMovement(delta) {
  if (!character) return;

  const movingForward =
    keys.KeyW || keys.ArrowUp;

  const movingBackward =
    keys.KeyS || keys.ArrowDown;

  const turningLeft =
    keys.KeyA || keys.ArrowLeft;

  const turningRight =
    keys.KeyD || keys.ArrowRight;

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

  if (movementDirection !== 0) {
    const direction = new THREE.Vector3(
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

    playAnimation("walking");
  } else if (
    currentAction === actions.walking
  ) {
    playAnimation("idle");
  }

  const targetPosition = new THREE.Vector3(
    character.position.x,
    character.position.y + 1.4,
    character.position.z
  );

  controls.target.lerp(
    targetPosition,
    0.08
  );
}

window.addEventListener(
  "keydown",
  (event) => {
    keys[event.code] = true;

    if (event.code.startsWith("Arrow")) {
      event.preventDefault();
    }
  }
);

window.addEventListener(
  "keyup",
  (event) => {
    keys[event.code] = false;
  }
);

document
  .querySelectorAll("[data-animation]")
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

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(
    clock.getDelta(),
    0.05
  );

  if (mixer) {
    mixer.update(delta);
  }

  updateCharacterMovement(delta);

  controls.update();
  renderer.render(scene, camera);
}

loadCharacter();
animate();
