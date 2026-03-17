// Popup init
async function init() {
  const toggleCheckbox = document.getElementById("extensionToggle");
  const switchSection = document.querySelector(".sw");

  // Read state
  browser.storage.local.get("isExtensionEnabled", function (result) {
    const isEnabled = result.isExtensionEnabled !== false;
    toggleCheckbox.checked = isEnabled;
  });

  // Change handler
  toggleCheckbox.addEventListener("change", async () => {
    const isEnabled = toggleCheckbox.checked;
    await browser.storage.local.set({ isExtensionEnabled: isEnabled });

    // Notify background
    browser.runtime.sendMessage({
      action: "extensionToggle",
      isEnabled: isEnabled,
    });
  });

  // Section click toggle
  switchSection.addEventListener("click", (event) => {
    if (event.target.closest(".tg")) {
      return;
    }
    toggleCheckbox.click();
  });
}

document.addEventListener("DOMContentLoaded", init);
