async function loadCharacter() {
  loadingText.textContent = "Loading character model...";

  fbxLoader.load(
    "./models/character_optimized.fbx",

    async (fbx) => {

      character = fbx;

      // Keep the model upright
      character.rotation.set(0, 0, 0);

      // Reset position
      character.position.set(0, 0, 0);

      prepareCharacter(character);
      fitCharacterToScene(character);

      // Lift slightly above ground
      character.position.y += 0.02;

      scene.add(character);

      mixer = new THREE.AnimationMixer(character);

      try {

        const animationEntries = Object.entries(animationFiles);

        for (const [name, path] of animationEntries) {

          loadingText.textContent =
            `Loading ${name} animation...`;

          await loadFBXAnimation(name, path);
        }

        playAnimation("idle");

        loadingScreen.style.display = "none";

      } catch (error) {

        console.error("Animation loading error:", error);

        loadingText.textContent =
          "Character loaded, but an animation failed.";

        setTimeout(() => {
          loadingScreen.style.display = "none";
        }, 2000);
      }
    },

    (progress) => {

      if (progress.total) {

        const percent = Math.round(
          progress.loaded / progress.total * 100
        );

        loadingText.textContent =
          `Loading character: ${percent}%`;
      }
    },

    (error) => {

      console.error(error);

      loadingText.textContent =
        "Failed to load character_optimized.fbx";
    }
  );
}
