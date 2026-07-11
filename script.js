import * as THREE from "three";

import { GLTFLoader } from
  "three/addons/loaders/GLTFLoader.js";


/* ======================================
   3D CHARACTER
====================================== */

const canvas =
  document.getElementById("character-canvas");

const characterSection =
  document.querySelector(".character-section");

const modelStatus =
  document.getElementById("model-status");

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  32,
  characterSection.clientWidth /
    characterSection.clientHeight,
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
  characterSection.clientWidth,
  characterSection.clientHeight
);

renderer.outputColorSpace =
  THREE.SRGBColorSpace;

renderer.shadowMap.enabled = true;

renderer.shadowMap.type =
  THREE.PCFSoftShadowMap;


/* LIGHTS */

const ambientLight = new THREE.AmbientLight(
  0xffffff,
  2.2
);

scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(
  0xffffff,
  4
);

keyLight.position.set(4, 7, 5);
keyLight.castShadow = true;

scene.add(keyLight);

const warmLight = new THREE.PointLight(
  0xff8c4b,
  18,
  12
);

warmLight.position.set(-3, 2, 3);

scene.add(warmLight);

const blueLight = new THREE.PointLight(
  0x579eff,
  14,
  10
);

blueLight.position.set(3, 2, 1);

scene.add(blueLight);


/* FLOOR SHADOW */

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(2, 64),

  new THREE.ShadowMaterial({
    color: 0x000000,
    opacity: 0.35
  })
);

floor.rotation.x = -Math.PI / 2;
floor.position.y = -1.65;
floor.receiveShadow = true;

scene.add(floor);


/* LOAD MODEL */

const loader = new GLTFLoader();

const clock = new THREE.Clock();

let character = null;
let mixer = null;
let currentAction = null;

let targetRotationY = 0.17;
let targetRotationX = 0;

loader.load(
  "models/character_optimized.glb",

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

    positionCharacter(character);

    if (gltf.animations.length > 0) {
      mixer = new THREE.AnimationMixer(character);

      const idleClip =
        gltf.animations.find(animation =>
          animation.name
            .toLowerCase()
            .includes("idle")
        ) || gltf.animations[0];

      currentAction =
        mixer.clipAction(idleClip);

      currentAction.play();

      console.log(
        "GLB animations:",
        gltf.animations.map(animation =>
          animation.name
        )
      );
    }

    modelStatus.classList.add("hidden");
  },

  function (progress) {
    if (progress.total > 0) {
      const percent = Math.round(
        progress.loaded /
        progress.total *
        100
      );

      modelStatus.textContent =
        `Loading character... ${percent}%`;
    }
  },

  function (error) {
    console.error(
      "Character loading error:",
      error
    );

    modelStatus.textContent =
      "Character could not be loaded. Check models/character_optimized.glb";
  }
);


function positionCharacter(model) {
  const box =
    new THREE.Box3().setFromObject(model);

  const size =
    box.getSize(new THREE.Vector3());

  const center =
    box.getCenter(new THREE.Vector3());

  model.position.x -= center.x;
  model.position.y -= center.y;
  model.position.z -= center.z;

  const modelHeight = size.y;

  const scale = 4.1 / modelHeight;

  model.scale.setScalar(scale);

  const finalBox =
    new THREE.Box3().setFromObject(model);

  const finalCenter =
    finalBox.getCenter(
      new THREE.Vector3()
    );

  model.position.x -= finalCenter.x;
  model.position.z -= finalCenter.z;

  model.position.y =
    -finalBox.min.y - 1.65;

  model.position.x = -0.25;

  model.rotation.y = 0.17;
}


/* MOUSE REACTION */

window.addEventListener(
  "mousemove",
  function (event) {
    const x =
      event.clientX /
      window.innerWidth *
      2 - 1;

    const y =
      event.clientY /
      window.innerHeight *
      2 - 1;

    targetRotationY =
      0.17 + x * 0.12;

    targetRotationX =
      y * 0.025;
  }
);


/* RENDER */

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();

  if (mixer) {
    mixer.update(delta);
  }

  if (character) {
    character.rotation.y +=
      (
        targetRotationY -
        character.rotation.y
      ) * 0.04;

    character.rotation.x +=
      (
        targetRotationX -
        character.rotation.x
      ) * 0.04;
  }

  renderer.render(scene, camera);
}

animate();


window.addEventListener(
  "resize",
  function () {
    const width =
      characterSection.clientWidth;

    const height =
      characterSection.clientHeight;

    camera.aspect = width / height;

    camera.updateProjectionMatrix();

    renderer.setSize(width, height);

    renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio,
        2
      )
    );
  }
);


/* ======================================
   FORM SWITCHING
====================================== */

const loginTab =
  document.getElementById("login-tab");

const signupTab =
  document.getElementById("signup-tab");

const loginForm =
  document.getElementById("login-form");

const signupForm =
  document.getElementById("signup-form");

const openSignup =
  document.getElementById("open-signup");

const openLogin =
  document.getElementById("open-login");


function showLoginForm() {
  loginForm.classList.remove("hidden");
  signupForm.classList.add("hidden");

  loginTab.classList.add("active");
  signupTab.classList.remove("active");
}


function showSignupForm() {
  signupForm.classList.remove("hidden");
  loginForm.classList.add("hidden");

  signupTab.classList.add("active");
  loginTab.classList.remove("active");
}


loginTab.addEventListener(
  "click",
  showLoginForm
);

signupTab.addEventListener(
  "click",
  showSignupForm
);

openSignup.addEventListener(
  "click",
  showSignupForm
);

openLogin.addEventListener(
  "click",
  showLoginForm
);


/* ======================================
   PASSWORD SHOW / HIDE
====================================== */

document
  .querySelectorAll(".password-toggle")
  .forEach(function (button) {
    button.addEventListener(
      "click",
      function () {
        const input =
          document.getElementById(
            button.dataset.target
          );

        const hidden =
          input.type === "password";

        input.type =
          hidden ? "text" : "password";

        button.textContent =
          hidden ? "🙈" : "👁";
      }
    );
  });


/* ======================================
   VALIDATION
====================================== */

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    .test(email);
}


function setError(
  input,
  errorElement,
  message
) {
  errorElement.textContent = message;

  input
    .closest(".input-box")
    .classList.add("error");
}


function clearError(input, errorElement) {
  errorElement.textContent = "";

  input
    .closest(".input-box")
    .classList.remove("error");
}


function makeCharacterReact(type) {
  if (!character) {
    return;
  }

  if (type === "success") {
    const originalY =
      character.position.y;

    let count = 0;

    const jumping =
      setInterval(function () {
        character.position.y =
          originalY +
          (
            count % 2 === 0
              ? 0.13
              : 0
          );

        count++;

        if (count > 5) {
          clearInterval(jumping);

          character.position.y =
            originalY;
        }
      }, 120);
  }

  if (type === "error") {
    const originalZ =
      character.rotation.z;

    let count = 0;

    const shaking =
      setInterval(function () {
        character.rotation.z =
          count % 2 === 0
            ? 0.045
            : -0.045;

        count++;

        if (count > 7) {
          clearInterval(shaking);

          character.rotation.z =
            originalZ;
        }
      }, 70);
  }
}


/* ======================================
   LOGIN
====================================== */

const loginEmail =
  document.getElementById("login-email");

const loginPassword =
  document.getElementById(
    "login-password"
  );

const loginEmailError =
  document.getElementById(
    "login-email-error"
  );

const loginPasswordError =
  document.getElementById(
    "login-password-error"
  );

const loginSubmit =
  document.getElementById(
    "login-submit"
  );


loginForm.addEventListener(
  "submit",
  async function (event) {
    event.preventDefault();

    clearError(
      loginEmail,
      loginEmailError
    );

    clearError(
      loginPassword,
      loginPasswordError
    );

    const email =
      loginEmail.value.trim();

    const password =
      loginPassword.value.trim();

    let valid = true;

    if (!email) {
      setError(
        loginEmail,
        loginEmailError,
        "Enter your email address."
      );

      valid = false;
    } else if (!isValidEmail(email)) {
      setError(
        loginEmail,
        loginEmailError,
        "Enter a valid email address."
      );

      valid = false;
    }

    if (!password) {
      setError(
        loginPassword,
        loginPasswordError,
        "Enter your password."
      );

      valid = false;
    } else if (password.length < 6) {
      setError(
        loginPassword,
        loginPasswordError,
        "Password must have at least 6 characters."
      );

      valid = false;
    }

    if (!valid) {
      makeCharacterReact("error");

      showToast(
        "Check the highlighted fields.",
        "error"
      );

      return;
    }

    loginSubmit.disabled = true;
    loginSubmit.textContent =
      "Signing in...";

    try {
      /*
        Add your Firebase login code here:

        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
      */

      await delay(1000);

      makeCharacterReact("success");

      showToast(
        "Login successful.",
        "success"
      );

    } catch (error) {
      console.error(error);

      makeCharacterReact("error");

      showToast(
        error.message ||
        "Login failed.",
        "error"
      );

    } finally {
      loginSubmit.disabled = false;
      loginSubmit.textContent =
        "Sign In";
    }
  }
);


/* ======================================
   SIGN UP
====================================== */

const signupName =
  document.getElementById("signup-name");

const signupEmail =
  document.getElementById("signup-email");

const signupPassword =
  document.getElementById(
    "signup-password"
  );

const signupNameError =
  document.getElementById(
    "signup-name-error"
  );

const signupEmailError =
  document.getElementById(
    "signup-email-error"
  );

const signupPasswordError =
  document.getElementById(
    "signup-password-error"
  );

const signupSubmit =
  document.getElementById(
    "signup-submit"
  );


signupForm.addEventListener(
  "submit",
  async function (event) {
    event.preventDefault();

    clearError(
      signupName,
      signupNameError
    );

    clearError(
      signupEmail,
      signupEmailError
    );

    clearError(
      signupPassword,
      signupPasswordError
    );

    const name =
      signupName.value.trim();

    const email =
      signupEmail.value.trim();

    const password =
      signupPassword.value.trim();

    let valid = true;

    if (!name) {
      setError(
        signupName,
        signupNameError,
        "Enter your name."
      );

      valid = false;
    }

    if (!email) {
      setError(
        signupEmail,
        signupEmailError,
        "Enter your email address."
      );

      valid = false;
    } else if (!isValidEmail(email)) {
      setError(
        signupEmail,
        signupEmailError,
        "Enter a valid email address."
      );

      valid = false;
    }

    if (!password) {
      setError(
        signupPassword,
        signupPasswordError,
        "Create a password."
      );

      valid = false;
    } else if (password.length < 6) {
      setError(
        signupPassword,
        signupPasswordError,
        "Password must have at least 6 characters."
      );

      valid = false;
    }

    if (!valid) {
      makeCharacterReact("error");

      showToast(
        "Check the highlighted fields.",
        "error"
      );

      return;
    }

    signupSubmit.disabled = true;
    signupSubmit.textContent =
      "Creating account...";

    try {
      /*
        Add Firebase registration code here:

        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
      */

      await delay(1000);

      makeCharacterReact("success");

      showToast(
        "Account created successfully.",
        "success"
      );

      setTimeout(showLoginForm, 1000);

    } catch (error) {
      console.error(error);

      makeCharacterReact("error");

      showToast(
        error.message ||
        "Account creation failed.",
        "error"
      );

    } finally {
      signupSubmit.disabled = false;
      signupSubmit.textContent =
        "Create Account";
    }
  }
);


/* ======================================
   OTHER BUTTONS
====================================== */

document
  .getElementById("google-login")
  .addEventListener(
    "click",
    function () {
      showToast(
        "Connect your Firebase Google login here.",
        "success"
      );
    }
  );


document
  .getElementById("forgot-password")
  .addEventListener(
    "click",
    function () {
      const email =
        loginEmail.value.trim();

      if (!email) {
        setError(
          loginEmail,
          loginEmailError,
          "Enter your email first."
        );

        loginEmail.focus();

        return;
      }

      if (!isValidEmail(email)) {
        setError(
          loginEmail,
          loginEmailError,
          "Enter a valid email address."
        );

        loginEmail.focus();

        return;
      }

      /*
        Add Firebase reset code here:

        await sendPasswordResetEmail(
          auth,
          email
        );
      */

      showToast(
        "Password reset link will be sent.",
        "success"
      );
    }
  );


/* ======================================
   TOAST
====================================== */

const toast =
  document.getElementById("toast");

const toastIcon =
  document.getElementById("toast-icon");

const toastMessage =
  document.getElementById(
    "toast-message"
  );

let toastTimer;


function showToast(message, type) {
  clearTimeout(toastTimer);

  toastMessage.textContent = message;

  toast.classList.remove(
    "error",
    "success"
  );

  toast.classList.add(type);

  toastIcon.textContent =
    type === "error" ? "!" : "✓";

  toast.classList.add("show");

  toastTimer =
    setTimeout(function () {
      toast.classList.remove("show");
    }, 3200);
}


function delay(milliseconds) {
  return new Promise(resolve =>
    setTimeout(resolve, milliseconds)
  );
}
