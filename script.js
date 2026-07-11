import * as THREE from "three";

import { GLTFLoader } from
  "three/addons/loaders/GLTFLoader.js";

import { FBXLoader } from
  "three/addons/loaders/FBXLoader.js";

console.log("script.js loaded successfully");

/* --------------------------------------------------
   HTML elements
-------------------------------------------------- */

const container =
  document.getElementById("characterContainer");

const modelLoader =
  document.getElementById("modelLoader");

const signupCard =
  document.getElementById("signupCard");

const signupForm =
  document.getElementById("signupForm");

const fullNameInput =
  document.getElementById("fullName");

const usernameInput =
  document.getElementById("username");

const emailInput =
  document.getElementById("email");

const nextButton =
  document.getElementById("nextButton");

const formMessage =
  document.getElementById("formMessage");

/* --------------------------------------------------
   File paths
-------------------------------------------------- */

const MODEL_PATH =
  "./models/character_optimized.glb";

const ANIMATION_FILES = {
  idle: "./models/Idle.fbx",
  walking: "./models/Walking.fbx",
  talking: "./models/Talking.fbx",
  pointing: "./models/Pointing.fbx",
  waving: "./models/Waving.fbx"
};

/* --------------------------------------------------
   Three.js scene
-------------------------------------------------- */

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  40,
  window.innerWidth / window.innerHeight,
  0.01,
  1000
);

camera.position.set(0, 1, 8);
camera.lookAt(0, 0.7, 0);

/* --------------------------------------------------
   Renderer
-------------------------------------------------- */

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
  powerPreference: "high-performance"
});

renderer.setPixelRatio(
  Math.min(window.devicePixelRatio, 2)
);

renderer.setSize(
  window.innerWidth,
  window.innerHeight
);

renderer.outputColorSpace =
  THREE.SRGBColorSpace;

renderer.shadowMap.enabled = true;

renderer.shadowMap.type =
  THREE.PCFSoftShadowMap;

renderer.setClearColor(0x000000, 0);

container.appendChild(renderer.domElement);

/* --------------------------------------------------
   Lighting
-------------------------------------------------- */

const hemisphereLight =
  new THREE.HemisphereLight(
    0xffffff,
    0x25304a,
    2.8
  );

scene.add(hemisphereLight);

const frontLight =
  new THREE.DirectionalLight(
    0xffffff,
    3.5
  );

frontLight.position.set(2, 6, 7);
frontLight.castShadow = true;

scene.add(frontLight);

const warmLight =
  new THREE.PointLight(
    0xff9c67,
    30,
    20
  );

warmLight.position.set(4, 3, 4);

scene.add(warmLight);

const blueLight =
  new THREE.PointLight(
    0x568bff,
    24,
    18
  );

blueLight.position.set(-5, 2, 3);

scene.add(blueLight);

/* --------------------------------------------------
   Floor shadow
-------------------------------------------------- */

const floorGeometry =
  new THREE.CircleGeometry(2.4, 64);

const floorMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x151a24,
    transparent: true,
    opacity: 0.42,
    roughness: 0.85
  });

const floor =
  new THREE.Mesh(
    floorGeometry,
    floorMaterial
  );

floor.rotation.x = -Math.PI / 2;
floor.position.set(-1.9, -1.65, 0);
floor.receiveShadow = true;

scene.add(floor);

/* --------------------------------------------------
   Character state
-------------------------------------------------- */

const clock = new THREE.Clock();

let character = null;
let characterRoot = null;
let mixer = null;
let currentAction = null;

let modelHeight = 1;
let introStarted = false;
let formShown = false;

const animationActions = {};

/* --------------------------------------------------
   Utility: update loading message
-------------------------------------------------- */

function updateLoader(message) {
  modelLoader.textContent = message;
  console.log(message);
}

function hideLoader() {
  modelLoader.classList.add("hide");
}

/* --------------------------------------------------
   Load GLB model
-------------------------------------------------- */

const gltfLoader = new GLTFLoader();

updateLoader("Loading character...");

console.log("Loading model from:", MODEL_PATH);

gltfLoader.load(
  MODEL_PATH,

  (gltf) => {
    console.log("GLB loaded successfully:", gltf);

    character = gltf.scene;

    prepareCharacterMaterials(character);

    characterRoot = new THREE.Group();
    characterRoot.name = "CharacterRoot";

    characterRoot.add(character);
    scene.add(characterRoot);

    centerAndScaleCharacter();

    mixer =
      new THREE.AnimationMixer(character);

    /*
      Use animations embedded in the GLB when available.
    */

    if (
      Array.isArray(gltf.animations) &&
      gltf.animations.length > 0
    ) {
      console.log(
        "Embedded GLB animations:",
        gltf.animations.map(
          (clip) => clip.name
        )
      );
    }

    setResponsiveCharacterPosition();

    loadAllFBXAnimations();
  },

  (progress) => {
    if (
      Number.isFinite(progress.total) &&
      progress.total > 0
    ) {
      const percent = Math.round(
        (
          progress.loaded /
          progress.total
        ) * 100
      );

      updateLoader(
        `Loading character ${percent}%`
      );
    }
  },

  (error) => {
    console.error(
      "Character GLB failed to load:",
      error
    );

    updateLoader(
      "Character could not be loaded"
    );

    setTimeout(() => {
      hideLoader();
      showSignupForm();
    }, 1500);
  }
);

/* --------------------------------------------------
   Prepare character materials
-------------------------------------------------- */

function prepareCharacterMaterials(model) {
  model.traverse((object) => {
    if (!object.isMesh) {
      return;
    }

    object.frustumCulled = false;
    object.castShadow = true;
    object.receiveShadow = true;

    const materials =
      Array.isArray(object.material)
        ? object.material
        : [object.material];

    materials.forEach((material) => {
      if (!material) {
        return;
      }

      material.side = THREE.DoubleSide;

      if (material.map) {
        material.map.colorSpace =
          THREE.SRGBColorSpace;
      }

      material.needsUpdate = true;
    });
  });
}

/* --------------------------------------------------
   Center and scale character automatically
-------------------------------------------------- */

function centerAndScaleCharacter() {
  if (!character) {
    return;
  }

  /*
    Reset first so the bounding box is accurate.
  */

  character.position.set(0, 0, 0);
  character.rotation.set(0, 0, 0);
  character.scale.set(1, 1, 1);

  character.updateMatrixWorld(true);

  const originalBox =
    new THREE.Box3().setFromObject(character);

  const originalSize =
    originalBox.getSize(
      new THREE.Vector3()
    );

  const originalCenter =
    originalBox.getCenter(
      new THREE.Vector3()
    );

  console.log(
    "Original character size:",
    originalSize
  );

  console.log(
    "Original character center:",
    originalCenter
  );

  /*
    Move model center to local origin.
  */

  character.position.set(
    -originalCenter.x,
    -originalCenter.y,
    -originalCenter.z
  );

  const safeHeight =
    originalSize.y > 0.0001
      ? originalSize.y
      : Math.max(
          originalSize.x,
          originalSize.z,
          1
        );

  const targetHeight =
    window.innerWidth <= 760
      ? 3.1
      : 4.2;

  const scale =
    targetHeight / safeHeight;

  character.scale.setScalar(scale);

  character.updateMatrixWorld(true);

  /*
    Check the scaled box and move the feet toward y = 0.
  */

  const scaledBox =
    new THREE.Box3().setFromObject(character);

  const scaledSize =
    scaledBox.getSize(
      new THREE.Vector3()
    );

  const scaledCenter =
    scaledBox.getCenter(
      new THREE.Vector3()
    );

  modelHeight = scaledSize.y;

  console.log(
    "Scaled character size:",
    scaledSize
  );

  console.log(
    "Scaled character center:",
    scaledCenter
  );

  character.position.x -= scaledCenter.x;
  character.position.z -= scaledCenter.z;

  character.updateMatrixWorld(true);

  const finalBox =
    new THREE.Box3().setFromObject(character);

  /*
    Move lowest point of the character to local y = 0.
  */

  character.position.y -= finalBox.min.y;

  character.updateMatrixWorld(true);

  /*
    Adjust model direction here when it faces backward.
    Try Math.PI if the character's back faces the camera.
  */

  character.rotation.y = 0;

  console.log(
    "Character centered and scaled"
  );
}

/* --------------------------------------------------
   Responsive character placement
-------------------------------------------------- */

function setResponsiveCharacterPosition() {
  if (!characterRoot) {
    return;
  }

  const isMobile =
    window.innerWidth <= 760;

  if (isMobile) {
    characterRoot.position.set(
      0,
      -1.2,
      0.3
    );

    characterRoot.scale.setScalar(0.86);

    floor.position.set(
      0,
      -1.25,
      0
    );
  } else {
    characterRoot.position.set(
      -1.9,
      -1.65,
      0
    );

    characterRoot.scale.setScalar(1);

    floor.position.set(
      -1.9,
      -1.65,
      0
    );
  }
}

/* --------------------------------------------------
   FBX animations
-------------------------------------------------- */

const fbxLoader = new FBXLoader();

function loadFBXAnimation(
  animationName,
  animationPath
) {
  return new Promise((resolve) => {
    console.log(
      `Loading ${animationName}:`,
      animationPath
    );

    fbxLoader.load(
      animationPath,

      (fbx) => {
        if (
          !fbx.animations ||
          fbx.animations.length === 0
        ) {
          console.warn(
            `${animationName} contains no animation`
          );

          resolve(false);
          return;
        }

        const clip =
          fbx.animations[0];

        clip.name = animationName;

        /*
          Remove position tracks that may cause the
          character to jump far away from the screen.
        */

        clip.tracks = clip.tracks.filter(
          (track) => {
            const trackName =
              track.name.toLowerCase();

            const isRootPosition =
              trackName.endsWith(
                ".position"
              ) &&
              (
                trackName.includes("hips") ||
                trackName.includes("root") ||
                trackName.includes("armature")
              );

            return !isRootPosition;
          }
        );

        const action =
          mixer.clipAction(clip);

        animationActions[animationName] =
          action;

        console.log(
          `${animationName} loaded successfully`
        );

        resolve(true);
      },

      undefined,

      (error) => {
        console.error(
          `${animationName} failed to load:`,
          error
        );

        resolve(false);
      }
    );
  });
}

async function loadAllFBXAnimations() {
  if (!mixer) {
    return;
  }

  updateLoader("Loading animations...");

  const entries =
    Object.entries(ANIMATION_FILES);

  const results =
    await Promise.all(
      entries.map(
        ([name, path]) =>
          loadFBXAnimation(name, path)
      )
    );

  console.log(
    "Animation loading results:",
    results
  );

  console.log(
    "Available animations:",
    Object.keys(animationActions)
  );

  hideLoader();
  startIntroSequence();
}

/* --------------------------------------------------
   Play character animation
-------------------------------------------------- */

function playAnimation(
  animationName,
  options = {}
) {
  const {
    loop = true,
    fadeDuration = 0.3,
    timeScale = 1
  } = options;

  const action =
    animationActions[animationName];

  if (!action) {
    console.warn(
      `${animationName} animation is unavailable`
    );

    return false;
  }

  if (currentAction === action) {
    return true;
  }

  if (currentAction) {
    currentAction.fadeOut(
      fadeDuration
    );
  }

  action.reset();
  action.enabled = true;

  action.setEffectiveTimeScale(
    timeScale
  );

  action.setEffectiveWeight(1);

  if (loop) {
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

  action.fadeIn(fadeDuration);
  action.play();

  currentAction = action;

  console.log(
    `Playing ${animationName}`
  );

  return true;
}

/* --------------------------------------------------
   Intro animation sequence
-------------------------------------------------- */

function startIntroSequence() {
  if (
    introStarted ||
    !characterRoot
  ) {
    return;
  }

  introStarted = true;

  const isMobile =
    window.innerWidth <= 760;

  const finalX =
    isMobile ? 0 : -1.9;

  const startX =
    isMobile ? -1.4 : -4.5;

  characterRoot.position.x = startX;

  const walkingAvailable =
    playAnimation("walking", {
      loop: true,
      timeScale: 1
    });

  if (!walkingAvailable) {
    playAnimation("idle", {
      loop: true
    });
  }

  animateCharacterX(
    startX,
    finalX,
    2400,
    () => {
      playAnimation("idle", {
        loop: true
      });
    }
  );

  setTimeout(() => {
    playAnimation("talking", {
      loop: true,
      timeScale: 1
    });
  }, 2850);

  setTimeout(() => {
    showSignupForm();

    playAnimation("pointing", {
      loop: false,
      timeScale: 1
    });
  }, 4700);

  setTimeout(() => {
    playAnimation("waving", {
      loop: false,
      timeScale: 1
    });
  }, 7000);

  setTimeout(() => {
    playAnimation("idle", {
      loop: true,
      timeScale: 1
    });
  }, 9200);
}

/* --------------------------------------------------
   Character horizontal movement
-------------------------------------------------- */

function animateCharacterX(
  startX,
  endX,
  duration,
  onComplete
) {
  const startTime =
    performance.now();

  function update(currentTime) {
    if (!characterRoot) {
      return;
    }

    const elapsed =
      currentTime - startTime;

    const progress =
      Math.min(
        elapsed / duration,
        1
      );

    const eased =
      1 -
      Math.pow(
        1 - progress,
        3
      );

    characterRoot.position.x =
      THREE.MathUtils.lerp(
        startX,
        endX,
        eased
      );

    if (progress < 1) {
      requestAnimationFrame(update);
      return;
    }

    if (
      typeof onComplete ===
      "function"
    ) {
      onComplete();
    }
  }

  requestAnimationFrame(update);
}

/* --------------------------------------------------
   Show signup form
-------------------------------------------------- */

function showSignupForm() {
  if (formShown) {
    return;
  }

  formShown = true;
  signupCard.classList.add("show");
}

/*
  Fallback: always show the form even if the model or
  animations cannot load.
*/

setTimeout(() => {
  showSignupForm();
}, 6500);

/* --------------------------------------------------
   Form validation
-------------------------------------------------- */

const formInputs = [
  fullNameInput,
  usernameInput,
  emailInput
];

formInputs.forEach((input) => {
  input.addEventListener(
    "input",
    () => {
      input.classList.remove(
        "input-error"
      );

      formMessage.textContent = "";
      formMessage.className =
        "form-message";
    }
  );
});

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
}

function showFormError(
  message,
  input
) {
  formMessage.textContent = message;

  formMessage.className =
    "form-message error";

  input.classList.add(
    "input-error"
  );

  input.focus();

  signupCard.classList.remove(
    "shake"
  );

  void signupCard.offsetWidth;

  signupCard.classList.add(
    "shake"
  );
}

signupForm.addEventListener(
  "submit",
  (event) => {
    event.preventDefault();

    const fullName =
      fullNameInput.value.trim();

    const username =
      usernameInput.value.trim();

    const email =
      emailInput.value.trim();

    formInputs.forEach((input) => {
      input.classList.remove(
        "input-error"
      );
    });

    if (!fullName) {
      showFormError(
        "Please enter your name.",
        fullNameInput
      );

      return;
    }

    if (!username) {
      showFormError(
        "Please enter a username.",
        usernameInput
      );

      return;
    }

    if (username.length < 3) {
      showFormError(
        "Username must contain at least 3 characters.",
        usernameInput
      );

      return;
    }

    if (!email) {
      showFormError(
        "Please enter your email address.",
        emailInput
      );

      return;
    }

    if (!isValidEmail(email)) {
      showFormError(
        "Please enter a valid email address.",
        emailInput
      );

      return;
    }

    nextButton.disabled = true;
    nextButton.textContent =
      "Please wait...";

    playAnimation("pointing", {
      loop: false
    });

    setTimeout(() => {
      formMessage.textContent =
        "Details saved successfully.";

      formMessage.className =
        "form-message success";

      nextButton.disabled = false;
      nextButton.textContent =
        "Next";

      playAnimation("waving", {
        loop: false
      });

      console.log(
        "Form details:",
        {
          fullName,
          username,
          email
        }
      );
    }, 700);
  }
);

/* --------------------------------------------------
   Render loop
-------------------------------------------------- */

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

  renderer.render(
    scene,
    camera
  );
}

animate();

/* --------------------------------------------------
   Resize
-------------------------------------------------- */

window.addEventListener(
  "resize",
  () => {
    camera.aspect =
      window.innerWidth /
      window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio,
        2
      )
    );

    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );

    setResponsiveCharacterPosition();
  }
);
