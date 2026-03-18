// Icon sync
async function updateExtensionIcon() {
  browser.storage.local.get("isExtensionEnabled", function (result) {
    const isEnabled = result.isExtensionEnabled !== false;
    const iconPath = isEnabled
      ? "assets/icons/icon-active.svg"
      : "assets/icons/icon-inactive.svg";

    try {
      browser.browserAction.setIcon({
        path: iconPath,
      });
    } catch (error) {
      console.error("Error updating icon:", error);
    }
  });
}

// Startup
function init() {
  updateExtensionIcon();
}

// Icon storage sync
browser.storage.onChanged.addListener(function (changes, areaName) {
  if (areaName !== "local") {
    return;
  }

  if (changes.isExtensionEnabled) {
    updateExtensionIcon();
  }
});

init();
