# 🧠 DevMentor AI

> Your AI-powered senior engineer mentor, right inside VS Code!

![VS Code Extension](https://img.shields.io/badge/VS%20Code-Extension-007acc)
![AI Powered](https://img.shields.io/badge/AI-Gemini%20Powered-blue)
![Hackathon](https://img.shields.io/badge/AWS-AI%20for%20Bharat%20Hackathon-orange)

---

## 🎯 Problem Statement

Junior developers waste hours searching Stack Overflow, documentation, and AI chatbots for answers — but these tools give **isolated answers** without understanding the developer's full context.

**DevMentor AI** solves this by acting as a **proactive senior engineer mentor** — watching your code, understanding your context, and guiding you at the right moment.

---

## 💡 What Makes It Different?

| Normal AI Tools | DevMentor AI |
|----------------|--------------|
| Wait for questions | Watches proactively |
| Give single answers | Explains trade-offs |
| No project context | Context-aware guidance |
| Just fixes code | Teaches you to think |
| Reactive | Proactive |

---

## ✨ Features

### 1. 📋 Copy Paste Detection
Paste any code → DevMentor **automatically** explains:
- What the code does
- Any risks or issues
- Key things to learn

### 2. ⚡ Technology Detection
Write `mongodb`, `react`, `firebase` etc → DevMentor **automatically** shows:
- When this technology is a good choice
- Trade-offs to consider
- Important warnings

### 3. 🔍 Code Analysis
Run `DevMentor: Analyze My Code` → Get:
- Full code review
- Issues and improvements
- Best practices

### 4. 💬 AI Mentor Chat
Ask anything in the side panel:
- Architecture decisions
- Technology comparisons
- Code explanations
- Career advice

### 5. 📚 Chat History
- All conversations **permanently saved**
- Access previous chats anytime
- Delete chats you don't need

---

## 🏗️ Architecture
```
User & Context Input
        ↓
VS Code Extension (Watcher)
        ↓
Context Builder
        ↓
Gemini AI API
        ↓
Trade-off Analysis
        ↓
Guidance & Learning Output
```

---

## 🛠️ Tech Stack

- **VS Code Extension API** - Watching, Detection, UI
- **Node.js** - Application Logic
- **Google Gemini AI** - AI Reasoning Engine
- **HTML/CSS** - Side Panel UI

---

## 🚀 Installation

### Method 1: Install from VSIX (Recommended)

1. Download `devmentor-ai-0.0.1.vsix`
2. Open VS Code
3. Press `Ctrl + Shift + X`
4. Click `...` (3 dots) → `Install from VSIX`
5. Select the downloaded file
6. Done! ✅

### Method 2: Run from Source
```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/devmentor-ai

# Go to folder
cd devmentor-ai

# Install dependencies
npm install

# Add your Gemini API key in extension.js
# const ai = new GoogleGenAI({ apiKey: 'YOUR_KEY_HERE' });

# Run extension
Press F5 in VS Code
```

---

## 🎮 How to Use

### Auto Features (No action needed!):
```
1. Open any code file
2. Start coding or paste code
3. DevMentor automatically detects and guides!
```

### Manual Analysis:
```
Ctrl + Shift + P → DevMentor: Analyze My Code
```

### Chat with Mentor:
```
Click DevMentor icon in left sidebar
Type your question
Press Enter or Send
```

---

## 📸 Demo Flow
```
Step 1: Install extension
Step 2: Open any JS/Python file
Step 3: Paste some code → Auto explanation appears
Step 4: Type 'mongodb' → Trade-off warning appears
Step 5: Ask anything in chat panel
Step 6: Check chat history anytime
```

---

## 👥 Team

**Team Name:** DevMentor Labs

**Team Leader:** Bibek Gorai

**Hackathon:** AWS AI for Bharat Hackathon

**Problem Statement:** AI for Learning & Developer Productivity

---

## 🎯 USP

> "Existing tools wait for questions. DevMentor watches and warns at high-risk decision points."

DevMentor AI is not just another AI assistant — it acts as a **virtual technical mentor**, combining:
- ✅ Productivity
- ✅ Learning
- ✅ Responsible AI usage

---

## 📄 License

MIT License - Free to use!

---

<p align="center">Built with ❤️ for AWS AI for Bharat Hackathon</p>
