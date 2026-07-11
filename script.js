import * as THREE from "three";

import { GLTFLoader } from
  "three/addons/loaders/GLTFLoader.js";

console.log("script.js loaded successfully");

/* ==================================================
   HTML ELEMENTS
================================================== */

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

/* ==================================================
   THREE.JS SCENE
================================================== */

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  40,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);

camera.position.set(0, 1.2, 8);

camera.lookAt(
  0,
  0.7,
  0
);

/* ==================================================
   RENDERER
================================================== */

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
  powerPreference: "high-performance"
});

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

renderer.outputColorSpace =
  THREE.SRGBColorSpace;

renderer.shadowMap.enabled = true;

renderer.shadowMap.type =
  THREE.PCFSoftShadowMap;

renderer.setClearColor(
  0x000000,
  0
);

container.appendChild(
  renderer.domElement
);

/* ==================================================
   LIGHTS
================================================== */

const hemisphereLight =
  new THREE.HemisphereLight(
    0xffffff,
    0x273149,
    2.8
  );

scene.add(hemisphereLight);

const mainLight =
  new THREE.DirectionalLight(
    0xffffff,
    3.5
  );

mainLight.position.set(
  2,
  6,
  7
);

mainLight.castShadow = true;

scene.add(mainLight);

const blueLight =
  new THREE.PointLight(
    0x568bff,
    24,
    20
  );

blueLight.position.set(
  -4,
  2,
  4
);

scene.add(blueLight);

const orangeLight =
  new THREE.PointLight(
    0xff9d68,
    28,
    20
  );

orangeLight.position.set(
  4,
  3,
  4
);

scene.add(orangeLight);

/* ==================================================
   GROUND
================================================== */

const groundGeometry =
  new THREE.CircleGeometry(
    2.5,
    64
  );

const groundMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x151a24,
    transparent: true,
    opacity: 0.42,
    roughness: 0.9
  });

const ground =
  new THREE.Mesh(
    groundGeometry,
    groundMaterial
  );

ground.rotation.x =
  -Math.PI / 2;

ground.receiveShadow = true;

scene.add(ground);

/* ==================================================
   CHARACTER VARIABLES
================================================== */

const clock =
  new THREE.Clock();

let character = null;
let characterRoot = null;
let mixer = null;

let introStarted = false;
let formShown = false;

/* ==================================================
   LOAD CHARACTER
================================================== */

const gltfLoader =
  new GLTFLoader();

const modelPath =
  "./models/character_optimized.glb";

console.log(
  "Loading model:",
  modelPath
);

gltfLoader.load(
  modelPath,

  (gltf) => {
    console.log(
      "GLB loaded successfully:",
      gltf
    );

    character = gltf.scene;

    prepareCharacter(character);

    characterRoot =
      new THREE.Group();

    characterRoot.name =
      "CharacterRoot";

    characterRoot.add(character);

    scene.add(characterRoot);

    /*
      Important:
      First rotate the model upright.
      After that, calculate its box,
      center, size and ground position.
    */

    fixCharacterOrientation();

    centerScaleAndPlaceCharacter();

    setResponsiveCharacterPosition();

    /*
      Use only embedded GLB animations.

      External FBX animations are not loaded because
      they were deforming the GLB skeleton.
    */

    if (
      Array.isArray(gltf.animations) &&
      gltf.animations.length > 0
    ) {
      console.log(
        "Embedded animations:",
        gltf.animations.map(
          (clip) => clip.name
        )
      );

      mixer =
        new THREE.AnimationMixer(
          character
        );

      const embeddedAction =
        mixer.clipAction(
          gltf.animations[0]
        );

      embeddedAction.setLoop(
        THREE.LoopRepeat,
        Infinity
      );

      embeddedAction.play();
    } else {
      console.log(
        "No embedded GLB animation found"
      );
    }

    modelLoader.classList.add(
      "hide"
    );

    startIntroSequence();
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
      "GLB loading failed:",
      error
    );

    modelLoader.textContent =
      "Character could not be loaded";

    setTimeout(() => {
      modelLoader.classList.add(
        "hide"
      );

      showSignupForm();
    }, 1200);
  }
);

/* ==================================================
   PREPARE MATERIALS
================================================== */

function prepareCharacter(model) {
  model.traverse((object) => {
    if (!object.isMesh) {
      return;
    }

    object.castShadow = true;
    object.receiveShadow = true;
    object.frustumCulled = false;

    const materials =
      Array.isArray(object.material)
        ? object.material
        : [object.material];

    materials.forEach((material) => {
      if (!material) {
        return;
      }

      material.side =
        THREE.DoubleSide;

      if (material.map) {
        material.map.colorSpace =
          THREE.SRGBColorSpace;
      }

      material.needsUpdate = true;
    });
  });
}

/* ==================================================
   FIX MODEL ORIENTATION
================================================== */

function fixCharacterOrientation() {
  if (!character) {
    return;
  }

  /*
    Your imported GLB is lying horizontally.

    X = stand model upright
    Y = turn model toward camera
    Z = sideways tilt
  */

  character.rotation.set(
    -Math.PI / 2,
    Math.PI,
    0
  );

  character.updateMatrixWorld(true);
}

/* ==================================================
   CENTER, SCALE AND PLACE MODEL
================================================== */

function centerScaleAndPlaceCharacter() {
  if (!character) {
    return;
  }

  /*
    Keep the fixed rotation, but reset position
    and scale before calculating the bounding box.
  */

  character.position.set(
    0,
    0,
    0
  );

  character.scale.set(
    1,
    1,
    1
  );

  character.updateMatrixWorld(true);

  /*
    Calculate dimensions after rotation.
  */

  const originalBox =
    new THREE.Box3().setFromObject(
      character
    );

  const originalSize =
    originalBox.getSize(
      new THREE.Vector3()
    );

  const originalCenter =
    originalBox.getCenter(
      new THREE.Vector3()
    );

  console.log(
    "Rotated model size:",
    originalSize
  );

  console.log(
    "Rotated model center:",
    originalCenter
  );

  /*
    Move the center of the model to the origin.
  */

  character.position.set(
    -originalCenter.x,
    -originalCenter.y,
    -originalCenter.z
  );

  character.updateMatrixWorld(true);

  /*
    Calculate a safe scale using model height.
  */

  const safeHeight =
    originalSize.y > 0.001
      ? originalSize.y
      : Math.max(
          originalSize.x,
          originalSize.z,
          1
        );

  const targetHeight =
    window.innerWidth <= 760
      ? 3
      : 4.1;

  const scale =
    targetHeight / safeHeight;

  character.scale.setScalar(scale);

  character.updateMatrixWorld(true);

  /*
    Recalculate after scaling.
  */

  const scaledBox =
    new THREE.Box3().setFromObject(
      character
    );

  const scaledCenter =
    scaledBox.getCenter(
      new THREE.Vector3()
    );

  /*
    Correct remaining horizontal and depth offsets.
  */

  character.position.x -=
    scaledCenter.x;

  character.position.z -=
    scaledCenter.z;

  character.updateMatrixWorld(true);

  /*
    Move the lowest point of the model to y = 0.
  */

  const finalBox =
    new THREE.Box3().setFromObject(
      character
    );

  character.position.y -=
    finalBox.min.y;

  character.updateMatrixWorld(true);

  console.log(
    "Character corrected successfully"
  );
}

/* ==================================================
   RESPONSIVE CHARACTER POSITION
================================================== */

function setResponsiveCharacterPosition() {
  if (!characterRoot) {
    return;
  }

  const isMobile =
    window.innerWidth <= 760;

  if (isMobile) {
    characterRoot.position.set(
      0,
      -1.1,
      0.4
    );

    characterRoot.scale.setScalar(
      0.82
    );

    ground.position.set(
      0,
      -1.1,
      0
    );
  } else {
    characterRoot.position.set(
      -1.9,
      -1.5,
      0
    );

    characterRoot.scale.setScalar(
      1
    );

    ground.position.set(
      -1.9,
      -1.5,
      0
    );
  }
}

/* ==================================================
   INTRO SEQUENCE
================================================== */

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

  const startX =
    isMobile
      ? -1.4
      : -4.5;

  const endX =
    isMobile
      ? 0
      : -1.9;

  characterRoot.position.x =
    startX;

  moveCharacter(
    startX,
    endX,
    2400
  );

  setTimeout(() => {
    showSignupForm();
  }, 3200);

  /*
    Small natural turn after the form appears.
  */

  setTimeout(() => {
    if (!characterRoot) {
      return;
    }

    characterRoot.rotation.y =
      -0.12;
  }, 3800);

  setTimeout(() => {
    if (!characterRoot) {
      return;
    }

    characterRoot.rotation.y =
      0;
  }, 4700);
}

/* ==================================================
   CHARACTER MOVEMENT
================================================== */

function moveCharacter(
  startX,
  endX,
  duration
) {
  const startTime =
    performance.now();

  const originalY =
    characterRoot.position.y;

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

    /*
      Very small walking-style vertical movement.
    */

    characterRoot.position.y =
      originalY +
      Math.sin(
        progress *
        Math.PI *
        8
      ) *
      0.025;

    if (progress < 1) {
      requestAnimationFrame(update);
      return;
    }

    characterRoot.position.y =
      originalY;
  }

  requestAnimationFrame(update);
}

/* ==================================================
   SHOW FORM
================================================== */

function showSignupForm() {
  if (formShown) {
    return;
  }

  formShown = true;

  signupCard.classList.add(
    "show"
  );
}

/*
  Fallback in case model loading is slow.
*/

setTimeout(() => {
  showSignupForm();
}, 6500);

/* ==================================================
   FORM VALIDATION
================================================== */

const inputs = [
  fullNameInput,
  usernameInput,
  emailInput
];

inputs.forEach((input) => {
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
  formMessage.textContent =
    message;

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

    inputs.forEach((input) => {
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

    setTimeout(() => {
      formMessage.textContent =
        "Details saved successfully.";

      formMessage.className =
        "form-message success";

      nextButton.disabled = false;

      nextButton.textContent =
        "Next";

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

/* ==================================================
   RESIZE
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
