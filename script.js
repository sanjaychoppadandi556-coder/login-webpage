import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

/* ==================================================
   HTML ELEMENTS
================================================== */

const container = document.getElementById("characterContainer");
const modelLoader = document.getElementById("modelLoader");
const signupCard = document.getElementById("signupCard");
const signupForm = document.getElementById("signupForm");

const fullNameInput = document.getElementById("fullName");
const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");

const nextButton = document.getElementById("nextButton");
const formMessage = document.getElementById("formMessage");

if (
  !container ||
  !modelLoader ||
  !signupCard ||
  !signupForm ||
  !fullNameInput ||
  !usernameInput ||
  !emailInput ||
  !nextButton ||
  !formMessage
) {
  throw new Error("Required HTML elements are missing.");
}

/* ==================================================
   CONFIGURATION
================================================== */

const MODEL_PATH = "./models/character_optimized.glb";

/*
  Change only this value when the character faces backward:

  0         = original direction
  Math.PI   = opposite direction
*/
const CHARACTER_DIRECTION = Math.PI;

/*
  Final position of the character.
*/
const DESKTOP_CHARACTER_X = -2;
const DESKTOP_CHARACTER_Y = -1.45;

const MOBILE_CHARACTER_X = 0;
const MOBILE_CHARACTER_Y = -1.1;

/* ==================================================
   THREE.JS SCENE
================================================== */

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  38,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.set(0, 1, 8);
camera.lookAt(0, 0.6, 0);

/* ==================================================
   RENDERER
================================================== */

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

renderer.outputColorSpace = THREE.SRGBColorSpace;

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.setClearColor(0x000000, 0);

container.appendChild(renderer.domElement);

/* ==================================================
   LIGHTING
================================================== */

const hemisphereLight = new THREE.HemisphereLight(
  0xffffff,
  0x18233a,
  2.2
);

scene.add(hemisphereLight);

const frontLight = new THREE.DirectionalLight(
  0xffffff,
  3
);

frontLight.position.set(2, 6, 7);
frontLight.castShadow = true;

scene.add(frontLight);

const leftLight = new THREE.PointLight(
  0x4d83ff,
  18,
  20
);

leftLight.position.set(-4, 2, 4);

scene.add(leftLight);

const rightLight = new THREE.PointLight(
  0xff995f,
  18,
  20
);

rightLight.position.set(4, 3, 4);

scene.add(rightLight);

/* ==================================================
   GROUND SHADOW
================================================== */

const ground = new THREE.Mesh(
  new THREE.CircleGeometry(2.2, 64),

  new THREE.MeshStandardMaterial({
    color: 0x111722,
    transparent: true,
    opacity: 0.38,
    roughness: 0.9,
    depthWrite: false
  })
);

ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;

scene.add(ground);

/* ==================================================
   CHARACTER VARIABLES
================================================== */

let characterWrapper = null;
let characterModel = null;

let formShown = false;
let introStarted = false;

/* ==================================================
   LOADER HELPERS
================================================== */

function updateLoader(message) {
  modelLoader.textContent = message;
  console.log(message);
}

function hideLoader() {
  modelLoader.classList.add("hide");
}

/* ==================================================
   LOAD GLB CHARACTER
================================================== */

const gltfLoader = new GLTFLoader();

updateLoader("Loading character...");

gltfLoader.load(
  MODEL_PATH,

  (gltf) => {
    console.log("GLB loaded successfully:", gltf);

    characterModel = gltf.scene;

    /*
      Important:
      Do not reset bones.
      Do not call skeleton.pose().
      Do not change the GLB model's scale.
      Do not change the GLB model's rotation.
    */

    prepareModelMaterials(characterModel);

    /*
      Create two wrapper groups:

      characterCenter:
      Used only to center the original GLB.

      characterWrapper:
      Used for final page positioning, rotation and scale.
    */

    const characterCenter = new THREE.Group();

    characterWrapper = new THREE.Group();

    characterCenter.add(characterModel);

    characterWrapper.add(characterCenter);

    scene.add(characterWrapper);

    /*
      Calculate bounds without modifying the GLB model.
    */

    characterModel.updateMatrixWorld(true);

    const modelBox = new THREE.Box3().setFromObject(
      characterModel
    );

    const modelSize = modelBox.getSize(
      new THREE.Vector3()
    );

    const modelCenter = modelBox.getCenter(
      new THREE.Vector3()
    );

    console.log("Original model size:", modelSize);
    console.log("Original model center:", modelCenter);

    if (
      !Number.isFinite(modelSize.x) ||
      !Number.isFinite(modelSize.y) ||
      !Number.isFinite(modelSize.z) ||
      modelSize.y <= 0
    ) {
      throw new Error(
        "The GLB model has invalid dimensions."
      );
    }

    /*
      Center the entire unchanged GLB using its parent group.
    */

    characterCenter.position.set(
      -modelCenter.x,
      -modelBox.min.y,
      -modelCenter.z
    );

    /*
      Scale only the external wrapper.
    */

    const targetHeight =
      window.innerWidth <= 760
        ? 3
        : 4;

    const wrapperScale =
      targetHeight / modelSize.y;

    characterWrapper.scale.setScalar(
      wrapperScale
    );

    /*
      Rotate only the external wrapper.
    */

    characterWrapper.rotation.set(
      0,
      CHARACTER_DIRECTION,
      0
    );

    setResponsiveCharacterPosition();

    /*
      External FBX animations and automatic GLB animations
      are intentionally disabled until the model displays
      correctly in its original pose.
    */

    console.log(
      "Embedded GLB animations:",
      gltf.animations.map(
        (animation) => animation.name
      )
    );

    hideLoader();

    startIntro();
  },

  (progress) => {
    if (
      Number.isFinite(progress.total) &&
      progress.total > 0
    ) {
      const percentage = Math.round(
        (progress.loaded / progress.total) * 100
      );

      updateLoader(
        `Loading character ${percentage}%`
      );
    }
  },

  (error) => {
    console.error("GLB loading failed:", error);

    updateLoader(
      "Character model could not be loaded"
    );

    setTimeout(() => {
      hideLoader();
      showSignupForm();
    }, 1200);
  }
);

/* ==================================================
   MODEL MATERIALS
================================================== */

function prepareModelMaterials(model) {
  model.traverse((object) => {
    if (!object.isMesh) {
      return;
    }

    object.castShadow = true;
    object.receiveShadow = true;

    /*
      Keep normal Three.js frustum handling.
      Do not force skeleton or bone changes.
    */

    const materials = Array.isArray(object.material)
      ? object.material
      : [object.material];

    materials.forEach((material) => {
      if (!material) {
        return;
      }

      /*
        FrontSide is safer than DoubleSide for a character.
      */

      material.side = THREE.FrontSide;

      if (material.map) {
        material.map.colorSpace =
          THREE.SRGBColorSpace;

        material.map.needsUpdate = true;
      }

      material.needsUpdate = true;
    });
  });
}

/* ==================================================
   RESPONSIVE CHARACTER POSITION
================================================== */

function setResponsiveCharacterPosition() {
  if (!characterWrapper) {
    return;
  }

  const isMobile =
    window.innerWidth <= 760;

  if (isMobile) {
    characterWrapper.position.set(
      MOBILE_CHARACTER_X,
      MOBILE_CHARACTER_Y,
      0.3
    );

    ground.position.set(
      MOBILE_CHARACTER_X,
      MOBILE_CHARACTER_Y,
      0
    );
  } else {
    characterWrapper.position.set(
      DESKTOP_CHARACTER_X,
      DESKTOP_CHARACTER_Y,
      0
    );

    ground.position.set(
      DESKTOP_CHARACTER_X,
      DESKTOP_CHARACTER_Y,
      0
    );
  }
}

/* ==================================================
   INTRO MOVEMENT
================================================== */

function startIntro() {
  if (
    introStarted ||
    !characterWrapper
  ) {
    return;
  }

  introStarted = true;

  const isMobile =
    window.innerWidth <= 760;

  const finalX =
    isMobile
      ? MOBILE_CHARACTER_X
      : DESKTOP_CHARACTER_X;

  const startX =
    isMobile
      ? finalX - 1.2
      : finalX - 2.5;

  characterWrapper.position.x =
    startX;

  animateCharacterEntrance(
    startX,
    finalX,
    2200
  );

  setTimeout(() => {
    showSignupForm();
  }, 2700);
}

function animateCharacterEntrance(
  startX,
  endX,
  duration
) {
  if (!characterWrapper) {
    return;
  }

  const startTime =
    performance.now();

  const fixedY =
    characterWrapper.position.y;

  function update(currentTime) {
    if (!characterWrapper) {
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

    characterWrapper.position.x =
      THREE.MathUtils.lerp(
        startX,
        endX,
        eased
      );

    /*
      Move only the whole wrapper.
      Do not change bones or internal GLB nodes.
    */

    characterWrapper.position.y =
      fixedY +
      Math.sin(
        progress *
        Math.PI *
        6
      ) *
      0.015;

    if (progress < 1) {
      requestAnimationFrame(update);
      return;
    }

    characterWrapper.position.x =
      endX;

    characterWrapper.position.y =
      fixedY;
  }

  requestAnimationFrame(update);
}

/* ==================================================
   SHOW SIGNUP FORM
================================================== */

function showSignupForm() {
  if (formShown) {
    return;
  }

  formShown = true;

  signupCard.classList.add("show");
}

/*
  Fallback if model loading takes too long.
*/

setTimeout(() => {
  showSignupForm();
}, 6000);

/* ==================================================
   FORM VALIDATION
================================================== */

const formInputs = [
  fullNameInput,
  usernameInput,
  emailInput
];

formInputs.forEach((input) => {
  input.addEventListener("input", () => {
    input.classList.remove("input-error");

    formMessage.textContent = "";
    formMessage.className =
      "form-message";
  });
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

  input.classList.add("input-error");
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
      input.classList.remove(
        "input-error"
      );
    });

    formMessage.textContent = "";
    formMessage.className =
      "form-message";

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

    setTimeout(() => {
      formMessage.textContent =
        "Details saved successfully.";

      formMessage.className =
        "form-message success";

      nextButton.disabled = false;
      nextButton.textContent = "Next";

      console.log({
        fullName,
        username,
        email
      });
    }, 700);
  }
);

/* ==================================================
   RENDER LOOP
================================================== */

function animate() {
  requestAnimationFrame(animate);

  renderer.render(scene, camera);
}

animate();

/* ==================================================
   WINDOW RESIZE
================================================== */

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
