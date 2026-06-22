const API_BASE = 'https://knowledgevault-backend-5n69.onrender.com/api';

// Function to dynamically build context menus based on user's repositories
async function buildContextMenus() {
  chrome.contextMenus.removeAll();
  
  chrome.contextMenus.create({
    id: "save-to-vault-text",
    title: "Save Highlight to Knowledge Vault",
    contexts: ["selection"]
  });

  const { token } = await chrome.storage.local.get(['token']);
  
  if (!token) {
    chrome.contextMenus.create({
      id: "save-to-vault-image-login",
      title: "Log in to save images",
      contexts: ["image"]
    });
    return;
  }

  // Create parent image menu
  chrome.contextMenus.create({
    id: "save-image-parent",
    title: "Save Image to Vault",
    contexts: ["image"]
  });

  // Default global vault option
  chrome.contextMenus.create({
    id: "save-image-repo-null",
    parentId: "save-image-parent",
    title: "Global Vault (Unsorted)",
    contexts: ["image"]
  });

  try {
    const res = await fetch(`${API_BASE}/repositories`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok && data.data) {
      // Add separator
      chrome.contextMenus.create({
        id: "save-image-separator",
        parentId: "save-image-parent",
        type: "separator",
        contexts: ["image"]
      });
      // Add each repository as a sub-menu
      data.data.forEach(repo => {
        chrome.contextMenus.create({
          id: `save-image-repo-${repo._id}`,
          parentId: "save-image-parent",
          title: repo.name,
          contexts: ["image"]
        });
      });
    }
  } catch (err) {
    console.error("Failed to load repositories for context menu", err);
  }
}

// Build menus on startup, install, or when storage changes
chrome.runtime.onInstalled.addListener(buildContextMenus);
chrome.runtime.onStartup.addListener(buildContextMenus);
chrome.storage.onChanged.addListener((changes) => {
  if (changes.token) buildContextMenus();
});

// Listen for messages from popup to force rebuild
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "rebuildContextMenus") {
    buildContextMenus();
  }
});

// Handle context menu click
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "save-to-vault-image-login") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => alert("Knowledge Vault: Please click the extension icon and log in first.")
    });
    return;
  }

  const { token, lastUsedRepo } = await chrome.storage.local.get(['token', 'lastUsedRepo']);
    
  if (!token) return;

  try {
    const pageTitle = tab.title || "Website";
    let title = '';
    let content = '';
    let targetRepo = lastUsedRepo; // Default to last used if text

    if (info.menuItemId === "save-to-vault-text" && info.selectionText) {
      title = `Highlight from ${pageTitle}`;
      content = `> ${info.selectionText}\n\n**Source:** [${pageTitle}](${tab.url})`;
    } else if (info.menuItemId.startsWith("save-image-repo-")) {
      title = `[IMAGE] Saved from ${pageTitle}`;
      content = `![Saved Image](${info.srcUrl})\n\n**Source:** [${pageTitle}](${tab.url})`;
      
      // Extract target repo ID from menu ID
      const repoId = info.menuItemId.replace("save-image-repo-", "");
      targetRepo = repoId === "null" ? null : repoId;
    } else {
      return;
    }

    const bodyData = { title, content };
    if (targetRepo) {
      bodyData.repository = targetRepo;
    }

    const response = await fetch(`${API_BASE}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(bodyData)
    });

    if (!response.ok) throw new Error('Failed to save to vault');

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const toast = document.createElement('div');
        toast.textContent = "Saved to Knowledge Vault";
        Object.assign(toast.style, {
          position: 'fixed', bottom: '20px', right: '20px',
          background: '#111827', color: '#fff', padding: '12px 24px',
          borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: '999999', fontFamily: 'sans-serif', fontSize: '14px',
          transition: 'opacity 0.3s'
        });
        document.body.appendChild(toast);
        setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3000);
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
