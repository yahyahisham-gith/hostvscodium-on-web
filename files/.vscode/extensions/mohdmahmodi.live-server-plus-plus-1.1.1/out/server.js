"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiveServer = void 0;
const http = __importStar(require("http"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const vscode = __importStar(require("vscode"));
const ws_1 = require("ws");
class LiveServer {
    constructor() {
        this.httpServer = undefined;
        this.wsServer = undefined;
        this.port = 3000;
        this.clients = new Set();
        this.fileWatcher = undefined;
        this.rootPath = "";
        this.workspacePath = "";
        this.config = undefined;
        // Cache for in-memory document content
        this.documentCache = new Map();
        this.MIME_TYPES = {
            ".html": "text/html",
            ".css": "text/css",
            ".js": "application/javascript",
            ".mjs": "application/javascript",
            ".json": "application/json",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".gif": "image/gif",
            ".svg": "image/svg+xml",
            ".ico": "image/x-icon",
            ".webp": "image/webp",
            ".woff": "font/woff",
            ".woff2": "font/woff2",
            ".ttf": "font/ttf",
            ".eot": "application/vnd.ms-fontobject",
            ".otf": "font/otf",
            ".mp4": "video/mp4",
            ".webm": "video/webm",
            ".mp3": "audio/mpeg",
            ".wav": "audio/wav",
            ".pdf": "application/pdf",
            ".txt": "text/plain",
            ".xml": "application/xml",
            ".webmanifest": "application/manifest+json",
        };
        this.LIVE_RELOAD_SCRIPT = `
    <script>
      (function() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const ws = new WebSocket(protocol + '//' + window.location.host + '/__live_reload');
        
        // Store original console methods
        const originalConsole = {
          log: console.log.bind(console),
          warn: console.warn.bind(console),
          error: console.error.bind(console),
          info: console.info.bind(console)
        };
        
        // Override console to send to server
        ['log', 'warn', 'error', 'info'].forEach(method => {
          console[method] = function(...args) {
            originalConsole[method](...args);
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({
                type: 'console',
                method: method,
                args: args.map(arg => {
                  try {
                    return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
                  } catch (e) {
                    return String(arg);
                  }
                })
              }));
            }
          };
        });
        
        // Create error overlay
        function createErrorOverlay(message) {
          let overlay = document.getElementById('__live_server_error_overlay');
          if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = '__live_server_error_overlay';
            overlay.style.cssText = \`
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              background: #ff4444;
              color: white;
              padding: 15px;
              font-family: monospace;
              font-size: 14px;
              z-index: 999999;
              box-shadow: 0 2px 10px rgba(0,0,0,0.3);
              border-bottom: 3px solid #cc0000;
            \`;
            document.body.appendChild(overlay);
          }
          overlay.innerHTML = \`
            <strong>⚠️ Error:</strong> \${message}
            <button onclick="this.parentElement.remove()" style="float: right; background: rgba(255,255,255,0.2); border: none; color: white; padding: 5px 10px; cursor: pointer; border-radius: 3px;">✕</button>
          \`;
        }
        
        function removeErrorOverlay() {
          const overlay = document.getElementById('__live_server_error_overlay');
          if (overlay) overlay.remove();
        }
        
        // Hot reload CSS without page refresh
        function hotReloadCSS(cssFile) {
          const links = document.querySelectorAll('link[rel="stylesheet"]');
          links.forEach(link => {
            if (cssFile && !link.href.includes(cssFile)) return;
            const href = link.href.split('?')[0];
            link.href = href + '?t=' + Date.now();
          });
        }
        
        ws.onmessage = function(event) {
          try {
            const message = JSON.parse(event.data);
            
            if (message.type === 'reload') {
              removeErrorOverlay();
              window.location.reload();
            } else if (message.type === 'css-update') {
              removeErrorOverlay();
              hotReloadCSS(message.file);
            } else if (message.type === 'error') {
              createErrorOverlay(message.message);
            }
          } catch (e) {
            // Legacy string message
            if (event.data === 'reload') {
              removeErrorOverlay();
              window.location.reload();
            }
          }
        };
        
        ws.onopen = function() {
          removeErrorOverlay();
        };
        
        ws.onclose = function() {
          setTimeout(function() {
            window.location.reload();
          }, 1000);
        };
        
        // Capture unhandled errors
        window.addEventListener('error', function(e) {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'console',
              method: 'error',
              args: ['Uncaught Error:', e.message, 'at', e.filename + ':' + e.lineno]
            }));
          }
        });
      })();
    </script>
  `;
        this.outputChannel = vscode.window.createOutputChannel("Live Server++");
    }
    async start(config) {
        this.config = config;
        this.rootPath = config.rootPath;
        this.workspacePath = config.workspacePath;
        this.port = await this.findAvailablePort(config.port);
        // Initialize document cache with currently open documents
        this.initializeDocumentCache();
        return new Promise((resolve, reject) => {
            try {
                // Create HTTP server
                this.httpServer = http.createServer((req, res) => this.handleRequest(req, res));
                this.httpServer.on("error", (error) => {
                    if (error.code === "EADDRINUSE") {
                        reject(new Error(`Port ${this.port} is already in use`));
                    }
                    else {
                        reject(error);
                    }
                });
                this.httpServer.listen(this.port, () => {
                    this.outputChannel.appendLine(`✨ Live Server++ started on http://localhost:${this.port}`);
                    this.outputChannel.appendLine(`📂 Serving: ${this.rootPath}`);
                    this.outputChannel.appendLine(`⚡ Live reload enabled (${config.autoReloadDelay}ms delay)`);
                    this.outputChannel.appendLine(`🔥 Serving unsaved changes in real-time\n`);
                    this.outputChannel.appendLine(`📝 Browser console output will appear below:\n`);
                    // Create WebSocket server for live reload
                    if (this.httpServer) {
                        this.wsServer = new ws_1.WebSocketServer({
                            server: this.httpServer,
                            path: "/__live_reload",
                        });
                        this.wsServer.on("connection", (ws) => {
                            if (config.verboseLogging) {
                                this.outputChannel.appendLine("[Verbose] Browser connected");
                            }
                            this.clients.add(ws);
                            ws.on("message", (data) => {
                                if (config.showConsoleLog) {
                                    try {
                                        const message = JSON.parse(data.toString());
                                        if (message.type === "console") {
                                            // Filter out Live Server's own internal logs
                                            const output = message.args.join(" ");
                                            if (!output.includes("[Live Server++]")) {
                                                const prefix = `[${message.method.toUpperCase()}]`;
                                                this.outputChannel.appendLine(`${prefix} ${output}`);
                                            }
                                        }
                                    }
                                    catch (e) {
                                        // Ignore parse errors
                                    }
                                }
                            });
                            ws.on("close", () => {
                                if (config.verboseLogging) {
                                    this.outputChannel.appendLine("[Verbose] Browser disconnected");
                                }
                                this.clients.delete(ws);
                            });
                        });
                    }
                    // Setup file watcher with auto-reload
                    this.setupAutoReload();
                    resolve(this.port);
                });
            }
            catch (error) {
                reject(error);
            }
        });
    }
    initializeDocumentCache() {
        // Cache all currently open text documents
        vscode.workspace.textDocuments.forEach((doc) => {
            if (doc.uri.scheme === "file" &&
                doc.uri.fsPath.startsWith(this.workspacePath)) {
                this.documentCache.set(doc.uri.fsPath, doc.getText());
            }
        });
    }
    async findAvailablePort(startPort) {
        let port = startPort;
        const maxAttempts = 100;
        for (let i = 0; i < maxAttempts; i++) {
            if (await this.isPortAvailable(port)) {
                return port;
            }
            port++;
        }
        throw new Error("No available ports found");
    }
    isPortAvailable(port) {
        return new Promise((resolve) => {
            const server = http.createServer();
            server.once("error", (err) => {
                if (err.code === "EADDRINUSE") {
                    resolve(false);
                }
                else {
                    resolve(false);
                }
            });
            server.once("listening", () => {
                server.close();
                resolve(true);
            });
            server.listen(port);
        });
    }
    handleRequest(req, res) {
        try {
            // Add CORS headers if enabled
            if (this.config?.enableCORS) {
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
                res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
                if (req.method === "OPTIONS") {
                    res.writeHead(204);
                    res.end();
                    return;
                }
            }
            // Parse URL and remove query strings
            let urlPath = req.url?.split("?")[0] || "/";
            // Default to index.html for root
            if (urlPath === "/") {
                urlPath = "/index.html";
            }
            // Construct file path
            let filePath = path.join(this.rootPath, urlPath);
            // Security check: prevent directory traversal
            const normalizedPath = path.normalize(filePath);
            if (!normalizedPath.startsWith(this.rootPath)) {
                this.sendError(res, 403, "Forbidden", "Access denied");
                return;
            }
            // Check if we have this file in memory cache (unsaved changes)
            let content = undefined;
            let fromCache = false;
            if (this.documentCache.has(normalizedPath)) {
                // Serve from in-memory cache (unsaved content)
                content = Buffer.from(this.documentCache.get(normalizedPath), "utf-8");
                fromCache = true;
            }
            else {
                // Check if file exists on disk
                if (!fs.existsSync(filePath)) {
                    // Try with .html extension
                    if (!path.extname(filePath)) {
                        const htmlPath = filePath + ".html";
                        if (fs.existsSync(htmlPath)) {
                            filePath = htmlPath;
                        }
                        else if (this.documentCache.has(htmlPath)) {
                            filePath = htmlPath;
                            content = Buffer.from(this.documentCache.get(htmlPath), "utf-8");
                            fromCache = true;
                        }
                        else {
                            this.send404(res, urlPath);
                            return;
                        }
                    }
                    else {
                        this.send404(res, urlPath);
                        return;
                    }
                }
                // If not from cache yet, check if it's a directory
                if (!fromCache) {
                    const stat = fs.statSync(filePath);
                    if (stat.isDirectory()) {
                        const indexPath = path.join(filePath, "index.html");
                        if (fs.existsSync(indexPath)) {
                            filePath = indexPath;
                        }
                        else if (this.documentCache.has(indexPath)) {
                            filePath = indexPath;
                            content = Buffer.from(this.documentCache.get(indexPath), "utf-8");
                            fromCache = true;
                        }
                        else {
                            this.sendDirectoryListing(res, filePath, urlPath);
                            return;
                        }
                    }
                }
                // Read from disk if not from cache
                if (!fromCache && !content) {
                    content = fs.readFileSync(filePath);
                }
            }
            // If still no content, return 404
            if (!content) {
                this.send404(res, urlPath);
                return;
            }
            const ext = path.extname(filePath).toLowerCase();
            const mimeType = this.MIME_TYPES[ext] || "application/octet-stream";
            // Inject live reload script for HTML files
            if (ext === ".html") {
                let htmlContent = content.toString("utf-8");
                // Inject before closing body tag or at the end
                if (htmlContent.includes("</body>")) {
                    htmlContent = htmlContent.replace("</body>", `${this.LIVE_RELOAD_SCRIPT}</body>`);
                }
                else if (htmlContent.includes("</html>")) {
                    htmlContent = htmlContent.replace("</html>", `${this.LIVE_RELOAD_SCRIPT}</html>`);
                }
                else {
                    htmlContent += this.LIVE_RELOAD_SCRIPT;
                }
                content = Buffer.from(htmlContent, "utf-8");
            }
            res.writeHead(200, {
                "Content-Type": mimeType,
                "Content-Length": content.length,
                "Cache-Control": "no-cache, no-store, must-revalidate",
                Pragma: "no-cache",
                Expires: "0",
                "X-Content-Type-Options": "nosniff",
                "X-Served-From": fromCache ? "memory" : "disk",
            });
            res.end(content);
        }
        catch (error) {
            console.error("Error handling request:", error);
            this.sendError(res, 500, "Internal Server Error", "An error occurred while processing your request");
        }
    }
    sendError(res, statusCode, title, message) {
        res.writeHead(statusCode, { "Content-Type": "text/html" });
        res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${statusCode} - ${title}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              background: #000;
              color: #fff;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              text-align: center;
            }
            .error-code {
              font-size: clamp(64px, 15vw, 120px);
              font-weight: 700;
              letter-spacing: -2px;
              margin-bottom: 20px;
              opacity: 0.9;
            }
            h1 { 
              font-size: clamp(24px, 5vw, 36px);
              font-weight: 600;
              margin-bottom: 16px;
              opacity: 0.95;
            }
            p { 
              font-size: clamp(14px, 3vw, 16px);
              line-height: 1.6;
              opacity: 0.7;
              margin-bottom: 32px;
            }
            .footer {
              font-size: 14px;
              opacity: 0.5;
              margin-top: 48px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="error-code">${statusCode}</div>
            <h1>${title}</h1>
            <p>${message}</p>
            <div class="footer">Live Server++</div>
          </div>
        </body>
      </html>
    `);
    }
    send404(res, requestedPath) {
        res.writeHead(404, { "Content-Type": "text/html" });
        res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>404 - Page Not Found</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              background: #000;
              color: #fff;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              text-align: center;
            }
            .error-code {
              font-size: clamp(64px, 15vw, 120px);
              font-weight: 700;
              letter-spacing: -2px;
              margin-bottom: 20px;
              opacity: 0.9;
            }
            h1 { 
              font-size: clamp(24px, 5vw, 36px);
              font-weight: 600;
              margin-bottom: 16px;
              opacity: 0.95;
            }
            .path {
              background: #111;
              padding: 12px 16px;
              border-radius: 6px;
              font-family: 'Courier New', monospace;
              font-size: clamp(12px, 2.5vw, 14px);
              margin: 24px 0;
              word-break: break-all;
              opacity: 0.8;
              border: 1px solid #222;
            }
            p { 
              font-size: clamp(14px, 3vw, 16px);
              line-height: 1.6;
              opacity: 0.7;
              margin-bottom: 24px;
            }
            a {
              color: #fff;
              text-decoration: none;
              opacity: 0.7;
              transition: opacity 0.2s;
              display: inline-block;
              margin-top: 16px;
              font-size: clamp(13px, 2.5vw, 14px);
            }
            a:hover {
              opacity: 1;
            }
            .footer {
              font-size: 14px;
              opacity: 0.5;
              margin-top: 48px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="error-code">404</div>
            <h1>Page Not Found</h1>
            <div class="path">${requestedPath}</div>
            <p>The requested file does not exist.<br>Please check the directory.</p>
            <div class="footer">Live Server++</div>
          </div>
        </body>
      </html>
    `);
    }
    findSimilarFiles(requestedPath) {
        try {
            const dir = path.dirname(path.join(this.rootPath, requestedPath));
            if (!fs.existsSync(dir))
                return [];
            const files = fs.readdirSync(dir);
            const requestedFile = path.basename(requestedPath).toLowerCase();
            // Find files with similar names
            const similar = files
                .filter((file) => {
                const fileLower = file.toLowerCase();
                return (fileLower.includes(requestedFile.slice(0, 3)) ||
                    requestedFile.includes(fileLower.slice(0, 3)));
            })
                .slice(0, 5)
                .map((file) => path.join(path.dirname(requestedPath), file).replace(/\\/g, "/"));
            return similar;
        }
        catch (error) {
            return [];
        }
    }
    sendDirectoryListing(res, dirPath, urlPath) {
        try {
            const files = fs.readdirSync(dirPath);
            let html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Directory: ${urlPath}</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                background: #f5f5f5;
                padding: 20px;
              }
              .container {
                max-width: 900px;
                margin: 0 auto;
                background: white;
                border-radius: 10px;
                padding: 30px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              }
              h1 { 
                color: #333;
                margin-bottom: 10px;
                font-size: 28px;
              }
              .path {
                color: #666;
                margin-bottom: 30px;
                font-family: monospace;
                font-size: 14px;
              }
              ul { 
                list-style: none;
              }
              li { 
                padding: 12px;
                border-bottom: 1px solid #eee;
                transition: background 0.2s;
              }
              li:hover {
                background: #f9f9f9;
              }
              a { 
                text-decoration: none;
                color: #667eea;
                display: flex;
                align-items: center;
              }
              a:hover { 
                color: #764ba2;
              }
              .icon {
                margin-right: 10px;
                font-size: 20px;
              }
              .folder { color: #ffa502; }
              .file { color: #667eea; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>📁 Directory Browser</h1>
              <div class="path">${urlPath}</div>
              <ul>
      `;
            // Add parent directory link
            if (urlPath !== "/") {
                const parentPath = path.dirname(urlPath);
                html += `
          <li>
            <a href="${parentPath}">
              <span class="icon">📁</span>
              <span>..</span>
            </a>
          </li>
        `;
            }
            // Sort: folders first, then files
            const sorted = files.sort((a, b) => {
                const aPath = path.join(dirPath, a);
                const bPath = path.join(dirPath, b);
                const aIsDir = fs.statSync(aPath).isDirectory();
                const bIsDir = fs.statSync(bPath).isDirectory();
                if (aIsDir && !bIsDir)
                    return -1;
                if (!aIsDir && bIsDir)
                    return 1;
                return a.localeCompare(b);
            });
            sorted.forEach((file) => {
                const fullPath = path.join(dirPath, file);
                const stat = fs.statSync(fullPath);
                const isDir = stat.isDirectory();
                const href = path.join(urlPath, file).replace(/\\/g, "/");
                const icon = isDir ? "📁" : "📄";
                const className = isDir ? "folder" : "file";
                html += `
          <li>
            <a href="${href}">
              <span class="icon ${className}">${icon}</span>
              <span>${file}</span>
            </a>
          </li>
        `;
            });
            html += `
              </ul>
            </div>
          </body>
        </html>
      `;
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(html);
        }
        catch (error) {
            this.sendError(res, 500, "Internal Server Error", "Error reading directory");
        }
    }
    setupAutoReload() {
        if (!this.config)
            return;
        const debounceTimers = new Map();
        // Listen to text document changes (as you type)
        const changeListener = vscode.workspace.onDidChangeTextDocument((event) => {
            const doc = event.document;
            // Only watch files in workspace
            if (!doc.uri.fsPath.startsWith(this.workspacePath))
                return;
            const ext = path.extname(doc.fileName).toLowerCase();
            // Only watch relevant files
            if (![".html", ".css", ".js", ".json"].includes(ext))
                return;
            // Update document cache with latest content
            this.documentCache.set(doc.uri.fsPath, doc.getText());
            // Clear existing timer for this file
            const existingTimer = debounceTimers.get(doc.uri.fsPath);
            if (existingTimer) {
                clearTimeout(existingTimer);
            }
            // Set new debounced timer
            const timer = setTimeout(() => {
                if (this.config.verboseLogging) {
                    this.outputChannel.appendLine(`[Verbose] File changed: ${path.basename(doc.fileName)}`);
                }
                // CSS gets hot-reloaded, others trigger full reload
                if (ext === ".css") {
                    this.sendToClients({
                        type: "css-update",
                        file: path.basename(doc.fileName),
                    });
                }
                else {
                    this.sendToClients({ type: "reload" });
                }
                debounceTimers.delete(doc.uri.fsPath);
            }, this.config.autoReloadDelay);
            debounceTimers.set(doc.uri.fsPath, timer);
        });
        // Listen when documents are saved
        const saveListener = vscode.workspace.onDidSaveTextDocument((doc) => {
            if (doc.uri.fsPath.startsWith(this.workspacePath) &&
                this.config.verboseLogging) {
                this.outputChannel.appendLine(`[Verbose] File saved: ${path.basename(doc.fileName)}`);
            }
        });
        // Listen when documents are closed (remove from cache)
        const closeListener = vscode.workspace.onDidCloseTextDocument((doc) => {
            if (doc.uri.fsPath.startsWith(this.workspacePath)) {
                this.documentCache.delete(doc.uri.fsPath);
                if (this.config.verboseLogging) {
                    this.outputChannel.appendLine(`[Verbose] Document closed: ${path.basename(doc.fileName)}`);
                }
            }
        });
        // Also watch for file system changes (for images, etc.)
        const pattern = new vscode.RelativePattern(this.workspacePath, "**/*.{png,jpg,jpeg,gif,svg,webp,ico}");
        const fsWatcher = vscode.workspace.createFileSystemWatcher(pattern);
        const handleFSChange = (uri) => {
            if (this.config.verboseLogging) {
                this.outputChannel.appendLine(`[Verbose] Asset changed: ${path.basename(uri.fsPath)}`);
            }
            this.sendToClients({ type: "reload" });
        };
        fsWatcher.onDidChange(handleFSChange);
        fsWatcher.onDidCreate(handleFSChange);
        fsWatcher.onDidDelete(handleFSChange);
        // Store disposables
        this.fileWatcher = vscode.Disposable.from(changeListener, saveListener, closeListener, fsWatcher);
    }
    sendToClients(message) {
        const messageStr = JSON.stringify(message);
        this.clients.forEach((client) => {
            if (client.readyState === ws_1.WebSocket.OPEN) {
                client.send(messageStr);
            }
        });
    }
    stop() {
        // Close all WebSocket connections
        this.clients.forEach((client) => {
            client.close();
        });
        this.clients.clear();
        // Close WebSocket server
        if (this.wsServer) {
            this.wsServer.close();
            this.wsServer = undefined;
        }
        // Close HTTP server
        if (this.httpServer) {
            this.httpServer.close();
            this.httpServer = undefined;
        }
        // Dispose file watcher
        if (this.fileWatcher) {
            this.fileWatcher.dispose();
            this.fileWatcher = undefined;
        }
        // Clear document cache
        this.documentCache.clear();
        this.outputChannel.appendLine("\n🛑 Live Server++ stopped");
    }
    getPort() {
        return this.port;
    }
    isRunning() {
        return this.httpServer !== undefined;
    }
    getOutputChannel() {
        return this.outputChannel;
    }
}
exports.LiveServer = LiveServer;
//# sourceMappingURL=server.js.map