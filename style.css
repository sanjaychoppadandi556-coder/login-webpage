* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  width: 100%;
  height: 100%;
}

body {
  overflow: hidden;
  font-family: Arial, Helvetica, sans-serif;
  background: #050711;
}

button,
input {
  font: inherit;
}

.login-page {
  position: relative;
  width: 100vw;
  height: 100vh;
  min-height: 560px;
  overflow: hidden;
  isolation: isolate;
}

/* Background */

.space-background {
  position: absolute;
  inset: 0;
  z-index: -5;
  overflow: hidden;

  background:
    radial-gradient(
      circle at 30% 58%,
      rgba(24, 94, 186, 0.42),
      transparent 34%
    ),
    radial-gradient(
      circle at 75% 22%,
      rgba(237, 121, 63, 0.38),
      transparent 27%
    ),
    linear-gradient(
      115deg,
      #02040a 0%,
      #090e1a 40%,
      #151724 68%,
      #090911 100%
    );
}

.space-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(28px);
  pointer-events: none;
}

.blue-glow {
  left: 15%;
  bottom: 5%;

  width: 52vw;
  height: 52vw;

  background: radial-gradient(
    circle,
    rgba(37, 116, 255, 0.28),
    transparent 67%
  );
}

.orange-glow {
  top: -12%;
  right: -2%;

  width: 45vw;
  height: 45vw;

  background: radial-gradient(
    circle,
    rgba(255, 133, 77, 0.26),
    transparent 68%
  );
}

/* Stars */

.stars {
  position: absolute;
  inset: -50%;
  width: 200%;
  height: 200%;
  background-repeat: repeat;
  pointer-events: none;
}

.stars-one {
  opacity: 0.82;

  background-image:
    radial-gradient(circle, #ffffff 1px, transparent 1.2px),
    radial-gradient(circle, #9fb6ff 1px, transparent 1.2px);

  background-size:
    74px 74px,
    118px 118px;

  background-position:
    12px 18px,
    38px 65px;

  animation: moveStars 60s linear infinite;
}

.stars-two {
  opacity: 0.4;

  background-image:
    radial-gradient(circle, #ffffff 1.3px, transparent 1.5px),
    radial-gradient(circle, #ffd2b0 1px, transparent 1.2px);

  background-size:
    165px 165px,
    230px 230px;

  background-position:
    40px 20px,
    95px 110px;

  animation: moveStars 85s linear infinite reverse;
}

@keyframes moveStars {
  from {
    transform: translate3d(0, 0, 0);
  }

  to {
    transform: translate3d(180px, 120px, 0);
  }
}

/* Planets */

.planet {
  position: absolute;
  border-radius: 50%;

  background:
    radial-gradient(
      circle at 30% 28%,
      #c6aa95,
      #665451 46%,
      #16141b 76%
    );

  box-shadow:
    inset -12px -15px 22px rgba(0, 0, 0, 0.65),
    0 0 24px rgba(255, 181, 130, 0.17);
}

.planet-one {
  top: 13%;
  right: 14%;

  width: 25px;
  height: 25px;

  animation: floatPlanet 7s ease-in-out infinite;
}

.planet-two {
  top: 30%;
  right: 31%;

  width: 12px;
  height: 12px;

  opacity: 0.75;

  animation: floatPlanet 9s ease-in-out infinite reverse;
}

@keyframes floatPlanet {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-14px);
  }
}

/* Three.js */

#characterContainer {
  position: absolute;
  inset: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

#characterContainer canvas {
  display: block;
  width: 100%;
  height: 100%;
}

/* Loader */

.model-loader {
  position: absolute;
  z-index: 10;

  top: 50%;
  left: 26%;

  padding: 10px 15px;

  color: #ffffff;
  font-size: 14px;

  background: rgba(0, 0, 0, 0.58);
  border: 1px solid rgba(255, 255, 255, 0.17);
  border-radius: 8px;

  transform: translate(-50%, -50%);

  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);

  transition:
    opacity 0.4s ease,
    visibility 0.4s ease;
}

.model-loader.hide {
  opacity: 0;
  visibility: hidden;
}

/* Signup card */

.signup-card {
  position: absolute;
  z-index: 5;

  top: 50%;
  left: 68%;

  width: min(320px, 39vw);
  padding: 28px 24px 24px;

  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.75);
  border-radius: 11px;

  box-shadow:
    0 24px 65px rgba(0, 0, 0, 0.52),
    0 0 26px rgba(255, 255, 255, 0.17);

  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);

  opacity: 0;
  visibility: hidden;

  transform:
    translate(-50%, -38%)
    scale(0.76);

  transition:
    opacity 0.7s ease,
    visibility 0.7s ease,
    transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.signup-card.show {
  opacity: 1;
  visibility: visible;

  transform:
    translate(-50%, -50%)
    scale(1);
}

.signup-card h1 {
  margin-bottom: 21px;
  color: #202020;
  font-size: 29px;
  font-weight: 700;
  text-align: center;
}

/* Inputs */

.input-box {
  position: relative;
  width: 100%;
  margin-bottom: 13px;
}

.field-icon {
  position: absolute;
  z-index: 2;

  top: 50%;
  left: 12px;

  color: #979797;
  font-size: 14px;

  transform: translateY(-50%);
  pointer-events: none;
}

.input-box input {
  width: 100%;
  height: 43px;

  padding: 0 13px 0 36px;

  color: #252525;
  font-size: 14px;

  background: rgba(255, 255, 255, 0.85);
  border: 1px solid #d5d5d5;
  border-radius: 5px;

  outline: none;

  transition:
    border-color 0.22s ease,
    box-shadow 0.22s ease,
    transform 0.22s ease;
}

.input-box input::placeholder {
  color: #9f9f9f;
}

.input-box input:focus {
  border-color: #05babc;

  box-shadow:
    0 0 0 3px rgba(5, 186, 188, 0.15);

  transform: translateY(-1px);
}

.input-box input.error {
  border-color: #e04848;

  box-shadow:
    0 0 0 3px rgba(224, 72, 72, 0.12);
}

/* Button */

#nextButton {
  width: 100%;
  height: 43px;
  margin-top: 2px;

  color: #ffffff;
  font-size: 15px;
  font-weight: 600;

  background: linear-gradient(
    135deg,
    #08cbcd,
    #02acb1
  );

  border: none;
  border-radius: 5px;

  cursor: pointer;

  box-shadow:
    0 9px 20px rgba(0, 183, 187, 0.31);

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    filter 0.2s ease;
}

#nextButton:hover {
  filter: brightness(1.06);

  transform: translateY(-2px);

  box-shadow:
    0 12px 25px rgba(0, 183, 187, 0.38);
}

#nextButton:active {
  transform: scale(0.98);
}

#nextButton:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Message */

.form-message {
  min-height: 18px;
  margin-top: 10px;

  font-size: 12px;
  text-align: center;
}

.form-message.error {
  color: #d63838;
}

.form-message.success {
  color: #078b5f;
}

/* Shake */

.signup-card.shake {
  animation: shakeCard 0.4s ease;
}

@keyframes shakeCard {
  0%,
  100% {
    margin-left: 0;
  }

  25% {
    margin-left: -8px;
  }

  50% {
    margin-left: 8px;
  }

  75% {
    margin-left: -5px;
  }
}

/* Mobile */

@media (max-width: 760px) {
  .signup-card {
    top: auto;
    bottom: 22px;
    left: 50%;

    width: calc(100% - 34px);
    max-width: 365px;

    padding: 21px 20px;

    transform:
      translate(-50%, 34px)
      scale(0.88);
  }

  .signup-card.show {
    transform:
      translate(-50%, 0)
      scale(1);
  }

  .signup-card h1 {
    margin-bottom: 16px;
    font-size: 25px;
  }

  .model-loader {
    top: 30%;
    left: 50%;
  }
}

@media (max-height: 620px) {
  .signup-card {
    padding-top: 18px;
    padding-bottom: 16px;
  }

  .signup-card h1 {
    margin-bottom: 14px;
    font-size: 24px;
  }

  .input-box {
    margin-bottom: 9px;
  }

  .input-box input,
  #nextButton {
    height: 39px;
  }
}
