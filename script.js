import * as THREE from "three";

import { GLTFLoader } from
  "three/addons/loaders/GLTFLoader.js";

console.log("script.js loaded");

/* ---------------------------------------------
   HTML elements
--------------------------------------------- */

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

/* ---------------------------------------------
   Scene
--------------------------------------------- */

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  40,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);

camera.position.set(0, 1.2, 8);
camera.lookAt(0, 0.8, 0);

/* ---------------------------------------------
   Renderer
--------------------------------------------- */

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

/* ---------------------------------------------
   Lights
--------------------------------------------- */

const hemisphereLight =
  new THREE.HemisphereLight(
    0xffffff,
    0x25304a,
    2.8
  );

scene.add(hemisphereLight);

const mainLight =
  new THREE.DirectionalLight(
    0xffffff,
    3.4
  );

mainLight.position.set(2, 6, 7);
mainLight.castShadow = true;

scene.add(mainLight);

const blueLight =
  new THREE.PointLight(
    0x568bff,
    25,
    20
  );

blueLight.position.set(-4, 2, 4);

scene.add(blueLight);

const warmLight =
  new THREE.PointLight(
    0xff9d68,
    28,
    20
  );

warmLight.position.set(4, 3, 4);

scene.add(warmLight);

/* ---------------------------------------------
   Ground
--------------------------------------------- */

const groundGeometry =
  new THREE.CircleGeometry(2.4, 64);

const groundMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x141923,
    transparent: true,
    opacity: 0.4,
    roughness: 0.9
  });

const ground =
  new THREE.Mesh(
    groundGeometry,
    groundMaterial
  );

ground.rotation.x = -Math.PI / 2;
ground.position.set(-1.9, -1.65, 0);
ground.receiveShadow = true;

scene.add(ground);

/* ---------------------------------------------
   Character variables
--------------------------------------------- */

let character = null;
let characterRoot = null;
let mixer = null;
let idleAction = null;

let introStarted = false;
let formShown = false;

const clock = new THREE.Clock();

/* ---------------------------------------------
   Load GLB
--------------------------------------------- */

const gltfLoader = new GLTFLoader();

gltfLoader.load(
  "./models/character_optimized.glb",

  (gltf) => {
    console.log(
      "GLB loaded successfully",
      gltf
    );

    character = gltf.scene;

    character.traverse((object) => {
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

    characterRoot =
      new THREE.Group();

    characterRoot.add(character);

    scene.add(characterRoot);

    centerAndScaleCharacter();

    setCharacterPosition();

    /*
      Use only animations already inside the GLB.
      Do not load the FBX files here.
    */

    if (
      gltf.animations &&
      gltf.animations.length > 0
    ) {
      console.log(
        "Embedded animations:",
        gltf.animations.map(
          (clip) => clip.name
        )
      );

      mixer =
        new THREE.AnimationMixer(character);

      idleAction =
        mixer.clipAction(
          gltf.animations[0]
        );

      idleAction.setLoop(
        THREE.LoopRepeat,
        Infinity
      );

      idleAction.play();
    } else {
      console.log(
        "No embedded GLB animation found"
      );
    }

    modelLoader.classList.add("hide");

    startIntro();
  },

  (progress) => {
    if (
      progress.total &&
      progress.total > 0
    ) {
      const percent =
        Math.round(
          (
            progress.loaded /
            progress.total
          ) * 100
        );

      modelLoader.textContent =
        `Loading character ${percent}%`;
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
      modelLoader.classList.add("hide");
      showSignupForm();
    }, 1200);
  }
);

/* ---------------------------------------------
   Center and scale
--------------------------------------------- */

function centerAndScaleCharacter() {
  if (!character) {
    return;
  }

  character.position.set(0, 0, 0);
  character.rotation.set(0, 0, 0);
  character.scale.set(1, 1, 1);

  character.updateMatrixWorld(true);

  const box =
    new THREE.Box3().setFromObject(
      character
    );

  const size =
    box.getSize(
      new THREE.Vector3()
    );

  const center =
    box.getCenter(
      new THREE.Vector3()
    );

  console.log(
    "Original size:",
    size
  );

  character.position.set(
    -center.x,
    -center.y,
    -center.z
  );

  const safeHeight =
    size.y > 0.001
      ? size.y
      : 1;

  const targetHeight =
    window.innerWidth <= 760
      ? 3
      : 4.1;

  const scale =
    targetHeight / safeHeight;

  character.scale.setScalar(scale);

  character.updateMatrixWorld(true);

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

  const finalBox =
    new THREE.Box3().setFromObject(
      character
    );

  character.position.y -=
    finalBox.min.y;

  /*
    Change this to Math.PI if the back
    of the character faces the camera.
  */

  character.rotation.y = 0;
}

/* ---------------------------------------------
   Responsive placement
--------------------------------------------- */

function setCharacterPosition() {
  if (!characterRoot) {
    return;
  }

  if (window.innerWidth <= 760) {
    characterRoot.position.set(
      0,
      -1.15,
      0.3
    );

    characterRoot.scale.setScalar(0.82);

    ground.position.set(
      0,
      -1.2,
      0
    );
  } else {
    characterRoot.position.set(
      -1.9,
      -1.65,
      0
    );

    characterRoot.scale.setScalar(1);

    ground.position.set(
      -1.9,
      -1.65,
      0
    );
  }
}

/* ---------------------------------------------
   Intro movement
--------------------------------------------- */

function startIntro() {
  if (
    introStarted ||
    !characterRoot
  ) {
    return;
  }

  introStarted = true;

  const mobile =
    window.innerWidth <= 760;

  const startX =
    mobile ? -1.4 : -4.5;

  const endX =
    mobile ? 0 : -1.9;

  characterRoot.position.x =
    startX;

  moveCharacter(
    startX,
    endX,
    2500
  );

  setTimeout(() => {
    showSignupForm();
  }, 3200);

  /*
    Simple natural body movement.
    This avoids incompatible FBX skeletons.
  */

  const originalRotation =
    characterRoot.rotation.y;

  setTimeout(() => {
    characterRoot.rotation.y =
      originalRotation - 0.12;
  }, 3800);

  setTimeout(() => {
    characterRoot.rotation.y =
      originalRotation;
  }, 4600);
}

function moveCharacter(
  startX,
  endX,
  duration
) {
  const startTime =
    performance.now();

  function update(time) {
    if (!characterRoot) {
      return;
    }

    const elapsed =
      time - startTime;

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
    */

    characterRoot.position.y +=
      Math.sin(progress * Math.PI * 8) *
      0.002;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

/* ---------------------------------------------
   Form
--------------------------------------------- */

function showSignupForm() {
  if (formShown) {
    return;
  }

  formShown = true;

  signupCard.classList.add("show");
}

setTimeout(() => {
  showSignupForm();
}, 6000);

/* ---------------------------------------------
   Validation
--------------------------------------------- */

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

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
}

function showError(
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
      showError(
        "Please enter your name.",
        fullNameInput
      );

      return;
    }

    if (!username) {
      showError(
        "Please enter a username.",
        usernameInput
      );

      return;
    }

    if (username.length < 3) {
      showError(
        "Username must contain at least 3 characters.",
        usernameInput
      );

      return;
    }

    if (!email) {
      showError(
        "Please enter your email address.",
        emailInput
      );

      return;
    }

    if (!validEmail(email)) {
      showError(
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

/* ---------------------------------------------
   Render
--------------------------------------------- */

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

/* ---------------------------------------------
   Resize
--------------------------------------------- */

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

    setCharacterPosition();
  }
);
