// Listen for messages from the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getSelectedText') {
        // Get selection from current frame
        const selection = window.getSelection().toString().trim();
        
        // If we found selection in this frame, return it
        if (selection) {
            sendResponse({ text: selection });
            return true;
        }
        
        // If no selection in this frame, let other frames handle it
        return false;
    } else if (request.action === 'replaceText') {
        replaceSelectedText(request.text);
        sendResponse({ success: true });
    }
    return false;
});

function replaceSelectedText(newText) {
    const element = document.querySelector('.kix-documentselection-rect');
    if (!element) return;

    // Create a new keyboard event
    const event = new KeyboardEvent('keydown', {
        key: 'v',
        code: 'KeyV',
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
        composed: true
    });

    // Copy new text to clipboard
    navigator.clipboard.writeText(newText).then(() => {
        // Trigger paste
        document.execCommand('paste');
    });
}

// Add sidebar when extension icon is clicked
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggleSidebar') {
        toggleSidebar();
    }
});

function toggleSidebar() {
    let sidebar = document.getElementById('nikud-sidebar');
    
    if (sidebar) {
        sidebar.remove();
    } else {
        sidebar = document.createElement('iframe');
        sidebar.id = 'nikud-sidebar';
        sidebar.src = chrome.runtime.getURL('sidebar.html');
        sidebar.style.cssText = `
            position: fixed;
            top: 0;
            right: 0;
            width: 300px;
            height: 100%;
            border: none;
            background: white;
            box-shadow: -2px 0 5px rgba(0,0,0,0.1);
            z-index: 9999;
        `;
        document.body.appendChild(sidebar);
    }
} 