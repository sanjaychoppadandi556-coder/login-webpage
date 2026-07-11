import * as THREE from "three";

import { GLTFLoader } from
  "three/addons/loaders/GLTFLoader.js";

import { FBXLoader } from
  "three/addons/loaders/FBXLoader.js";

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
   Three.js scene
-------------------------------------------------- */

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  35,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);

camera.position.set(0, 1.8, 7.5);

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

renderer.outputColorSpace = THREE.SRGBColorSpace;

renderer.shadowMap.enabled = true;

renderer.shadowMap.type =
  THREE.PCFSoftShadowMap;

container.appendChild(renderer.domElement);

/* --------------------------------------------------
   Lighting
-------------------------------------------------- */

const ambientLight =
  new THREE.AmbientLight(0xffffff, 1.8);

scene.add(ambientLight);

const frontLight =
  new THREE.DirectionalLight(0xffffff, 3);

frontLight.position.set(2, 6, 6);

frontLight.castShadow = true;

scene.add(frontLight);

const warmLight =
  new THREE.PointLight(0xffa56b, 25, 15);

warmLight.position.set(3, 3, 4);

scene.add(warmLight);

const blueLight =
  new THREE.PointLight(0x568dff, 18, 14);

blueLight.position.set(-4, 2, 2);

scene.add(blueLight);

/* --------------------------------------------------
   Ground
-------------------------------------------------- */

const groundGeometry =
  new THREE.CircleGeometry(2.4, 64);

const groundMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x151820,
    transparent: true,
    opacity: 0.48,
    roughness: 0.75
  });

const ground =
  new THREE.Mesh(
    groundGeometry,
    groundMaterial
  );

ground.rotation.x = -Math.PI / 2;

ground.position.set(-1.7, -1.55, 0);

ground.receiveShadow = true;

scene.add(ground);

/* --------------------------------------------------
   Character and animation variables
-------------------------------------------------- */

const clock = new THREE.Clock();

let character = null;
let mixer = null;
let currentAction = null;

const animationActions = {};

let sequenceStarted = false;
let formShown = false;

/* --------------------------------------------------
   Load GLB character
-------------------------------------------------- */

const gltfLoader = new GLTFLoader();

gltfLoader.load(
  "models/character_optimized.glb",

  (gltf) => {
    character = gltf.scene;

    character.traverse((object) => {
      if (object.isMesh) {
        object.castShadow = true;
        object.receiveShadow = true;

        if (object.material) {
          object.material.side =
            THREE.FrontSide;
        }
      }
    });

    character.position.set(-1.9, -1.55, 0);

    character.rotation.y = 0.1;

    character.scale.setScalar(1.65);

    scene.add(character);

    mixer =
      new THREE.AnimationMixer(character);

    loadAllAnimations();
  },

  (progress) => {
    if (
      progress.total &&
      progress.total > 0
    ) {
      const percentage =
        Math.round(
          (progress.loaded / progress.total) * 100
        );

      modelLoader.textContent =
        `Loading character ${percentage}%`;
    }
  },

  (error) => {
    console.error(
      "Character loading failed:",
      error
    );

    modelLoader.textContent =
      "Character could not be loaded.";

    showSignupForm();
  }
);

/* --------------------------------------------------
   Load FBX animations
-------------------------------------------------- */

const fbxLoader = new FBXLoader();

const animationFiles = {
  idle: "models/Idle.fbx",
  walking: "models/Walking.fbx",
  talking: "models/Talking.fbx",
  pointing: "models/Pointing.fbx",
  waving: "models/Waving.fbx"
};

async function loadFBXAnimation(
  animationName,
  animationPath
) {
  return new Promise((resolve, reject) => {
    fbxLoader.load(
      animationPath,

      (fbx) => {
        if (
          !fbx.animations ||
          fbx.animations.length === 0
        ) {
          reject(
            new Error(
              `${animationName} animation is empty`
            )
          );

          return;
        }

        const clip = fbx.animations[0];

        clip.name = animationName;

        const action =
          mixer.clipAction(clip);

        animationActions[animationName] =
          action;

        resolve();
      },

      undefined,

      (error) => {
        console.error(
          `${animationName} loading failed:`,
          error
        );

        reject(error);
      }
    );
  });
}

async function loadAllAnimations() {
  try {
    modelLoader.textContent =
      "Loading animations...";

    const animationEntries =
      Object.entries(animationFiles);

    await Promise.all(
      animationEntries.map(
        ([name, path]) =>
          loadFBXAnimation(name, path)
      )
    );

    modelLoader.classList.add("hide");

    startIntroSequence();
  } catch (error) {
    console.error(
      "Some animations failed:",
      error
    );

    modelLoader.classList.add("hide");

    startIntroSequence();
  }
}

/* --------------------------------------------------
   Animation controls
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
      `${name} animation is unavailable`
    );

    return;
  }

  if (currentAction === newAction) {
    return;
  }

  if (currentAction) {
    currentAction.fadeOut(fadeDuration);
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

    newAction.clampWhenFinished = true;
  }

  newAction.fadeIn(fadeDuration);

  newAction.play();

  currentAction = newAction;
}

/* --------------------------------------------------
   Intro sequence
-------------------------------------------------- */

function startIntroSequence() {
  if (sequenceStarted) {
    return;
  }

  sequenceStarted = true;

  /*
    Character begins with walking.
  */

  if (animationActions.walking) {
    playAnimation("walking", {
      loop: true,
      timeScale: 1
    });
  } else {
    playAnimation("idle");
  }

  const startingX =
    window.innerWidth <= 750
      ? -2.8
      : -3.6;

  const endingX =
    window.innerWidth <= 750
      ? -0.6
      : -1.9;

  character.position.x = startingX;

  animateCharacterPosition(
    startingX,
    endingX,
    2200,
    () => {
      playAnimation("idle");
    }
  );

  /*
    Character talks after walking.
  */

  setTimeout(() => {
    playAnimation("talking", {
      loop: true,
      timeScale: 1
    });
  }, 2700);

  /*
    Show form and point toward it.
  */

  setTimeout(() => {
    showSignupForm();

    playAnimation("pointing", {
      loop: false,
      timeScale: 1
    });
  }, 4500);

  /*
    Wave and finally return to idle.
  */

  setTimeout(() => {
    playAnimation("waving", {
      loop: false,
      timeScale: 1
    });
  }, 6800);

  setTimeout(() => {
    playAnimation("idle", {
      loop: true
    });
  }, 9000);
}

/* --------------------------------------------------
   Character movement
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
    const elapsed =
      currentTime - startTime;

    const progress =
      Math.min(elapsed / duration, 1);

    const easedProgress =
      1 -
      Math.pow(1 - progress, 3);

    character.position.x =
      THREE.MathUtils.lerp(
        startX,
        endX,
        easedProgress
      );

    if (progress < 1) {
      requestAnimationFrame(move);
    } else if (
      typeof onComplete === "function"
    ) {
      onComplete();
    }
  }

  requestAnimationFrame(move);
}

/* --------------------------------------------------
   Show form
-------------------------------------------------- */

function showSignupForm() {
  if (formShown) {
    return;
  }

  formShown = true;

  signupCard.classList.add("show");
}

/*
  Fallback: show form even if an animation fails.
*/

setTimeout(() => {
  showSignupForm();
}, 6000);

/* --------------------------------------------------
   Form validation
-------------------------------------------------- */

const formInputs = [
  fullNameInput,
  usernameInput,
  emailInput
];

formInputs.forEach((input) => {
  input.addEventListener("input", () => {
    input.classList.remove("error");

    formMessage.textContent = "";
    formMessage.className =
      "form-message";
  });
});

function isValidEmail(email) {
  const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailPattern.test(email);
}

function showFormError(
  message,
  input
) {
  formMessage.textContent = message;

  formMessage.className =
    "form-message error";

  input.classList.add("error");

  input.focus();

  signupCard.classList.remove("shake");

  void signupCard.offsetWidth;

  signupCard.classList.add("shake");
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
      input.classList.remove("error");
    });

    if (fullName === "") {
      showFormError(
        "Please enter your name.",
        fullNameInput
      );

      return;
    }

    if (username === "") {
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

    if (email === "") {
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
   Render loop
-------------------------------------------------- */

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();

  if (mixer) {
    mixer.update(delta);
  }

  renderer.render(scene, camera);
}

animate();

/* --------------------------------------------------
   Resize handling
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

    if (!character) {
      return;
    }

    if (window.innerWidth <= 750) {
      character.position.z = 0.5;

      character.scale.setScalar(1.35);
    } else {
      character.position.z = 0;

      character.scale.setScalar(1.65);
    }
  }
);
