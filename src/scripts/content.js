// Init state
let styleElement = null;
let isExtensionEnabled = true;
let cachedCSS = null;

// Apply state
function applyExtensionState() {
  if (isExtensionEnabled) {
    loadCustomStyle();
  } else {
    removeCustomStyle();
  }
}

// Read storage
function syncStateFromStorage() {
  browser.storage.local.get("isExtensionEnabled", function (result) {
    isExtensionEnabled = result.isExtensionEnabled !== false;
    applyExtensionState();
  });
}

// Initial apply
browser.storage.local.get("isExtensionEnabled", function (result) {
  isExtensionEnabled = result.isExtensionEnabled !== false;
  applyExtensionState();
});

function loadCustomStyle() {
  // Use cache
  if (cachedCSS) {
    injectStyle(cachedCSS);
    return;
  }

  // Fetch once
  fetch(browser.runtime.getURL("src/styles/inject.css"))
    .then((response) => response.text())
    .then((css) => {
      cachedCSS = css;
      injectStyle(css);
    })
    .catch((error) => console.error("Erreur de chargement du CSS:", error));
}

function injectStyle(css) {
  if (!styleElement) {
    styleElement = document.createElement("style");
    document.documentElement.appendChild(styleElement);
  }
  styleElement.textContent = css;
}

function removeCustomStyle() {
  if (styleElement) {
    styleElement.remove();
    styleElement = null;
  }
}

// Toggle listener
browser.runtime.onMessage.addListener(function (message) {
  if (message.action === "extensionToggle") {
    isExtensionEnabled = message.isEnabled;
    applyExtensionState();
  }
});

// Storage sync
browser.storage.onChanged.addListener(function (changes, areaName) {
  if (areaName !== "local" || !changes.isExtensionEnabled) {
    return;
  }

  isExtensionEnabled = changes.isExtensionEnabled.newValue !== false;
  applyExtensionState();
});

// Page restore
window.addEventListener("pageshow", function () {
  syncStateFromStorage();
});

// Tab focus sync
document.addEventListener("visibilitychange", function () {
  if (document.visibilityState === "visible") {
    syncStateFromStorage();
  }
});
