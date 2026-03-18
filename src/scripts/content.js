// Init state
let styleElement = null;
let isExtensionEnabled = true;
let isAnimationDisabled = false;
let cachedCSS = null;

const MOTION_DISABLED_CLASS = "blocky-disable-animations";

// Apply state
function applyExtensionState() {
  if (isExtensionEnabled) {
    loadCustomStyle();
  } else {
    removeCustomStyle();
  }

  applyAnimationState();
}

// Apply motion
function applyAnimationState() {
  if (!document.documentElement) {
    return;
  }

  const shouldDisableAnimations = isExtensionEnabled && isAnimationDisabled;
  document.documentElement.classList.toggle(
    MOTION_DISABLED_CLASS,
    shouldDisableAnimations,
  );
}

// Initial apply
browser.storage.local.get(
  ["isExtensionEnabled", "isAnimationDisabled"],
  function (result) {
    isExtensionEnabled = result.isExtensionEnabled !== false;
    isAnimationDisabled = result.isAnimationDisabled === true;
    applyExtensionState();
  },
);

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

// Storage sync
browser.storage.onChanged.addListener(function (changes, areaName) {
  if (areaName !== "local") {
    return;
  }

  let didExtensionChange = false;
  let didAnimationChange = false;

  if (changes.isExtensionEnabled) {
    isExtensionEnabled = changes.isExtensionEnabled.newValue !== false;
    didExtensionChange = true;
  }

  if (changes.isAnimationDisabled) {
    isAnimationDisabled = changes.isAnimationDisabled.newValue === true;
    didAnimationChange = true;
  }

  if (didExtensionChange) {
    applyExtensionState();
    return;
  }

  if (didAnimationChange) {
    applyAnimationState();
  }
});
