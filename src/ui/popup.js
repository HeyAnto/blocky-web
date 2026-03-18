// Popup init
async function init() {
  const extensionToggleCheckbox = document.getElementById("extensionToggle");
  const animationsToggleCheckbox = document.getElementById("animationsToggle");
  const switchSections = document.querySelectorAll(".sw");

  // Read state
  browser.storage.local.get(
    ["isExtensionEnabled", "isAnimationDisabled"],
    function (result) {
      const isEnabled = result.isExtensionEnabled !== false;
      const isAnimationDisabled = result.isAnimationDisabled === true;

      extensionToggleCheckbox.checked = isEnabled;
      animationsToggleCheckbox.checked = isAnimationDisabled;
    },
  );

  // Extension toggle
  extensionToggleCheckbox.addEventListener("change", async () => {
    const isEnabled = extensionToggleCheckbox.checked;
    await browser.storage.local.set({ isExtensionEnabled: isEnabled });
  });

  // Animation toggle
  animationsToggleCheckbox.addEventListener("change", async () => {
    const isDisabled = animationsToggleCheckbox.checked;
    await browser.storage.local.set({ isAnimationDisabled: isDisabled });
  });

  // Section click toggle
  switchSections.forEach((section) => {
    section.addEventListener("click", (event) => {
      if (event.target.closest(".tg")) {
        return;
      }

      if (section.querySelector("#extensionToggle")) {
        extensionToggleCheckbox.click();
      } else if (section.querySelector("#animationsToggle")) {
        animationsToggleCheckbox.click();
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", init);
