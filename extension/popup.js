const API_BASE = 'https://knowledgevault-backend-5n69.onrender.com/api';

// DOM Elements
const views = {
  login: document.getElementById('loginView'),
  save: document.getElementById('saveView'),
  success: document.getElementById('successView')
};

const ui = {
  email: document.getElementById('email'),
  password: document.getElementById('password'),
  loginBtn: document.getElementById('loginBtn'),
  loginError: document.getElementById('loginError'),
  
  sourceBadge: document.getElementById('sourceBadge'),
  sourceIcon: document.getElementById('sourceIcon'),
  sourceText: document.getElementById('sourceText'),
  pageTitle: document.getElementById('pageTitle'),
  repoSelect: document.getElementById('repoSelect'),
  saveBtn: document.getElementById('saveBtn'),
  saveError: document.getElementById('saveError'),
  
  showNewRepoBtn: document.getElementById('showNewRepoBtn'),
  newRepoContainer: document.getElementById('newRepoContainer'),
  newRepoName: document.getElementById('newRepoName'),
  createRepoBtn: document.getElementById('createRepoBtn'),

  successMain: document.getElementById('successMain')
};

let currentTab = null;
let currentToken = null;

// Icons mapping
const ICONS = {
  youtube: '<path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>',
  github: '<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>',
  article: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline>'
};

function showView(viewName) {
  Object.values(views).forEach(v => v.classList.add('hidden'));
  views[viewName].classList.remove('hidden');
}

// ─── INIT ────────────────────────────────────────────────────────
async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  currentTab = tab;
  
  const { token } = await chrome.storage.local.get(['token']);
  if (token) {
    currentToken = token;
    showView('save');
    setupSaveView();
  } else {
    showView('login');
  }
}

// ─── LOGIN ───────────────────────────────────────────────────────
ui.loginBtn.addEventListener('click', async () => {
  const email = ui.email.value;
  const password = ui.password.value;
  
  ui.loginBtn.disabled = true;
  ui.loginBtn.textContent = 'Logging in...';
  ui.loginError.classList.add('hidden');

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    
    currentToken = data.data.token;
    await chrome.storage.local.set({ token: currentToken });
    
    showView('save');
    setupSaveView();
  } catch (err) {
    ui.loginError.textContent = err.message;
    ui.loginError.classList.remove('hidden');
  } finally {
    ui.loginBtn.disabled = false;
    ui.loginBtn.textContent = 'Log in';
  }
});

// ─── SAVE VIEW ───────────────────────────────────────────────────
async function setupSaveView() {
  ui.pageTitle.textContent = currentTab.title || currentTab.url;
  
  // Smart source detection
  const url = currentTab.url;
  let type = 'article';
  let text = 'Article';
  
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    type = 'youtube'; text = 'YouTube Video';
  } else if (url.includes('github.com')) {
    type = 'github'; text = 'GitHub Repository';
  }
  
  ui.sourceIcon.innerHTML = ICONS[type];
  ui.sourceText.textContent = text;

  // Fetch Repositories
  try {
    const res = await fetch(`${API_BASE}/repositories`, {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const data = await res.json();
    if (res.ok && data.data) {
      data.data.forEach(repo => {
        const opt = document.createElement('option');
        opt.value = repo._id;
        opt.textContent = repo.name;
        ui.repoSelect.appendChild(opt);
      });
      
      // Auto-suggest repository
      await suggestRepository();
    }
  } catch (err) {
    console.error('Failed to load repositories', err);
  }
}

async function suggestRepository() {
  if (ui.repoSelect.options.length <= 1) return; // Only "No Repository" exists

  ui.repoSelect.disabled = true;
  try {
    const res = await fetch(`${API_BASE}/extension/suggest-repo`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${currentToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title: currentTab.title, url: currentTab.url })
    });
    const data = await res.json();
    if (res.ok && data.data && data.data.repositoryId) {
      ui.repoSelect.value = data.data.repositoryId;
    }
  } catch (err) {
    console.error('Failed to suggest repo', err);
  } finally {
    ui.repoSelect.disabled = false;
  }
}

// ─── NEW REPO CREATION ───────────────────────────────────────────
ui.showNewRepoBtn.addEventListener('click', () => {
  ui.newRepoContainer.classList.toggle('hidden');
  if (!ui.newRepoContainer.classList.contains('hidden')) {
    ui.newRepoName.focus();
  }
});

ui.createRepoBtn.addEventListener('click', async () => {
  const name = ui.newRepoName.value.trim();
  if (!name) return;

  ui.createRepoBtn.disabled = true;
  ui.createRepoBtn.textContent = '...';

  try {
    const res = await fetch(`${API_BASE}/repositories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      },
      body: JSON.stringify({ name, description: '' })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create repo');
    
    // Add to select and select it
    const opt = document.createElement('option');
    opt.value = data.data._id;
    opt.textContent = data.data.name;
    ui.repoSelect.appendChild(opt);
    ui.repoSelect.value = data.data._id;
    
    // Reset and hide
    ui.newRepoName.value = '';
    ui.newRepoContainer.classList.add('hidden');
  } catch (err) {
    console.error(err);
    alert('Failed to create repository: ' + err.message);
  } finally {
    ui.createRepoBtn.disabled = false;
    ui.createRepoBtn.textContent = 'Create';
  }
});

ui.saveBtn.addEventListener('click', async () => {
  ui.saveBtn.disabled = true;
  ui.saveBtn.textContent = 'Saving...';
  ui.saveError.classList.add('hidden');

  const payload = {
    url: currentTab.url,
    repository: ui.repoSelect.value || null
  };

  try {
    // Save last used repo to storage for the context menu to use
    if (payload.repository) {
      await chrome.storage.local.set({ lastUsedRepo: payload.repository });
    }

    const res = await fetch(`${API_BASE}/knowledge/ingest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      },
      body: JSON.stringify(payload)
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Save failed');
    
    // Show success view
    const repoName = ui.repoSelect.options[ui.repoSelect.selectedIndex].text;
    ui.successMain.textContent = payload.repository ? `Saved to ${repoName}` : `Saved to Vault`;
    showView('success');
    
    setTimeout(() => window.close(), 2000);
  } catch (err) {
    ui.saveError.textContent = err.message;
    ui.saveError.classList.remove('hidden');
    ui.saveBtn.disabled = false;
    ui.saveBtn.textContent = 'Save to Vault';
  }
});

init();
