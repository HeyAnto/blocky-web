// Init state
let styleElement = null;
let isExtensionEnabled = true;
let cachedCSS = null;

// Initial apply
browser.storage.local.get('isExtensionEnabled', function(result) {
    isExtensionEnabled = result.isExtensionEnabled !== false;
    
    if (isExtensionEnabled) {
        loadCustomStyle();
    }
});

function loadCustomStyle() {
    // Use cache
    if (cachedCSS) {
        injectStyle(cachedCSS);
        return;
    }
    
    // Fetch once
    fetch(browser.runtime.getURL('src/styles/inject.css'))
        .then(response => response.text())
        .then(css => {
            cachedCSS = css;
            injectStyle(css);
        })
        .catch(error => console.error('Erreur de chargement du CSS:', error));
}

function injectStyle(css) {
    if (!styleElement) {
        styleElement = document.createElement('style');
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
browser.runtime.onMessage.addListener(function(message) {
    if (message.action === 'extensionToggle') {
        isExtensionEnabled = message.isEnabled;
        
        if (isExtensionEnabled) {
            loadCustomStyle();
        } else {
            removeCustomStyle();
        }
    }
});
