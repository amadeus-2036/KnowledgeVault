# Knowledge Vault AI

Knowledge Vault AI is a premium personal knowledge workspace. It allows you to effortlessly capture, organize, and retrieve information from diverse sources (articles, PDFs, YouTube, GitHub) into dedicated "Vaults" and leverage Gemini AI to perform semantic searches and generate insights.

**Developed by Deepal Karande**, Student of Sardar Patel Institute of Technology.

---

## ✨ Features
- **Universal Capture:** Save web pages, notes, and PDFs with a single click via the Chrome Extension.
- **On-Demand AI:** Generate smart summaries and auto-tags only when you need them.
- **Semantic Search:** Find concepts across your entire vault based on meaning, not just keywords.
- **Beautiful Workspace:** Features a clean, highly customizable "Digital Notebook" aesthetic.
- **Focus Space:** Integrated Pomodoro timer linked to your research environments.

## 🛠 Tech Stack
- **Frontend:** React, Vite, Tailwind CSS v4, React Query
- **Backend:** Node.js, Express, MongoDB Atlas (Vector Search)
- **AI Integration:** Google Gemini SDK (`@google/genai`)

## 🚀 Quick Setup

### 1. Environment Variables
Create a `.env` in the `backend/` folder:
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

### 2. Run Locally
**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### 3. Chrome Extension
1. Open Chrome and go to `chrome://extensions/`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select the `extension` folder.

---

## 🌐 Deployment
This project is configured for deployment with **Render** (Backend) and **Vercel** (Frontend). Use the included `render.yaml` and `vercel.json` config files for seamless deployment.

## 📄 License
MIT License.
