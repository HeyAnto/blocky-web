// Init state
let styleElement = null;
let isExtensionEnabled = true;
let isAnimationDisabled = false;
let isBlacklisted = false;
let cachedCSS = null;

const MOTION_DISABLED_CLASS = "blocky-disable-animations";

// Parse domain
function getDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.toLowerCase();
  } catch {
    return null;
  }
}

// Apply state
function applyExtensionState() {
  if (isExtensionEnabled && !isBlacklisted) {
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

  const shouldDisableAnimations =
    isExtensionEnabled && isAnimationDisabled && !isBlacklisted;
  document.documentElement.classList.toggle(
    MOTION_DISABLED_CLASS,
    shouldDisableAnimations,
  );
}

// Check blacklist
function checkIfBlacklisted() {
  const currentDomain = getDomain(window.location.href);
  if (!currentDomain) {
    isBlacklisted = true;
    applyExtensionState();
    return;
  }

  browser.storage.local.get("blacklistedSites", function (result) {
    const blacklistedSites = Array.isArray(result.blacklistedSites)
      ? result.blacklistedSites
      : [];
    isBlacklisted = blacklistedSites.includes(currentDomain);
    applyExtensionState();
  });
}

// Initial apply
browser.storage.local.get(
  ["isExtensionEnabled", "isAnimationDisabled"],
  function (result) {
    isExtensionEnabled = result.isExtensionEnabled !== false;
    isAnimationDisabled = result.isAnimationDisabled === true;
    checkIfBlacklisted();
  },
);

function loadCustomStyle() {
  if (cachedCSS) {
    injectStyle(cachedCSS);
    return;
  }

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
  let didBlacklistChange = false;

  if (changes.isExtensionEnabled) {
    isExtensionEnabled = changes.isExtensionEnabled.newValue !== false;
    didExtensionChange = true;
  }

  if (changes.isAnimationDisabled) {
    isAnimationDisabled = changes.isAnimationDisabled.newValue === true;
    didAnimationChange = true;
  }

  if (changes.blacklistedSites) {
    const blacklistedSites = Array.isArray(changes.blacklistedSites.newValue)
      ? changes.blacklistedSites.newValue
      : [];
    const currentDomain = getDomain(window.location.href);
    isBlacklisted =
      typeof currentDomain === "string" &&
      blacklistedSites.includes(currentDomain);
    didBlacklistChange = true;
  }

  if (didExtensionChange || didBlacklistChange) {
    applyExtensionState();
    return;
  }

  if (didAnimationChange) {
    applyAnimationState();
  }
});
