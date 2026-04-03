# WebRun 🚀

**One-click dev server for any project!**

WebRun automatically detects your project type and runs the appropriate development server with a single click. No more remembering commands or switching between terminals.

![WebRun Demo](https://github.com/codewithmishu/WebRun/raw/HEAD/images/demo.gif)

## ✨ Features

### 🔍 Auto-Detection
WebRun intelligently scans your workspace to detect:
- **package.json** - Dependencies and scripts
- **Config files** - vite.config, next.config, angular.json, etc.
- **Folder structure** - Fullstack project layouts
- **Python files** - requirements.txt, manage.py, main.py

### 🎯 Supported Project Types

| Category | Frameworks |
|----------|-----------|
| **Frontend** | React (Vite/CRA), Vue (Vite/CLI), Next.js, Nuxt.js, Angular, Svelte, Astro, Remix |
| **Backend (Node.js)** | Express.js, Fastify, NestJS, Generic Node.js |
| **Backend (Python)** | Flask, Django, FastAPI |
| **Static** | Plain HTML/CSS/JS |
| **Fullstack** | Auto-detects frontend + backend folders |

### 🎮 One-Click Controls

- **▶️ Play Button** - Status bar button to start dev server
- **⏹️ Stop Button** - Stop running servers
- **🔄 Restart** - Click play again to restart
- **📦 Project Info** - See detected project type

### ⌨️ Keyboard Shortcuts

| Action | Windows/Linux | Mac |
|--------|--------------|-----|
| Start Server | `Ctrl+Shift+R` | `Cmd+Shift+R` |
| Stop Server | `Ctrl+Shift+S` | `Cmd+Shift+S` |
| Restart | `Ctrl+Shift+Alt+R` | `Cmd+Shift+Alt+R` |

## 📦 Installation

### From VS Code Marketplace
1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X`)
3. Search for "WebRun"
4. Click Install

### From VSIX File
1. Download the `.vsix` file
2. Open VS Code
3. Run command: `Extensions: Install from VSIX...`
4. Select the downloaded file

## 🚀 Usage

1. **Open a project folder** in VS Code
2. WebRun automatically detects the project type
3. Click the **▶️ WebRun** button in the status bar
4. Your dev server starts in the integrated terminal!

### Command Palette Commands

- `WebRun: Start Dev Server` - Start the development server
- `WebRun: Stop Server` - Stop running servers
- `WebRun: Restart Server` - Restart the server
- `WebRun: Detect Project Type` - Re-scan the workspace
- `WebRun: Show Project Info` - View detected project details
- `WebRun: Select Project Type Manually` - Override auto-detection

## ⚙️ Configuration

Add these settings to your VS Code settings:

```json
{
  "webrun.liveServerPort": 5500,
  "webrun.autoDetect": true,
  "webrun.showStatusBar": true,
  "webrun.customCommands": {
    "react-vite": "npm run dev -- --port 3000",
    "nextjs": "npm run dev -- -p 4000"
  }
}
```

### Settings Reference

| Setting | Default | Description |
|---------|---------|-------------|
| `webrun.liveServerPort` | `5500` | Port for static HTML live server |
| `webrun.autoDetect` | `true` | Auto-detect on workspace open |
| `webrun.showStatusBar` | `true` | Show status bar button |
| `webrun.customCommands` | `{}` | Custom commands per project type |

## 🔧 How Detection Works

### Detection Priority

1. **package.json dependencies** - Most reliable
2. **Config files** - vite.config.js, next.config.js, etc.
3. **Python files** - requirements.txt, manage.py
4. **Entry files** - server.js, app.py, index.html
5. **Folder structure** - frontend/backend, client/server

### Command Mapping

| Project Type | Default Command |
|-------------|-----------------|
| Static HTML | `npx live-server --port=5500` |
| React/Vue/Svelte (Vite) | `npm run dev` |
| Create React App | `npm start` |
| Next.js | `npm run dev` |
| Angular | `npm start` |
| Vue CLI | `npm run serve` |
| Node.js Backend | `npm run dev` or `npm start` |
| NestJS | `npm run start:dev` |
| Flask | `flask run --debug` |
| Django | `python manage.py runserver` |
| FastAPI | `uvicorn main:app --reload` |

### Fullstack Projects

WebRun detects common fullstack structures:
- `frontend/` + `backend/`
- `client/` + `server/`
- `web/` + `api/`
- `packages/web/` + `packages/api/`

Both servers start in separate terminals!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Publishing to VS Code Marketplace

### Prerequisites
1. Create a [Microsoft/Azure account](https://azure.microsoft.com/)
2. Create a publisher on [Visual Studio Marketplace](https://marketplace.visualstudio.com/manage)
3. Get a Personal Access Token (PAT) from Azure DevOps

### Steps

```bash
# Install vsce globally
npm install -g @vscode/vsce

# Login with your publisher
vsce login your-publisher-name

# Package the extension
vsce package

# Publish to marketplace
vsce publish
```

### Before Publishing Checklist
- [ ] Update `publisher` field in package.json
- [ ] Add a 128x128 PNG icon to `images/icon.png`
- [ ] Update repository URL in package.json
- [ ] Test the extension thoroughly
- [ ] Update version number
- [ ] Write a good description and changelog

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/codewithmishu/WebRun/blob/HEAD/LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
- Built with [VS Code Extension API](https://code.visualstudio.com/api)

---

**Made with ❤️ for developers who just want to run their code!**
