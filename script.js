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


const loopingAnimations = new Set([
  "idle",
  "walking",
  "talking"
]);


/* =====================================================
   LOADING SCREEN HELPERS
===================================================== */

function updateLoadingText(message) {
  if (loadingText) {
    loadingText.textContent = message;
  }
}


function hideLoadingScreen() {
  if (loadingScreen) {
    loadingScreen.style.display = "none";
  }
}


function showLoadingError(message) {
  console.error(message);

  updateLoadingText(message);

  if (loadingScreen) {
    loadingScreen.style.display = "flex";
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

    /*
     * Prevent animated body parts from disappearing
     * because of incorrect bounding calculations.
     */
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

        material.map.needsUpdate = true;
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

  const originalBox =
    new THREE.Box3().setFromObject(model);

  const originalSize =
    new THREE.Vector3();

  originalBox.getSize(originalSize);

  const desiredHeight = 2.8;

  if (
    Number.isFinite(originalSize.y) &&
    originalSize.y > 0
  ) {
    const scale =
      desiredHeight / originalSize.y;

    model.scale.multiplyScalar(scale);
  }

  model.updateMatrixWorld(true);

  const scaledBox =
    new THREE.Box3().setFromObject(model);

  const center =
    new THREE.Vector3();

  scaledBox.getCenter(center);

  model.position.x -= center.x;
  model.position.z -= center.z;
  model.position.y -= scaledBox.min.y;

  model.updateMatrixWorld(true);
}


/* =====================================================
   CLEAN ANIMATION CLIP
===================================================== */

function cleanAnimationClip(clip) {
  /*
   * Remove scale animation tracks because different
   * FBX export settings can cause the body to stretch
   * or separate when scale tracks are applied.
   */

  clip.tracks = clip.tracks.filter((track) => {
    const trackName =
      track.name.toLowerCase();

    return !trackName.endsWith(".scale");
  });

  return clip;
}


/* =====================================================
   LOAD ANIMATION
===================================================== */

function loadFBXAnimation(name, path) {
  return new Promise((resolve, reject) => {
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
          cleanAnimationClip(clip);

        clip.name = name;

        const action =
          mixer.clipAction(clip);

        action.enabled = true;

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

        actions[name] = action;

        resolve(action);
      },

      undefined,

      (error) => {
        reject(
          new Error(
            `Failed to load ${name} animation: ${
              error?.message || "Unknown error"
            }`
          )
        );
      }
    );
  });
}


/* =====================================================
   ANIMATION TIMEOUT
===================================================== */

function loadAnimationWithTimeout(
  name,
  path,
  timeout = 30000
) {
  return new Promise((resolve, reject) => {
    let completed = false;

    const timer = setTimeout(() => {
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

    loadFBXAnimation(name, path)
      .then((action) => {
        if (completed) {
          return;
        }

        completed = true;

        clearTimeout(timer);

        resolve(action);
      })
      .catch((error) => {
        if (completed) {
          return;
        }

        completed = true;

        clearTimeout(timer);

        reject(error);
      });
  });
}


/* =====================================================
   LOAD CHARACTER
===================================================== */

function loadCharacter() {
  updateLoadingText(
    "Loading character model..."
  );

  /*
   * Cache-busting query ensures GitHub Pages does not
   * continue serving the previous FBX after deployment.
   */
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
      clearTimeout(characterTimeout);

      try {
        console.log(
          "Character FBX loaded successfully.",
          fbx
        );

        character = fbx;

        /*
         * FBXLoader returns the model directly.
         * Do not use gltf.scene here.
         */
        character.position.set(0, 0, 0);

        /*
         * Keep the imported FBX orientation unchanged.
         */
        character.rotation.set(0, 0, 0);

        prepareCharacter(character);

        fitCharacterToScene(character);

        /*
         * Keep the feet slightly above the ground.
         */
        character.position.y += 0.02;

        scene.add(character);

        mixer =
          new THREE.AnimationMixer(character);

        mixer.addEventListener(
          "finished",
          handleFinishedAnimation
        );

        /*
         * Show the character immediately. Animation
         * loading must not block the whole website.
         */
        hideLoadingScreen();

        await loadAllAnimations();

        if (actions.idle) {
          playAnimation("idle");
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
      clearTimeout(characterTimeout);

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
    Object.entries(animationFiles);

  for (const [name, path] of animationEntries) {
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

      /*
       * Start idle as soon as it is available.
       */
      if (
        name === "idle" &&
        actions.idle &&
        !currentAction
      ) {
        playAnimation("idle");
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

    if (actions.walking) {
      playAnimation("walking");
    }
  } else if (
    currentAction === actions.walking
  ) {
    if (actions.idle) {
      playAnimation("idle");
    }
  }


 /* ==========================================
   CAMERA FOLLOW
========================================== */

const targetPosition = new THREE.Vector3(
  character.position.x,
  character.position.y + 1.4,
  character.position.z
);

// Move the camera target smoothly
controls.target.lerp(targetPosition, 0.15);

// Keep the same camera offset while following
const cameraOffset = new THREE.Vector3(0, 3.5, 7);

// Rotate the offset with the character so the camera stays behind
cameraOffset.applyAxisAngle(
  new THREE.Vector3(0, 1, 0),
  character.rotation.y
);

const desiredCameraPosition = new THREE.Vector3(
  character.position.x,
  character.position.y,
  character.position.z
).add(cameraOffset);

// Smooth camera movement
camera.position.lerp(desiredCameraPosition, 0.15);


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
   START APPLICATION
===================================================== */

loadCharacter();

animate();
