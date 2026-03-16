import { DEFAULTS, STORAGE_KEYS } from './constants.js';

// Read flag
export async function getExtensionEnabled() {
    try {
        const result = await browser.storage.local.get(STORAGE_KEYS.IS_EXTENSION_ENABLED);
        return result[STORAGE_KEYS.IS_EXTENSION_ENABLED] !== false;
    } catch (error) {
        console.error('Error getting extension enabled state:', error);
        return DEFAULTS.EXTENSION_ENABLED;
    }
}

// Write flag
export async function setExtensionEnabled(isEnabled) {
    try {
        await browser.storage.local.set({
            [STORAGE_KEYS.IS_EXTENSION_ENABLED]: isEnabled
        });
    } catch (error) {
        console.error('Error setting extension enabled state:', error);
    }
}


