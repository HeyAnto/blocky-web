import {
  PROTECTED_DOMAINS,
  PROTECTED_PROTOCOLS,
} from "../scripts/constants.js";
import {
  addBlacklistedSite,
  getBlacklistedSites,
  isBlacklistedSite,
  removeBlacklistedSite,
  setAnimationDisabled,
  setExtensionEnabled,
} from "../scripts/storage.js";

let currentDomain = null;
let currentUrl = null;

// Toggle fade
function updateOverflowState(element) {
  if (!element) {
    return;
  }

  const isTruncated = element.scrollWidth > element.clientWidth + 1;
  element.classList.toggle("is-truncated", isTruncated);
}

// Refresh fades
function refreshDomainFades() {
  const domainElements = document.querySelectorAll(".domain-text");
  domainElements.forEach((element) => updateOverflowState(element));
}

// Bind container
function bindContainerToggle(container, input, blockerSelector, shouldToggle) {
  if (!container || !input) {
    return;
  }

  container.addEventListener("click", (event) => {
    if (event.target.closest(blockerSelector) || !shouldToggle()) {
      return;
    }

    input.click();
  });

  container.addEventListener("keydown", (event) => {
    if ((event.key !== "Enter" && event.key !== " ") || !shouldToggle()) {
      return;
    }

    event.preventDefault();
    input.click();
  });
}

// Bind list item
function bindListItemToggle(item, input) {
  if (!item || !input) {
    return;
  }

  item.addEventListener("click", (event) => {
    if (!event.target.closest(".chk")) {
      input.click();
    }
  });

  item.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    input.click();
  });
}

// Focus order
function getPopupFocusableElements() {
  const selectors = [
    "a[href]",
    '[role="button"][tabindex]:not([tabindex="-1"])',
    '.excluded-item[tabindex]:not([tabindex="-1"])',
  ];

  return [...document.querySelectorAll(selectors.join(","))].filter(
    (element) => {
      if (element.hasAttribute("disabled")) {
        return false;
      }

      return element.offsetParent !== null;
    },
  );
}

// Trap tab
function bindFocusLoop() {
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") {
      return;
    }

    const focusables = getPopupFocusableElements();
    if (focusables.length === 0) {
      return;
    }

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const current = document.activeElement;

    if (!event.shiftKey && current === last) {
      event.preventDefault();
      first.focus();
      return;
    }

    if (event.shiftKey && current === first) {
      event.preventDefault();
      last.focus();
    }
  });
}

// Parse domain
function getDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.toLowerCase();
  } catch {
    return null;
  }
}

// Check protection
function isProtectedSite(url) {
  if (!url) return true;

  if (PROTECTED_PROTOCOLS.some((protocol) => url.startsWith(protocol))) {
    return true;
  }

  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    return PROTECTED_DOMAINS.some((domain) => hostname.endsWith(domain));
  } catch {
    return true;
  }
}

// Read active tab
async function getCurrentDomain() {
  try {
    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tabs.length > 0) {
      currentUrl = tabs[0].url;
      const domain = getDomain(currentUrl);
      return domain;
    }
  } catch (error) {
    console.error("Error getting current domain:", error);
  }
  return null;
}

// Render empty list
function renderEmptyExcludedList(containerElement) {
  const wrapper = document.createElement("li");
  wrapper.className = "excluded-empty";

  const text = document.createElement("p");
  text.textContent = "No excluded sites yet";

  wrapper.appendChild(text);
  containerElement.appendChild(wrapper);
}

// Update excluded list
async function updateExcludedList() {
  const containerElement = document.getElementById("excludedListContainer");

  if (!containerElement) {
    console.error("excludedListContainer not found");
    return;
  }

  const blacklistedSites = await getBlacklistedSites();
  const filteredSites = blacklistedSites.filter(
    (site) => site !== currentDomain,
  );

  containerElement.innerHTML = "";

  if (filteredSites.length === 0) {
    renderEmptyExcludedList(containerElement);
    return;
  }

  const listFragment = document.createDocumentFragment();

  filteredSites.forEach((domain, index) => {
    const item = document.createElement("li");
    item.className = "btn btn-tertiary excluded-item";
    item.tabIndex = 0;
    item.setAttribute("role", "button");
    item.setAttribute("aria-label", `Remove ${domain} from excluded sites`);

    const label = document.createElement("label");
    label.className = "chk";
    label.htmlFor = `excludedSite-${index}`;

    const input = document.createElement("input");
    input.id = `excludedSite-${index}`;
    input.type = "checkbox";
    input.tabIndex = -1;
    input.checked = true;
    input.addEventListener("change", async () => {
      if (!input.checked) {
        await removeBlacklistedSite(domain);
        await updateExcludedList();
        if (domain === currentDomain) {
          await updateCurrentSiteUI();
        }
      } else {
        input.checked = false;
      }
    });

    const span = document.createElement("span");
    span.className = "chk-ui";
    span.setAttribute("aria-hidden", "true");

    label.appendChild(input);
    label.appendChild(span);

    const p = document.createElement("p");
    p.className = "domain-text excluded-domain";
    p.textContent = domain;

    item.appendChild(p);
    item.appendChild(label);

    bindListItemToggle(item, input);

    listFragment.appendChild(item);
  });

  containerElement.appendChild(listFragment);
  requestAnimationFrame(refreshDomainFades);
}

// Update current UI
async function updateCurrentSiteUI() {
  const domainElement = document.getElementById("currentSiteDomain");
  const toggleCheckbox = document.getElementById("excludedCurrentToggle");
  const toggleLabel = toggleCheckbox?.closest(".chk");
  const containerDiv = document.getElementById("currentSiteContainer");
  const protectedMessage = document.getElementById(
    "currentSiteProtectedMessage",
  );

  if (!domainElement || !toggleCheckbox || !containerDiv || !protectedMessage) {
    return;
  }

  if (!currentUrl) {
    domainElement.textContent = "Unknown site";
    containerDiv.classList.add("btn-protected");
    toggleLabel?.classList.add("btn-protected");
    protectedMessage.style.display = "block";
    protectedMessage.textContent = "This site is not supported";
    toggleCheckbox.disabled = true;
    containerDiv.setAttribute("aria-disabled", "true");
    containerDiv.tabIndex = -1;
    updateOverflowState(domainElement);
    return;
  }

  const isProtected = isProtectedSite(currentUrl);

  if (isProtected) {
    domainElement.textContent = currentUrl;
    containerDiv.classList.add("btn-protected");
    toggleLabel?.classList.add("btn-protected");
    protectedMessage.style.display = "block";
    protectedMessage.textContent = "This site is not supported";
    toggleCheckbox.disabled = true;
    containerDiv.setAttribute("aria-disabled", "true");
    containerDiv.tabIndex = -1;
    updateOverflowState(domainElement);
  } else {
    domainElement.textContent = currentDomain;
    containerDiv.classList.remove("btn-protected");
    toggleLabel?.classList.remove("btn-protected");
    protectedMessage.style.display = "none";
    toggleCheckbox.disabled = false;
    containerDiv.setAttribute("aria-disabled", "false");
    containerDiv.tabIndex = 0;
    const isBlacklisted = await isBlacklistedSite(currentDomain);
    toggleCheckbox.checked = isBlacklisted;
    updateOverflowState(domainElement);
  }
}

// Init popup
async function init() {
  const extensionToggleCheckbox = document.getElementById("extensionToggle");
  const animationsToggleCheckbox = document.getElementById("animationsToggle");
  const excludedCurrentToggle = document.getElementById(
    "excludedCurrentToggle",
  );

  const extensionSection = document.getElementById("extensionToggleContainer");
  const animationSection = document.getElementById("animationsToggleContainer");
  const currentSiteContainer = document.getElementById("currentSiteContainer");

  if (
    !extensionToggleCheckbox ||
    !animationsToggleCheckbox ||
    !excludedCurrentToggle
  ) {
    return;
  }

  currentDomain = await getCurrentDomain();
  await updateCurrentSiteUI();
  await updateExcludedList();

  browser.storage.local.get(
    ["isExtensionEnabled", "isAnimationDisabled"],
    function (result) {
      const isEnabled = result.isExtensionEnabled !== false;
      const isAnimationDisabled = result.isAnimationDisabled === true;

      extensionToggleCheckbox.checked = isEnabled;
      animationsToggleCheckbox.checked = isAnimationDisabled;
    },
  );

  extensionToggleCheckbox.addEventListener("change", async () => {
    const isEnabled = extensionToggleCheckbox.checked;
    await setExtensionEnabled(isEnabled);
  });

  animationsToggleCheckbox.addEventListener("change", async () => {
    const isDisabled = animationsToggleCheckbox.checked;
    await setAnimationDisabled(isDisabled);
  });

  excludedCurrentToggle.addEventListener("change", async () => {
    if (!currentDomain || !currentUrl || isProtectedSite(currentUrl)) {
      excludedCurrentToggle.checked = false;
      return;
    }

    if (excludedCurrentToggle.checked) {
      await addBlacklistedSite(currentDomain);
    } else {
      await removeBlacklistedSite(currentDomain);
    }
    await updateExcludedList();
  });

  bindContainerToggle(
    currentSiteContainer,
    excludedCurrentToggle,
    ".chk",
    () => !isProtectedSite(currentUrl),
  );

  bindContainerToggle(
    extensionSection,
    extensionToggleCheckbox,
    ".tg",
    () => true,
  );

  bindContainerToggle(
    animationSection,
    animationsToggleCheckbox,
    ".tg",
    () => true,
  );

  window.addEventListener("resize", refreshDomainFades);
  bindFocusLoop();
}

document.addEventListener("DOMContentLoaded", init);
