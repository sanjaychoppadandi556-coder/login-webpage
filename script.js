import * as THREE from "three";

import { GLTFLoader } from
  "three/addons/loaders/GLTFLoader.js";

import { FBXLoader } from
  "three/addons/loaders/FBXLoader.js";

console.log("script.js loaded");

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
   Scene
-------------------------------------------------- */

const scene = new THREE.Scene();

/*
  Modified camera settings.
  These settings allow a wider visible area.
*/

const camera = new THREE.PerspectiveCamera(
  40,
  window.innerWidth / window.innerHeight,
  0.01,
  1000
);

camera.position.set(0, 1.2, 8);
camera.lookAt(0, 0.6, 0);

/* --------------------------------------------------
   Renderer
-------------------------------------------------- */

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true
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
    0x26304a,
    2.4
  );

scene.add(hemisphereLight);

const frontLight =
  new THREE.DirectionalLight(
    0xffffff,
    3.2
  );

frontLight.position.set(2, 6, 7);

frontLight.castShadow = true;

scene.add(frontLight);

const warmLight =
  new THREE.PointLight(
    0xffa16c,
    28,
    20
  );

warmLight.position.set(4, 3, 4);

scene.add(warmLight);

const blueLight =
  new THREE.PointLight(
    0x5a8cff,
    22,
    18
  );

blueLight.position.set(-5, 2, 3);

scene.add(blueLight);

/* --------------------------------------------------
   Ground
-------------------------------------------------- */

const groundGeometry =
  new THREE.CircleGeometry(2.3, 64);

const groundMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x171b24,
    transparent: true,
    opacity: 0.44,
    roughness: 0.8
  });

const ground =
  new THREE.Mesh(
    groundGeometry,
    groundMaterial
  );

ground.rotation.x = -Math.PI / 2;
ground.position.set(-1.8, -1.62, 0);
ground.receiveShadow = true;

scene.add(ground);

/* --------------------------------------------------
   Character variables
-------------------------------------------------- */

const clock = new THREE.Clock();

let character = null;
let characterRoot = null;
let mixer = null;
let currentAction = null;

let sequenceStarted = false;
let formShown = false;

const animationActions = {};

/* --------------------------------------------------
   Model paths
-------------------------------------------------- */

const MODEL_PATH =
  "./models/character_optimized.glb";

const animationFiles = {
  idle: "./models/Idle.fbx",
  walking: "./models/Walking.fbx",
  talking: "./models/Talking.fbx",
  pointing: "./models/Pointing.fbx",
  waving: "./models/Waving.fbx"
};

/* --------------------------------------------------
   Load character
-------------------------------------------------- */

const gltfLoader = new GLTFLoader();

console.log("Loading GLB:", MODEL_PATH);

gltfLoader.load(
  MODEL_PATH,

  (gltf) => {
    console.log("GLB loaded successfully", gltf);

    character = gltf.scene;

    character.traverse((object) => {
      if (!object.isMesh) {
        return;
      }

      object.castShadow = true;
      object.receiveShadow = true;

      if (object.material) {
        object.material.side =
          THREE.DoubleSide;

        object.material.needsUpdate =
          true;
      }
    });

    /*
      characterRoot controls page positioning.
      character controls model centering and scale.
    */

    characterRoot = new THREE.Group();
    characterRoot.add(character);
    scene.add(characterRoot);

    /*
      Get original model dimensions.
    */

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
      "Original model size:",
      originalSize
    );

    console.log(
      "Original model center:",
      originalCenter
    );

    /*
      Move the model itself to the origin.
    */

    character.position.set(
      -originalCenter.x,
      -originalCenter.y,
      -originalCenter.z
    );

    /*
      Automatically scale model based on height.
    */

    const originalHeight =
      originalSize.y > 0
        ? originalSize.y
        : Math.max(
            originalSize.x,
            originalSize.z,
            1
          );

    const targetHeight =
      window.innerWidth <= 760
        ? 3.2
        : 4.3;

    const automaticScale =
      targetHeight / originalHeight;

    character.scale.setScalar(
      automaticScale
    );

    /*
      Recalculate after scaling and centering.
    */

    character.updateMatrixWorld(true);

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

    console.log(
      "Scaled model size:",
      scaledSize
    );

    console.log(
      "Scaled model center:",
      scaledCenter
    );

    /*
      Correct any remaining center offset.
    */

    character.position.x -=
      scaledCenter.x;

    character.position.y -=
      scaledCenter.y;

    character.position.z -=
      scaledCenter.z;

    /*
      Place full character group on screen.
    */

    setCharacterResponsivePosition();

    characterRoot.rotation.y = 0;

    /*
      Create animation mixer.
    */

    mixer =
      new THREE.AnimationMixer(character);

    modelLoader.textContent =
      "Loading animations...";

    loadAllAnimations();
  },

  (progress) => {
    if (
      progress.total &&
      progress.total > 0
    ) {
      const percentage =
        Math.round(
          (
            progress.loaded /
            progress.total
          ) * 100
        );

      modelLoader.textContent =
        `Loading character ${percentage}%`;
    }
  },

  (error) => {
    console.error(
      "GLB failed to load:",
      error
    );

    modelLoader.textContent =
      "Character could not be loaded";

    showSignupForm();
  }
);

/* --------------------------------------------------
   Responsive model position
-------------------------------------------------- */

function setCharacterResponsivePosition() {
  if (!characterRoot) {
    return;
  }

  if (window.innerWidth <= 760) {
    characterRoot.position.set(
      0,
      0.55,
      0.4
    );
  } else {
    characterRoot.position.set(
      -1.85,
      0,
      0
    );
  }
}

/* --------------------------------------------------
   Load FBX animation
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

        /*
          Resolve instead of rejecting.
          One missing animation will not stop everything.
        */

        resolve(false);
      }
    );
  });
}

async function loadAllAnimations() {
  const animationEntries =
    Object.entries(animationFiles);

  const results =
    await Promise.all(
      animationEntries.map(
        ([name, path]) =>
          loadFBXAnimation(name, path)
      )
    );

  console.log(
    "Animation loading results:",
    results
  );

  modelLoader.classList.add("hide");

  startIntroSequence();
}

/* --------------------------------------------------
   Play animation
-------------------------------------------------- */

function playAnimation(
  name,
  options = {}
) {
  const {
    loop = true,
    fadeDuration = 0.35,
    timeScale = 1
  } = options;

  const newAction =
    animationActions[name];

  if (!newAction) {
    console.warn(
      `${name} animation unavailable`
    );

    return false;
  }

  if (currentAction === newAction) {
    return true;
  }

  if (currentAction) {
    currentAction.fadeOut(
      fadeDuration
    );
  }

  newAction.reset();
  newAction.enabled = true;

  newAction.setEffectiveTimeScale(
    timeScale
  );

  newAction.setEffectiveWeight(1);

  if (loop) {
    newAction.setLoop(
      THREE.LoopRepeat,
      Infinity
    );
  } else {
    newAction.setLoop(
      THREE.LoopOnce,
      1
    );

    newAction.clampWhenFinished =
      true;
  }

  newAction.fadeIn(
    fadeDuration
  );

  newAction.play();

  currentAction = newAction;

  return true;
}

/* --------------------------------------------------
   Intro sequence
-------------------------------------------------- */

function startIntroSequence() {
  if (
    sequenceStarted ||
    !characterRoot
  ) {
    return;
  }

  sequenceStarted = true;

  const isMobile =
    window.innerWidth <= 760;

  const startX =
    isMobile ? -1.2 : -4;

  const endX =
    isMobile ? 0 : -1.85;

  characterRoot.position.x =
    startX;

  if (
    !playAnimation("walking", {
      loop: true,
      timeScale: 1
    })
  ) {
    playAnimation("idle");
  }

  animateCharacterPosition(
    startX,
    endX,
    2300,
    () => {
      playAnimation("idle");
    }
  );

  setTimeout(() => {
    playAnimation("talking", {
      loop: true,
      timeScale: 1
    });
  }, 2800);

  setTimeout(() => {
    showSignupForm();

    playAnimation("pointing", {
      loop: false,
      timeScale: 1
    });
  }, 4600);

  setTimeout(() => {
    playAnimation("waving", {
      loop: false,
      timeScale: 1
    });
  }, 6900);

  setTimeout(() => {
    playAnimation("idle", {
      loop: true
    });
  }, 9100);
}

/* --------------------------------------------------
   Move character
-------------------------------------------------- */

function animateCharacterPosition(
  startX,
  endX,
  duration,
  onComplete
) {
  const startTime =
    performance.now();

  function move(currentTime) {
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

    const easedProgress =
      1 -
      Math.pow(
        1 - progress,
        3
      );

    characterRoot.position.x =
      THREE.MathUtils.lerp(
        startX,
        endX,
        easedProgress
      );

    if (progress < 1) {
      requestAnimationFrame(move);
      return;
    }

    if (
      typeof onComplete ===
      "function"
    ) {
      onComplete();
    }
  }

  requestAnimationFrame(move);
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
  Form fallback.
  The form still appears if model loading fails.
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
        "error"
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
  formMessage.textContent =
    message;

  formMessage.className =
    "form-message error";

  input.classList.add("error");
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

    formInputs.forEach(
      (input) => {
        input.classList.remove(
          "error"
        );
      }
    );

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

      console.log({
        fullName,
        username,
        email
      });
    }, 700);
  }
);

/* --------------------------------------------------
   Render
-------------------------------------------------- */

function animate() {
  requestAnimationFrame(animate);

  const delta =
    clock.getDelta();

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

    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );

    setCharacterResponsivePosition();
  }
);
