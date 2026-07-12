import * as THREE from "three";

import { GLTFLoader } from
  "three/addons/loaders/GLTFLoader.js";

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
  new THREE.Color(0x87bde8);

scene.fog =
  new THREE.Fog(0x87bde8, 20, 80);


/* =====================================================
   CAMERA
===================================================== */

const camera = new THREE.PerspectiveCamera(
  55,
  window.innerWidth / window.innerHeight,
  0.1,
  200
);

camera.position.set(0, 3.5, 7);


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
  Math.min(window.devicePixelRatio, 2)
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
controls.maxDistance = 12;

controls.maxPolarAngle =
  Math.PI / 2.05;

controls.target.set(0, 1.5, 0);


/* =====================================================
   LIGHTS
===================================================== */

const hemisphereLight =
  new THREE.HemisphereLight(
    0xffffff,
    0x445566,
    2.3
  );

scene.add(hemisphereLight);


const directionalLight =
  new THREE.DirectionalLight(
    0xffffff,
    3
  );

directionalLight.position.set(
  5,
  10,
  7
);

directionalLight.castShadow = true;

directionalLight.shadow.mapSize.set(
  2048,
  2048
);

directionalLight.shadow.camera.left = -15;
directionalLight.shadow.camera.right = 15;
directionalLight.shadow.camera.top = 15;
directionalLight.shadow.camera.bottom = -15;

scene.add(directionalLight);


/* =====================================================
   GROUND
===================================================== */

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 100),

  new THREE.MeshStandardMaterial({
    color: 0x3b8b43,
    roughness: 0.9
  })
);

ground.rotation.x =
  -Math.PI / 2;

ground.receiveShadow = true;

scene.add(ground);


/* =====================================================
   GRID
===================================================== */

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


/* =====================================================
   LOADERS AND GLOBAL VARIABLES
===================================================== */

const gltfLoader =
  new GLTFLoader();

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
   MOVEMENT SETTINGS
===================================================== */

const movementSpeed = 2.7;
const rotationSpeed = 2.3;


/* =====================================================
   ANIMATION FILES
===================================================== */

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


/* =====================================================
   PREPARE CHARACTER
===================================================== */

function prepareCharacter(model) {
  model.traverse((object) => {
    if (!object.isMesh) return;

    object.castShadow = true;
    object.receiveShadow = true;

    /*
     * Prevent animated body parts from disappearing
     * because of incorrect bounding-box calculations.
     */
    object.frustumCulled = false;

    if (!object.material) return;

    const materials =
      Array.isArray(object.material)
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


/* =====================================================
   SCALE AND POSITION CHARACTER
===================================================== */

function fitCharacterToScene(model) {
  model.updateMatrixWorld(true);

  const box =
    new THREE.Box3().setFromObject(model);

  const size =
    new THREE.Vector3();

  box.getSize(size);

  const desiredHeight = 2.8;

  if (size.y > 0) {
    const scale =
      desiredHeight / size.y;

    model.scale.setScalar(scale);
  }

  model.updateMatrixWorld(true);

  const scaledBox =
    new THREE.Box3().setFromObject(model);

  const center =
    new THREE.Vector3();

  scaledBox.getCenter(center);

  /*
   * Center the model horizontally.
   */
  model.position.x -= center.x;
  model.position.z -= center.z;

  /*
   * Place the character's feet on the ground.
   */
  model.position.y -= scaledBox.min.y;
}


/* =====================================================
   CLEAN FBX ANIMATION TRACKS
===================================================== */

function cleanAnimationClip(clip) {
  /*
   * FBX animation files sometimes contain position
   * and scale tracks that deform or separate the model.
   *
   * This keeps bone rotations and the hips movement,
   * but removes unnecessary scale tracks.
   */

  clip.tracks = clip.tracks.filter((track) => {
    const trackName =
      track.name.toLowerCase();

    /*
     * Remove animation scale tracks because they can
     * stretch or separate body parts.
     */
    if (trackName.endsWith(".scale")) {
      return false;
    }

    return true;
  });

  return clip;
}


/* =====================================================
   LOAD FBX ANIMATION
===================================================== */

function loadFBXAnimation(name, path) {
  return new Promise((resolve, reject) => {
    fbxLoader.load(
      path,

      (fbx) => {
        if (
          !fbx.animations ||
          fbx.animations.length === 0
        ) {
          reject(
            new Error(
              `No animation found in ${path}`
            )
          );

          return;
        }

        let clip = fbx.animations[0];

        clip =
          cleanAnimationClip(clip);

        clip.name = name;

        const action =
          mixer.clipAction(clip);

        if (
          loopingAnimations.has(name)
        ) {
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

        action.enabled = true;

        actions[name] = action;

        resolve();
      },

      undefined,

      (error) => {
        console.error(
          `Failed to load ${name}:`,
          error
        );

        reject(error);
      }
    );
  });
}


/* =====================================================
   LOAD CHARACTER
===================================================== */

async function loadCharacter() {
  loadingText.textContent =
    "Loading character model...";

  gltfLoader.load(
    "./models/character_optimized.glb",

    async (gltf) => {
      character = gltf.scene;

      /*
       * Important:
       * Do not rotate the character on the X-axis.
       *
       * The previous -Math.PI / 2 rotation was making
       * the standing character lie down.
       */
      character.rotation.set(
        0,
        0,
        0
      );

      character.position.set(
        0,
        0,
        0
      );

      prepareCharacter(character);

      fitCharacterToScene(character);

      scene.add(character);

      mixer =
        new THREE.AnimationMixer(character);

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

          await loadFBXAnimation(
            name,
            path
          );
        }

        playAnimation("idle");

        loadingScreen.style.display =
          "none";
      } catch (error) {
        console.error(
          "Animation loading error:",
          error
        );

        loadingText.textContent =
          "Character loaded, but an animation failed.";

        /*
         * Keep the model visible even when one
         * animation file fails.
         */
        setTimeout(() => {
          loadingScreen.style.display =
            "none";
        }, 2000);
      }
    },

    (progress) => {
      if (!progress.total) {
        loadingText.textContent =
          "Loading character model...";

        return;
      }

      const percentage =
        Math.round(
          (
            progress.loaded /
            progress.total
          ) * 100
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

  /*
   * Fade out the previous animation.
   */
  if (currentAction) {
    currentAction.fadeOut(0.25);
  }

  /*
   * Start the selected animation.
   */
  nextAction
    .reset()
    .setEffectiveTimeScale(1)
    .setEffectiveWeight(1)
    .fadeIn(0.25)
    .play();

  currentAction = nextAction;

  /*
   * Update the active animation button.
   */
  document
    .querySelectorAll("[data-animation]")
    .forEach((button) => {
      button.classList.toggle(
        "active",
        button.dataset.animation === name
      );
    });
}


/* =====================================================
   RETURN TO IDLE AFTER ONE-TIME ANIMATIONS
===================================================== */

function handleFinishedAnimation(event) {
  const finishedAction =
    event.action;

  if (
    finishedAction === actions.pointing ||
    finishedAction === actions.waving
  ) {
    playAnimation("idle");
  }
}


/* =====================================================
   CHARACTER MOVEMENT
===================================================== */

function updateCharacterMovement(delta) {
  if (!character) return;

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


  /*
   * Rotate left and right.
   */
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
    movementDirection = -1;
  }

  if (movingBackward) {
    movementDirection = 1;
  }


  /*
   * Move in the direction the character is facing.
   */
  if (movementDirection !== 0) {
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

    playAnimation("walking");
  } else if (
    currentAction === actions.walking
  ) {
    playAnimation("idle");
  }


  /*
   * Keep camera controls focused on the character.
   */
  const targetPosition =
    new THREE.Vector3(
      character.position.x,
      character.position.y + 1.4,
      character.position.z
    );

  controls.target.lerp(
    targetPosition,
    0.08
  );
}


/* =====================================================
   KEYBOARD CONTROLS
===================================================== */

window.addEventListener(
  "keydown",
  (event) => {
    keys[event.code] = true;

    if (
      event.code.startsWith("Arrow")
    ) {
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


/* =====================================================
   ANIMATION BUTTONS
===================================================== */

document
  .querySelectorAll("[data-animation]")
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
  requestAnimationFrame(animate);

  const delta =
    Math.min(
      clock.getDelta(),
      0.05
    );

  if (mixer) {
    mixer.update(delta);
  }

  updateCharacterMovement(delta);

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
