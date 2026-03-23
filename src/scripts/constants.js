// Storage keys
export const STORAGE_KEYS = {
  IS_EXTENSION_ENABLED: "isExtensionEnabled",
  IS_ANIMATION_DISABLED: "isAnimationDisabled",
  BLACKLISTED_SITES: "blacklistedSites",
};

// Message actions
export const MESSAGE_ACTIONS = {
  TOGGLE_EXTENSION: "toggleExtension",
  EXTENSION_TOGGLE: "extensionToggle",
  ANIMATION_TOGGLE: "animationToggle",
};

// Icons
export const ICONS = {
  ACTIVE: "assets/icons/icon-active.svg",
  INACTIVE: "assets/icons/icon-inactive.svg",
};

// Default values
export const DEFAULTS = {
  EXTENSION_ENABLED: true,
  ANIMATION_DISABLED: false,
  BLACKLISTED_SITES: [],
};

// Protected protocols
export const PROTECTED_PROTOCOLS = [
  "chrome://",
  "chrome-extension://",
  "moz-extension://",
  "about:",
  "data:",
  "blob:",
];

// Protected domains
export const PROTECTED_DOMAINS = [
  "addons.mozilla.org",
  "accounts.firefox.com",
  "support.mozilla.org",
];
