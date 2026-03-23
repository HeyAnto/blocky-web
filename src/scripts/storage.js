import { DEFAULTS, STORAGE_KEYS } from "./constants.js";

function normalizeDomain(domain) {
  if (typeof domain !== "string") {
    return null;
  }

  const normalized = domain.trim().toLowerCase();
  return normalized || null;
}

function sanitizeBlacklistedSites(sites) {
  if (!Array.isArray(sites)) {
    return [];
  }

  return [...new Set(sites.map(normalizeDomain).filter(Boolean))];
}

async function setBlacklistedSites(sites) {
  await browser.storage.local.set({
    [STORAGE_KEYS.BLACKLISTED_SITES]: sites,
  });
}

// Read flag
export async function getExtensionEnabled() {
  try {
    const result = await browser.storage.local.get(
      STORAGE_KEYS.IS_EXTENSION_ENABLED,
    );
    return result[STORAGE_KEYS.IS_EXTENSION_ENABLED] !== false;
  } catch (error) {
    console.error("Error getting extension enabled state:", error);
    return DEFAULTS.EXTENSION_ENABLED;
  }
}

// Write flag
export async function setExtensionEnabled(isEnabled) {
  try {
    await browser.storage.local.set({
      [STORAGE_KEYS.IS_EXTENSION_ENABLED]: isEnabled,
    });
  } catch (error) {
    console.error("Error setting extension enabled state:", error);
  }
}

// Read motion flag
export async function getAnimationDisabled() {
  try {
    const result = await browser.storage.local.get(
      STORAGE_KEYS.IS_ANIMATION_DISABLED,
    );
    return result[STORAGE_KEYS.IS_ANIMATION_DISABLED] === true;
  } catch (error) {
    console.error("Error getting animation disabled state:", error);
    return DEFAULTS.ANIMATION_DISABLED;
  }
}

// Write motion flag
export async function setAnimationDisabled(isDisabled) {
  try {
    await browser.storage.local.set({
      [STORAGE_KEYS.IS_ANIMATION_DISABLED]: isDisabled,
    });
  } catch (error) {
    console.error("Error setting animation disabled state:", error);
  }
}

// Get blacklisted sites
export async function getBlacklistedSites() {
  try {
    const result = await browser.storage.local.get(
      STORAGE_KEYS.BLACKLISTED_SITES,
    );
    const sites = sanitizeBlacklistedSites(
      result[STORAGE_KEYS.BLACKLISTED_SITES],
    );
    return sites;
  } catch (error) {
    console.error("Error getting blacklisted sites:", error);
    return [...DEFAULTS.BLACKLISTED_SITES];
  }
}

// Add blacklist
export async function addBlacklistedSite(domain) {
  try {
    const normalizedDomain = normalizeDomain(domain);
    if (!normalizedDomain) {
      return;
    }

    const blacklistedSites = await getBlacklistedSites();
    if (!blacklistedSites.includes(normalizedDomain)) {
      await setBlacklistedSites([...blacklistedSites, normalizedDomain]);
    }
  } catch (error) {
    console.error("Error adding blacklisted site:", error);
  }
}

// Remove blacklist
export async function removeBlacklistedSite(domain) {
  try {
    const normalizedDomain = normalizeDomain(domain);
    if (!normalizedDomain) {
      return;
    }

    const blacklistedSites = await getBlacklistedSites();
    if (blacklistedSites.includes(normalizedDomain)) {
      const updatedSites = blacklistedSites.filter(
        (site) => site !== normalizedDomain,
      );
      await setBlacklistedSites(updatedSites);
    }
  } catch (error) {
    console.error("Error removing blacklisted site:", error);
  }
}

// Check blacklist
export async function isBlacklistedSite(domain) {
  const normalizedDomain = normalizeDomain(domain);
  if (!normalizedDomain) {
    return false;
  }

  const blacklistedSites = await getBlacklistedSites();
  return blacklistedSites.includes(normalizedDomain);
}
