"use strict";

/* =========================================
   ELEMENTS
========================================= */

const introVideo =
  document.getElementById("introVideo");

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

const replayButton =
  document.getElementById("replayButton");

/* =========================================
   SETTINGS
========================================= */

/*
  Change this value if the form appears too
  early or too late in the video.
*/
const FORM_SHOW_TIME = 4.8;

let formShown = false;

/* =========================================
   SHOW FORM
========================================= */

function showSignupForm() {
  if (formShown) {
    return;
  }

  formShown = true;

  signupCard.classList.add("show");
  introVideo.classList.add("form-active");
}

/* =========================================
   HIDE FORM
========================================= */

function hideSignupForm() {
  formShown = false;

  signupCard.classList.remove("show");
  introVideo.classList.remove("form-active");
}

/* =========================================
   START VIDEO
========================================= */

async function startVideo() {
  introVideo.muted = true;

  try {
    await introVideo.play();

    console.log("Video started successfully");
  } catch (error) {
    console.warn(
      "Video autoplay was blocked:",
      error
    );
  }
}

/* =========================================
   VIDEO EVENTS
========================================= */

introVideo.addEventListener(
  "loadedmetadata",
  () => {
    console.log(
      "Video duration:",
      introVideo.duration
    );

    startVideo();
  }
);

introVideo.addEventListener(
  "timeupdate",
  () => {
    if (
      introVideo.currentTime >=
      FORM_SHOW_TIME
    ) {
      showSignupForm();
    }
  }
);

introVideo.addEventListener(
  "ended",
  () => {
    showSignupForm();

    replayButton.classList.add("show");
  }
);

introVideo.addEventListener(
  "error",
  () => {
    console.error(
      "153106.mp4 could not be loaded."
    );

    showSignupForm();

    replayButton.classList.add("show");
  }
);

/*
  Fallback in case video events do not fire.
*/

setTimeout(() => {
  if (!formShown) {
    showSignupForm();
  }
}, 6000);

/* =========================================
   REPLAY BUTTON
========================================= */

replayButton.addEventListener(
  "click",
  async () => {
    hideSignupForm();

    replayButton.classList.remove("show");

    introVideo.currentTime = 0;

    try {
      await introVideo.play();
    } catch (error) {
      console.error(
        "Video replay failed:",
        error
      );

      showSignupForm();
    }
  }
);

/* =========================================
   INPUT RESET
========================================= */

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

/* =========================================
   EMAIL VALIDATION
========================================= */

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
}

/* =========================================
   ERROR MESSAGE
========================================= */

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

/* =========================================
   FORM SUBMIT
========================================= */

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
        "Please enter your username.",
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

/* =========================================
   PAGE LOAD
========================================= */

window.addEventListener(
  "load",
  () => {
    startVideo();
  }
);
