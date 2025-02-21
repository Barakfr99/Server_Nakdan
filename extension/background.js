// Listen for extension icon click
chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: injectSidebar
    });
});

// Handle messages from sidebar
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getNikudOptions') {
        fetchNikudOptions(request.word)
            .then(options => sendResponse({ options }))
            .catch(error => sendResponse({ error: error.message }));
        return true;  // Required for async response
    }
});

async function fetchNikudOptions(word) {
    try {
        const response = await fetch('http://localhost:5000/nikud', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ word })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch nikud options');
        }

        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }

        return data.options;
    } catch (error) {
        console.error('Error fetching nikud options:', error);
        throw error;
    }
}

function injectSidebar() {
    let sidebar = document.getElementById('nikud-sidebar');
    
    if (sidebar) {
        // Remove sidebar
        sidebar.remove();
        
        // Reset all modified styles
        document.documentElement.style.removeProperty('width');
        document.documentElement.style.removeProperty('margin-right');
        document.body.style.removeProperty('width');
        document.body.style.removeProperty('margin-right');
        
        // Reset Google Docs specific elements
        const docsContainer = document.querySelector('.docs-editor-container');
        if (docsContainer) {
            docsContainer.style.removeProperty('width');
            docsContainer.style.removeProperty('margin-right');
        }
        
        const kixEditor = document.querySelector('.kix-appview-editor');
        if (kixEditor) {
            kixEditor.style.removeProperty('width');
            kixEditor.style.removeProperty('margin-right');
        }
    } else {
        // Create and inject sidebar
        sidebar = document.createElement('iframe');
        sidebar.id = 'nikud-sidebar';
        sidebar.src = chrome.runtime.getURL('sidebar.html');
        sidebar.style.cssText = `
            position: fixed;
            top: 0;
            right: 0;
            width: 400px;
            height: 100vh;
            border: none;
            background: white;
            box-shadow: -2px 0 5px rgba(0,0,0,0.1);
            z-index: 9999;
        `;
        
        // Adjust page layout
        document.documentElement.style.width = 'calc(100% - 400px)';
        document.documentElement.style.marginRight = '400px';
        document.body.style.width = '100%';
        document.body.style.marginRight = '0';
        
        // Adjust Google Docs specific elements
        const docsContainer = document.querySelector('.docs-editor-container');
        if (docsContainer) {
            docsContainer.style.width = '100%';
            docsContainer.style.marginRight = '0';
        }
        
        const kixEditor = document.querySelector('.kix-appview-editor');
        if (kixEditor) {
            kixEditor.style.width = '100%';
            kixEditor.style.marginRight = '0';
        }
        
        document.body.appendChild(sidebar);
    }
} 