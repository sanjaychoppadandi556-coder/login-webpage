import * as THREE from "three";

import { GLTFLoader } from
  "three/addons/loaders/GLTFLoader.js";

import { OrbitControls } from
  "three/addons/controls/OrbitControls.js";


/* ========================================
   HTML ELEMENTS
======================================== */

const canvas = document.getElementById(
  "character-canvas"
);

const modelContainer = document.getElementById(
  "model-container"
);

const modelLoader = document.getElementById(
  "model-loader"
);

const loginForm = document.getElementById(
  "login-form"
);

const emailInput = document.getElementById(
  "email"
);

const passwordInput = document.getElementById(
  "password"
);

const emailError = document.getElementById(
  "email-error"
);

const passwordError = document.getElementById(
  "password-error"
);

const passwordToggle = document.getElementById(
  "password-toggle"
);

const loginButton = document.getElementById(
  "login-button"
);

const googleButton = document.getElementById(
  "google-button"
);

const forgotPasswordButton = document.getElementById(
  "forgot-password"
);

const signupButton = document.getElementById(
  "signup-button"
);

const toast = document.getElementById(
  "toast"
);

const toastIcon = document.getElementById(
  "toast-icon"
);

const toastMessage = document.getElementById(
  "toast-message"
);


/* ========================================
   THREE.JS SCENE
======================================== */

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  35,
  modelContainer.clientWidth /
    modelContainer.clientHeight,
  0.1,
  100
);

camera.position.set(0, 1.6, 6);

const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true,
  antialias: true
});

renderer.setPixelRatio(
  Math.min(window.devicePixelRatio, 2)
);

renderer.setSize(
  modelContainer.clientWidth,
  modelContainer.clientHeight
);

renderer.outputColorSpace =
  THREE.SRGBColorSpace;

renderer.shadowMap.enabled = true;

renderer.shadowMap.type =
  THREE.PCFSoftShadowMap;


/* ========================================
   LIGHTS
======================================== */

const ambientLight = new THREE.AmbientLight(
  0xffffff,
  1.8
);

scene.add(ambientLight);


const mainLight = new THREE.DirectionalLight(
  0xffffff,
  3.5
);

mainLight.position.set(4, 7, 5);

mainLight.castShadow = true;

mainLight.shadow.mapSize.set(2048, 2048);

scene.add(mainLight);


const purpleLight = new THREE.PointLight(
  0x7959ff,
  18,
  12
);

purpleLight.position.set(-4, 3, 3);

scene.add(purpleLight);


const blueLight = new THREE.PointLight(
  0x3478ff,
  10,
  10
);

blueLight.position.set(4, 1, -2);

scene.add(blueLight);


/* ========================================
   FLOOR
======================================== */

const floorGeometry =
  new THREE.CircleGeometry(2.4, 64);

const floorMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x11121a,
    transparent: true,
    opacity: 0.48,
    roughness: 0.75
  });

const floor = new THREE.Mesh(
  floorGeometry,
  floorMaterial
);

floor.rotation.x = -Math.PI / 2;

floor.position.y = -1.53;

floor.receiveShadow = true;

scene.add(floor);


/* ========================================
   ORBIT CONTROLS
======================================== */

const controls = new OrbitControls(
  camera,
  renderer.domElement
);

controls.enableDamping = true;

controls.enablePan = false;

controls.enableZoom = false;

controls.minPolarAngle = Math.PI / 2.8;

controls.maxPolarAngle = Math.PI / 1.9;

controls.target.set(0, 0.4, 0);


/* ========================================
   LOAD GLB CHARACTER
======================================== */

const gltfLoader = new GLTFLoader();

let character = null;
let animationMixer = null;
let currentAction = null;
let animationActions = [];

const clock = new THREE.Clock();

gltfLoader.load(
  "./character.glb",

  function (gltf) {
    character = gltf.scene;

    character.traverse(function (object) {
      if (object.isMesh) {
        object.castShadow = true;
        object.receiveShadow = true;

        if (object.material) {
          object.material.needsUpdate = true;
        }
      }
    });

    scene.add(character);

    fitModelToScene(character);

    if (
      gltf.animations &&
      gltf.animations.length > 0
    ) {
      animationMixer =
        new THREE.AnimationMixer(character);

      animationActions =
        gltf.animations.map(function (clip) {
          return {
            name: clip.name.toLowerCase(),
            action:
              animationMixer.clipAction(clip)
          };
        });

      console.log(
        "Available animations:",
        gltf.animations.map(
          animation => animation.name
        )
      );

      playDefaultAnimation();
    }

    modelLoader.classList.add("hidden");
  },

  function (progress) {
    if (progress.total > 0) {
      const percentage = Math.round(
        (progress.loaded / progress.total) * 100
      );

      modelLoader.textContent =
        `Loading character... ${percentage}%`;
    }
  },

  function (error) {
    console.error(
      "Model loading failed:",
      error
    );

    modelLoader.textContent =
      "Character could not be loaded. Check character.glb.";
  }
);


/* ========================================
   MODEL SIZE AND POSITION
======================================== */

function fitModelToScene(model) {
  const box = new THREE.Box3().setFromObject(model);

  const size = box.getSize(
    new THREE.Vector3()
  );

  const center = box.getCenter(
    new THREE.Vector3()
  );

  model.position.x -= center.x;
  model.position.y -= center.y;
  model.position.z -= center.z;

  const maximumDimension = Math.max(
    size.x,
    size.y,
    size.z
  );

  const desiredHeight = 3.6;

  const scale =
    desiredHeight / maximumDimension;

  model.scale.setScalar(scale);

  const updatedBox =
    new THREE.Box3().setFromObject(model);

  const updatedCenter =
    updatedBox.getCenter(
      new THREE.Vector3()
    );

  model.position.x -= updatedCenter.x;
  model.position.z -= updatedCenter.z;

  model.position.y =
    -updatedBox.min.y - 1.52;

  model.rotation.y = -0.15;
}


/* ========================================
   CHARACTER ANIMATIONS
======================================== */

function findAnimation(keywords) {
  return animationActions.find(
    animationItem =>
      keywords.some(keyword =>
        animationItem.name.includes(keyword)
      )
  );
}


function playAnimation(
  animationItem,
  loop = true
) {
  if (!animationItem) {
    return false;
  }

  if (
    currentAction === animationItem.action
  ) {
    return true;
  }

  if (currentAction) {
    currentAction.fadeOut(0.3);
  }

  currentAction = animationItem.action;

  currentAction.reset();

  currentAction.setLoop(
    loop
      ? THREE.LoopRepeat
      : THREE.LoopOnce,
    loop ? Infinity : 1
  );

  currentAction.clampWhenFinished = !loop;

  currentAction
    .fadeIn(0.3)
    .play();

  return true;
}


function playDefaultAnimation() {
  const idleAnimation = findAnimation([
    "idle",
    "stand",
    "breath"
  ]);

  const walkingAnimation = findAnimation([
    "walk"
  ]);

  const firstAnimation =
    animationActions[0];

  playAnimation(
    idleAnimation ||
    walkingAnimation ||
    firstAnimation,
    true
  );
}


function playSuccessAnimation() {
  const successAnimation = findAnimation([
    "celebrate",
    "happy",
    "dance",
    "victory",
    "wave",
    "jump"
  ]);

  if (!successAnimation) {
    temporaryCharacterEffect("success");
    return;
  }

  playAnimation(successAnimation, false);

  setTimeout(() => {
    playDefaultAnimation();
  }, 2200);
}


function playErrorAnimation() {
  const errorAnimation = findAnimation([
    "sad",
    "no",
    "fail",
    "disappointed"
  ]);

  if (!errorAnimation) {
    temporaryCharacterEffect("error");
    return;
  }

  playAnimation(errorAnimation, false);

  setTimeout(() => {
    playDefaultAnimation();
  }, 1800);
}


function temporaryCharacterEffect(type) {
  if (!character) {
    return;
  }

  const originalRotation =
    character.rotation.z;

  if (type === "success") {
    let count = 0;

    const jumpAnimation = setInterval(() => {
      character.position.y +=
        count % 2 === 0 ? 0.12 : -0.12;

      count++;

      if (count >= 6) {
        clearInterval(jumpAnimation);
      }
    }, 110);
  }

  if (type === "error") {
    let count = 0;

    const shakeAnimation = setInterval(() => {
      character.rotation.z =
        count % 2 === 0 ? 0.045 : -0.045;

      count++;

      if (count >= 8) {
        clearInterval(shakeAnimation);

        character.rotation.z =
          originalRotation;
      }
    }, 70);
  }
}


/* ========================================
   MOUSE CHARACTER MOVEMENT
======================================== */

let targetRotationX = 0;
let targetRotationY = -0.15;

window.addEventListener(
  "mousemove",
  function (event) {
    if (!character) {
      return;
    }

    const normalizedX =
      (event.clientX / window.innerWidth) * 2 - 1;

    const normalizedY =
      (event.clientY / window.innerHeight) * 2 - 1;

    targetRotationY =
      -0.15 + normalizedX * 0.18;

    targetRotationX =
      normalizedY * 0.04;
  }
);


/* ========================================
   RENDER LOOP
======================================== */

function animate() {
  requestAnimationFrame(animate);

  const deltaTime = clock.getDelta();

  if (animationMixer) {
    animationMixer.update(deltaTime);
  }

  if (character) {
    character.rotation.y +=
      (targetRotationY -
        character.rotation.y) * 0.04;

    character.rotation.x +=
      (targetRotationX -
        character.rotation.x) * 0.04;
  }

  controls.update();

  renderer.render(scene, camera);
}

animate();


/* ========================================
   WINDOW RESIZE
======================================== */

window.addEventListener(
  "resize",
  resizeRenderer
);

function resizeRenderer() {
  const width =
    modelContainer.clientWidth;

  const height =
    modelContainer.clientHeight;

  camera.aspect = width / height;

  camera.updateProjectionMatrix();

  renderer.setSize(width, height);

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
  );
}


/* ========================================
   PASSWORD SHOW / HIDE
======================================== */

passwordToggle.addEventListener(
  "click",
  function () {
    const passwordIsHidden =
      passwordInput.type === "password";

    passwordInput.type =
      passwordIsHidden
        ? "text"
        : "password";

    passwordToggle.textContent =
      passwordIsHidden
        ? "🙈"
        : "👁";

    passwordToggle.setAttribute(
      "aria-label",
      passwordIsHidden
        ? "Hide password"
        : "Show password"
    );
  }
);


/* ========================================
   VALIDATION
======================================== */

function validateEmail(email) {
  const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailPattern.test(email);
}


function clearErrors() {
  emailError.textContent = "";
  passwordError.textContent = "";

  emailInput
    .closest(".input-box")
    .classList.remove("error");

  passwordInput
    .closest(".input-box")
    .classList.remove("error");
}


function showInputError(
  input,
  errorElement,
  message
) {
  errorElement.textContent = message;

  input
    .closest(".input-box")
    .classList.add("error");
}


emailInput.addEventListener(
  "input",
  function () {
    emailError.textContent = "";

    emailInput
      .closest(".input-box")
      .classList.remove("error");
  }
);


passwordInput.addEventListener(
  "input",
  function () {
    passwordError.textContent = "";

    passwordInput
      .closest(".input-box")
      .classList.remove("error");
  }
);


/* ========================================
   LOGIN SUBMIT
======================================== */

loginForm.addEventListener(
  "submit",
  async function (event) {
    event.preventDefault();

    clearErrors();

    const email =
      emailInput.value.trim();

    const password =
      passwordInput.value.trim();

    let formIsValid = true;

    if (!email) {
      showInputError(
        emailInput,
        emailError,
        "Please enter your email address."
      );

      formIsValid = false;
    } else if (!validateEmail(email)) {
      showInputError(
        emailInput,
        emailError,
        "Please enter a valid email address."
      );

      formIsValid = false;
    }

    if (!password) {
      showInputError(
        passwordInput,
        passwordError,
        "Please enter your password."
      );

      formIsValid = false;
    } else if (password.length < 6) {
      showInputError(
        passwordInput,
        passwordError,
        "Password must contain at least 6 characters."
      );

      formIsValid = false;
    }

    if (!formIsValid) {
      playErrorAnimation();

      showToast(
        "Please correct the highlighted fields.",
        "error"
      );

      return;
    }

    setLoginLoading(true);

    try {
      /*
        ADD YOUR FIREBASE LOGIN CODE HERE.

        Example:

        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
      */

      await simulateLogin();

      playSuccessAnimation();

      showToast(
        "Login successful. Welcome back!",
        "success"
      );

      /*
        Redirect after successful login:

        setTimeout(() => {
          window.location.href = "home.html";
        }, 1200);
      */
    } catch (error) {
      console.error(error);

      playErrorAnimation();

      showToast(
        error.message ||
        "Login failed. Please try again.",
        "error"
      );
    } finally {
      setLoginLoading(false);
    }
  }
);


function simulateLogin() {
  return new Promise(resolve => {
    setTimeout(resolve, 1200);
  });
}


function setLoginLoading(isLoading) {
  loginButton.classList.toggle(
    "loading",
    isLoading
  );

  loginButton.disabled = isLoading;
}


/* ========================================
   OTHER BUTTONS
======================================== */

googleButton.addEventListener(
  "click",
  function () {
    /*
      ADD YOUR FIREBASE GOOGLE LOGIN CODE HERE.
    */

    showToast(
      "Connect your Google Sign-In code here.",
      "success"
    );
  }
);


forgotPasswordButton.addEventListener(
  "click",
  function () {
    const email =
      emailInput.value.trim();

    if (!email) {
      showInputError(
        emailInput,
        emailError,
        "Enter your email to reset the password."
      );

      emailInput.focus();

      return;
    }

    if (!validateEmail(email)) {
      showInputError(
        emailInput,
        emailError,
        "Enter a valid email address."
      );

      emailInput.focus();

      return;
    }

    /*
      ADD FIREBASE PASSWORD RESET CODE HERE.

      await sendPasswordResetEmail(auth, email);
    */

    showToast(
      "Password reset link will be sent to your email.",
      "success"
    );
  }
);


signupButton.addEventListener(
  "click",
  function () {
    /*
      Replace with your registration page.
    */

    window.location.href = "signup.html";
  }
);


/* ========================================
   TOAST MESSAGE
======================================== */

let toastTimeout;

function showToast(message, type) {
  clearTimeout(toastTimeout);

  toastMessage.textContent = message;

  toast.classList.remove(
    "error",
    "success"
  );

  toast.classList.add(type);

  toastIcon.textContent =
    type === "error" ? "!" : "✓";

  toast.classList.add("show");

  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 3500);
}
