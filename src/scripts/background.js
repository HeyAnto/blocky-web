// Icon sync
async function updateExtensionIcon() {
    browser.storage.local.get('isExtensionEnabled', function(result) {
        const isEnabled = result.isExtensionEnabled !== false;
        const iconPath = isEnabled ? 'assets/icons/icon-active.svg' : 'assets/icons/icon-inactive.svg';
        
        try {
            browser.browserAction.setIcon({
                path: iconPath
            });
        } catch (error) {
            console.error('Error updating icon:', error);
        }
    });
}

// Startup
function init() {
    updateExtensionIcon();
}

// Popup listener
browser.runtime.onMessage.addListener(function(message) {
    if (message.action === 'extensionToggle') {
        updateExtensionIcon();
        
        // Broadcast toggle
        browser.tabs.query({}, function(tabs) {
            tabs.forEach(function(tab) {
                browser.tabs.sendMessage(tab.id, {
                    action: 'extensionToggle',
                    isEnabled: message.isEnabled
                }).catch(error => {
                    console.debug('Could not send message to tab:', error);
                });
            });
        });
    }
});

init();
