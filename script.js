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
   REQUIRED ELEMENT CHECK
================================================== */

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
  throw new Error(
    "Required HTML elements are missing. Check the element IDs in index.html."
  );
}

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

camera.position.set(
  0,
  1.2,
  8
);

camera.lookAt(
  0,
  0.7,
  0
);

/* ==================================================
   RENDERER
================================================== */

const renderer =
  new THREE.WebGLRenderer({
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

const frontLight =
  new THREE.DirectionalLight(
    0xffffff,
    3.5
  );

frontLight.position.set(
  2,
  6,
  7
);

frontLight.castShadow = true;

scene.add(frontLight);

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
    opacity: 0.4,
    roughness: 0.9,
    depthWrite: false
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

const MODEL_PATH =
  "./models/character_optimized.glb";

let character = null;
let characterRoot = null;

let introStarted = false;
let formShown = false;
let modelLoaded = false;

/* ==================================================
   LOADER MESSAGE
================================================== */

function setLoaderMessage(message) {
  modelLoader.textContent = message;

  console.log(message);
}

function hideLoader() {
  modelLoader.classList.add("hide");
}

/* ==================================================
   LOAD CHARACTER
================================================== */

const gltfLoader =
  new GLTFLoader();

setLoaderMessage(
  "Loading character..."
);

console.log(
  "Loading model:",
  MODEL_PATH
);

gltfLoader.load(
  MODEL_PATH,

  (gltf) => {
    console.log(
      "GLB loaded successfully:",
      gltf
    );

    character = gltf.scene;

    /*
      Do not play GLB animations automatically.
      The first embedded animation may deform the model.
    */

    console.log(
      "Embedded animations found:",
      gltf.animations.map(
        (clip) => clip.name
      )
    );

    prepareCharacter(character);

    restoreSkeletonPose(character);

    characterRoot =
      new THREE.Group();

    characterRoot.name =
      "CharacterRoot";

    characterRoot.add(character);

    scene.add(characterRoot);

    /*
      Only rotate around the Y axis.

      Do not use:
      character.rotation.x = -Math.PI / 2

      That caused the model to break or appear sideways.
    */

    character.rotation.set(
      0,
      Math.PI,
      0
    );

    character.updateMatrixWorld(true);

    centerAndScaleCharacter();

    setResponsiveCharacterPosition();

    modelLoaded = true;

    hideLoader();

    console.log(
      "Character loaded in stable rest pose"
    );

    startIntroSequence();
  },

  (progress) => {
    if (
      Number.isFinite(progress.total) &&
      progress.total > 0
    ) {
      const percentage =
        Math.round(
          (
            progress.loaded /
            progress.total
          ) * 100
        );

      setLoaderMessage(
        `Loading character ${percentage}%`
      );
    }
  },

  (error) => {
    console.error(
      "GLB loading failed:",
      error
    );

    setLoaderMessage(
      "Character could not be loaded"
    );

    setTimeout(() => {
      hideLoader();
      showSignupForm();
    }, 1500);
  }
);

/* ==================================================
   PREPARE MODEL
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

        material.map.needsUpdate =
          true;
      }

      material.needsUpdate = true;
    });
  });
}

/* ==================================================
   RESTORE ORIGINAL SKELETON POSE
================================================== */

function restoreSkeletonPose(model) {
  model.traverse((object) => {
    if (
      object.isSkinnedMesh &&
      object.skeleton
    ) {
      object.skeleton.pose();

      object.skeleton.update();
    }
  });

  model.updateMatrixWorld(true);

  console.log(
    "Skeleton rest pose restored"
  );
}

/* ==================================================
   CENTER AND SCALE CHARACTER
================================================== */

function centerAndScaleCharacter() {
  if (!character) {
    return;
  }

  /*
    Keep the Y rotation, but reset position and scale.
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

  const initialBox =
    new THREE.Box3().setFromObject(
      character
    );

  const initialSize =
    initialBox.getSize(
      new THREE.Vector3()
    );

  const initialCenter =
    initialBox.getCenter(
      new THREE.Vector3()
    );

  console.log(
    "Initial model size:",
    initialSize
  );

  console.log(
    "Initial model center:",
    initialCenter
  );

  if (
    initialSize.x <= 0 ||
    initialSize.y <= 0 ||
    initialSize.z <= 0
  ) {
    console.error(
      "Invalid model dimensions:",
      initialSize
    );

    return;
  }

  /*
    Move model center to local origin.
  */

  character.position.set(
    -initialCenter.x,
    -initialCenter.y,
    -initialCenter.z
  );

  character.updateMatrixWorld(true);

  /*
    Automatically scale the character.
  */

  const targetHeight =
    window.innerWidth <= 760
      ? 3
      : 4;

  const scale =
    targetHeight /
    initialSize.y;

  character.scale.setScalar(scale);

  character.updateMatrixWorld(true);

  /*
    Recalculate the model after scaling.
  */

  const scaledBox =
    new THREE.Box3().setFromObject(
      character
    );

  const scaledCenter =
    scaledBox.getCenter(
      new THREE.Vector3()
    );

  character.position.x -=
    scaledCenter.x;

  character.position.z -=
    scaledCenter.z;

  character.updateMatrixWorld(true);

  /*
    Place the model's lowest point on y = 0.
  */

  const finalBox =
    new THREE.Box3().setFromObject(
      character
    );

  character.position.y -=
    finalBox.min.y;

  character.updateMatrixWorld(true);

  const finalSize =
    new THREE.Box3()
      .setFromObject(character)
      .getSize(new THREE.Vector3());

  console.log(
    "Final model size:",
    finalSize
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
      -1.15,
      0.4
    );

    characterRoot.scale.setScalar(
      0.82
    );

    ground.position.set(
      0,
      -1.15,
      0
    );
  } else {
    characterRoot.position.set(
      -1.9,
      -1.55,
      0
    );

    characterRoot.scale.setScalar(
      1
    );

    ground.position.set(
      -1.9,
      -1.55,
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
    Small whole-model turn.
    This does not modify bones or the skeleton.
  */

  setTimeout(() => {
    if (!characterRoot) {
      return;
    }

    characterRoot.rotation.y =
      -0.1;
  }, 3900);

  setTimeout(() => {
    if (!characterRoot) {
      return;
    }

    characterRoot.rotation.y = 0;
  }, 4800);
}

/* ==================================================
   MOVE CHARACTER
================================================== */

function moveCharacter(
  startX,
  endX,
  duration
) {
  if (!characterRoot) {
    return;
  }

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
      Small vertical movement while entering.
      This moves the entire model, not its bones.
    */

    characterRoot.position.y =
      originalY +
      Math.sin(
        progress *
        Math.PI *
        8
      ) *
      0.018;

    if (progress < 1) {
      requestAnimationFrame(update);
      return;
    }

    characterRoot.position.x =
      endX;

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
  Form fallback.
*/

setTimeout(() => {
  showSignupForm();
}, 6500);

/* ==================================================
   FORM INPUT HANDLING
================================================== */

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

/* ==================================================
   EMAIL VALIDATION
================================================== */

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
}

/* ==================================================
   DISPLAY VALIDATION ERROR
================================================== */

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

/* ==================================================
   FORM SUBMIT
================================================== */

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

      nextButton.textContent =
        "Next";

      console.log(
        "Form submitted:",
        {
          fullName,
          username,
          email,
          modelLoaded
        }
      );
    }, 700);
  }
);

/* ==================================================
   RENDER LOOP
================================================== */

function animate() {
  requestAnimationFrame(animate);

  renderer.render(
    scene,
    camera
  );
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
