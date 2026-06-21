const API_BASE = 'http://localhost:5000/api';

// Create context menu on extension install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "save-to-vault",
    title: "Save to Knowledge Vault",
    contexts: ["selection"]
  });
});

// Handle context menu click
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "save-to-vault" && info.selectionText) {
    const { token } = await chrome.storage.local.get(['token']);
    
    if (!token) {
      console.error("Not logged in. Please open the extension and log in.");
      // Optional: open popup or show notification
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => alert("Knowledge Vault: Please click the extension icon and log in first.")
      });
      return;
    }

    try {
      const title = tab.title || "Highlighted Note";
      const content = `> ${info.selectionText}\n\n**Source:** [${title}](${tab.url})`;

      const response = await fetch(`${API_BASE}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: `Highlight from ${title}`,
          content: content
        })
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
        func: () => alert("Knowledge Vault: Failed to save highlight.")
      });
    }
  }
});
