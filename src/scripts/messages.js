// Broadcast tabs
export async function sendMessageToAllTabs(message) {
    try {
        const tabs = await browser.tabs.query({});
        tabs.forEach(tab => {
            browser.tabs.sendMessage(tab.id, message).catch(error => {
                // Ignore missing
                console.debug(`Could not send message to tab ${tab.id}:`, error);
            });
        });
    } catch (error) {
        console.error('Error sending message to all tabs:', error);
    }
}

// Message tab
export async function sendMessageToTab(tabId, message) {
    try {
        await browser.tabs.sendMessage(tabId, message);
    } catch (error) {
        console.error(`Error sending message to tab ${tabId}:`, error);
    }
}
