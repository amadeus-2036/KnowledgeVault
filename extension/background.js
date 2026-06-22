const API_BASE = 'https://knowledgevault-backend-5n69.onrender.com/api';

// Create context menu on extension install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "save-to-vault-text",
    title: "Save Highlight to Knowledge Vault",
    contexts: ["selection"]
  });
  chrome.contextMenus.create({
    id: "save-to-vault-image",
    title: "Save Image to Knowledge Vault",
    contexts: ["image"]
  });
});

// Handle context menu click
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const { token, lastUsedRepo } = await chrome.storage.local.get(['token', 'lastUsedRepo']);
    
  if (!token) {
    console.error("Not logged in. Please open the extension and log in.");
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => alert("Knowledge Vault: Please click the extension icon and log in first.")
    });
    return;
  }

  try {
    const pageTitle = tab.title || "Website";
    let title = '';
    let content = '';

    if (info.menuItemId === "save-to-vault-text" && info.selectionText) {
      title = `Highlight from ${pageTitle}`;
      content = `> ${info.selectionText}\n\n**Source:** [${pageTitle}](${tab.url})`;
    } else if (info.menuItemId === "save-to-vault-image" && info.srcUrl) {
      title = `[IMAGE] Saved from ${pageTitle}`;
      content = `![Saved Image](${info.srcUrl})\n\n**Source:** [${pageTitle}](${tab.url})`;
    } else {
      return;
    }

    const bodyData = {
      title,
      content
    };
    if (lastUsedRepo) {
      bodyData.repository = lastUsedRepo;
    }

    const response = await fetch(`${API_BASE}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(bodyData)
    });

      if (!response.ok) {
        throw new Error('Failed to save highlight');
      }

      // Show success feedback
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          // Simple toast notification
          const toast = document.createElement('div');
          toast.textContent = "Saved to Knowledge Vault";
          Object.assign(toast.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: '#111827',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: '999999',
            fontFamily: 'sans-serif',
            fontSize: '14px',
            transition: 'opacity 0.3s'
          });
          document.body.appendChild(toast);
          setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
          }, 3000);
        }
      });

    } catch (err) {
      console.error('Error saving to vault:', err);
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => alert("Knowledge Vault: Failed to save to vault.")
      });
    }
});
