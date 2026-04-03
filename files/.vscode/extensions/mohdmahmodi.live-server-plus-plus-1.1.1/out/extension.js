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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const server_1 = require("./server");
const treeview_1 = require("./treeview");
let liveServer = null;
let statusBarItem;
let treeProvider;
function activate(context) {
    console.log("Live Server++ extension is now active");
    // Create tree view provider for sidebar
    treeProvider = new treeview_1.LiveServerTreeProvider();
    const treeView = vscode.window.createTreeView("liveServerPlusPlus", {
        treeDataProvider: treeProvider,
        showCollapseAll: false,
    });
    // Create status bar item
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    context.subscriptions.push(statusBarItem);
    // Update status bar when active editor changes
    vscode.window.onDidChangeActiveTextEditor(() => {
        updateStatusBar();
    });
    updateStatusBar();
    statusBarItem.show();
    // Register start command (with optional URI)
    const startCommand = vscode.commands.registerCommand("liveServerPlusPlus.start", async (uri) => {
        await startServer(uri);
    });
    // Register start with file picker
    const startWithPickerCommand = vscode.commands.registerCommand("liveServerPlusPlus.startWithPicker", async () => {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            vscode.window.showErrorMessage("No workspace folder open");
            return;
        }
        // Find all HTML files in workspace
        const htmlFiles = await vscode.workspace.findFiles("**/*.{html,htm}", "**/node_modules/**");
        if (htmlFiles.length === 0) {
            vscode.window.showErrorMessage("No HTML files found in workspace. Please create an HTML file first.");
            return;
        }
        // Create quick pick items
        const items = htmlFiles.map((file) => {
            const relativePath = path.relative(workspaceFolder.uri.fsPath, file.fsPath);
            return {
                label: path.basename(file.fsPath),
                description: relativePath,
                uri: file,
            };
        });
        // Show quick pick
        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: "Select an HTML file to open with Live Server++",
            matchOnDescription: true,
        });
        if (selected) {
            await startServer(selected.uri);
        }
    });
    // Register open current file command
    const openCurrentCommand = vscode.commands.registerCommand("liveServerPlusPlus.openCurrent", async () => {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            vscode.window.showWarningMessage("No active file. Please open an HTML file first.");
            return;
        }
        const uri = activeEditor.document.uri;
        const ext = path.extname(uri.fsPath).toLowerCase();
        if (ext !== ".html" && ext !== ".htm") {
            vscode.window.showWarningMessage("Current file is not an HTML file. Please open an HTML file.");
            return;
        }
        await startServer(uri);
    });
    // Register stop command
    const stopCommand = vscode.commands.registerCommand("liveServerPlusPlus.stop", () => {
        if (!liveServer || !liveServer.isRunning()) {
            vscode.window.showWarningMessage("Live Server++ is not running");
            return;
        }
        const port = liveServer.getPort();
        liveServer.stop();
        liveServer = null;
        updateStatusBar();
        treeProvider.setServerRunning(false, 0);
        treeProvider.clearOpenedFiles();
        vscode.window.showInformationMessage(`Live Server++ stopped (port ${port})`);
    });
    // Register command to open URL from tree view
    const openUrlCommand = vscode.commands.registerCommand("liveServerPlusPlus.openUrl", async (item) => {
        if (item.url) {
            const config = vscode.workspace.getConfiguration("liveServerPlusPlus");
            const browser = config.get("browser", "default");
            await openBrowser(item.url, browser);
        }
    });
    // Register command to remove file from list
    const removeFileCommand = vscode.commands.registerCommand("liveServerPlusPlus.removeFile", async (item) => {
        if (item.filename) {
            treeProvider.removeOpenedFile(item.filename);
        }
    });
    // Register refresh command
    const refreshCommand = vscode.commands.registerCommand("liveServerPlusPlus.refresh", () => {
        treeProvider.refresh();
    });
    context.subscriptions.push(treeView, startCommand, startWithPickerCommand, openCurrentCommand, stopCommand, openUrlCommand, removeFileCommand, refreshCommand);
}
async function startServer(uri) {
    try {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            vscode.window.showErrorMessage("No workspace folder open");
            return;
        }
        const workspaceRoot = workspaceFolder.uri.fsPath;
        let fileToOpen = "";
        if (uri && uri.fsPath) {
            const stat = await vscode.workspace.fs.stat(uri);
            if (stat.type === vscode.FileType.File) {
                const relativePath = path.relative(workspaceRoot, uri.fsPath);
                fileToOpen = relativePath.replace(/\\/g, "/");
            }
        }
        // If server is already running, just open the file
        if (liveServer && liveServer.isRunning()) {
            const port = liveServer.getPort();
            const url = fileToOpen
                ? `http://localhost:${port}/${fileToOpen}`
                : `http://localhost:${port}`;
            const config = vscode.workspace.getConfiguration("liveServerPlusPlus");
            const browser = config.get("browser", "default");
            await openBrowser(url, browser);
            // Add to opened files list
            if (fileToOpen) {
                treeProvider.addOpenedFile(fileToOpen, url);
                vscode.window.showInformationMessage(`Opened ${fileToOpen}`);
            }
            return;
        }
        // Start server
        const config = vscode.workspace.getConfiguration("liveServerPlusPlus");
        const defaultPort = config.get("port", 3000);
        const browser = config.get("browser", "default");
        const autoReloadDelay = config.get("autoReloadDelay", 100);
        const enableCORS = config.get("enableCORS", true);
        const showConsoleLog = config.get("showConsoleLog", true);
        const verboseLogging = config.get("verboseLogging", false);
        liveServer = new server_1.LiveServer();
        const port = await liveServer.start({
            port: defaultPort,
            rootPath: workspaceRoot,
            workspacePath: workspaceRoot,
            autoReloadDelay: autoReloadDelay,
            enableCORS: enableCORS,
            showConsoleLog: showConsoleLog,
            verboseLogging: verboseLogging,
        });
        liveServer.getOutputChannel().show(true);
        // Update UI
        updateStatusBar();
        treeProvider.setServerRunning(true, port);
        const url = fileToOpen
            ? `http://localhost:${port}/${fileToOpen}`
            : `http://localhost:${port}`;
        if (fileToOpen) {
            treeProvider.addOpenedFile(fileToOpen, url);
        }
        await openBrowser(url, browser);
        vscode.window
            .showInformationMessage(`Live Server++ started on port ${port}`, "Show Output")
            .then((selection) => {
            if (selection === "Show Output" && liveServer) {
                liveServer.getOutputChannel().show();
            }
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        vscode.window.showErrorMessage(`Failed to start Live Server++: ${errorMessage}`);
        liveServer = null;
        updateStatusBar();
        treeProvider.setServerRunning(false, 0);
    }
}
function updateStatusBar() {
    const isRunning = liveServer && liveServer.isRunning();
    if (isRunning) {
        const port = liveServer.getPort();
        statusBarItem.text = `$(radio-tower) Close Live Server++`;
        statusBarItem.tooltip = `Live Server running on port ${port}\nClick to stop server`;
        statusBarItem.command = "liveServerPlusPlus.stop";
    }
    else {
        // Check if current file is HTML
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor) {
            const ext = path.extname(activeEditor.document.uri.fsPath).toLowerCase();
            if (ext === ".html" || ext === ".htm") {
                const filename = path.basename(activeEditor.document.uri.fsPath);
                statusBarItem.text = `$(radio-tower) Open with Live Server++`;
                statusBarItem.tooltip = `Open ${filename} with Live Server++`;
                statusBarItem.command = "liveServerPlusPlus.openCurrent";
                return;
            }
        }
        statusBarItem.text = "$(radio-tower) Open with Live Server++";
        statusBarItem.tooltip = "Start Live Server++";
        statusBarItem.command = "liveServerPlusPlus.startWithPicker";
    }
}
async function openBrowser(url, browser) {
    let command;
    switch (browser) {
        case "chrome":
            command =
                process.platform === "darwin"
                    ? 'open -a "Google Chrome"'
                    : process.platform === "win32"
                        ? "start chrome"
                        : "google-chrome";
            break;
        case "firefox":
            command =
                process.platform === "darwin"
                    ? 'open -a "Firefox"'
                    : process.platform === "win32"
                        ? "start firefox"
                        : "firefox";
            break;
        case "edge":
            command =
                process.platform === "darwin"
                    ? 'open -a "Microsoft Edge"'
                    : process.platform === "win32"
                        ? "start msedge"
                        : "microsoft-edge";
            break;
        default:
            await vscode.env.openExternal(vscode.Uri.parse(url));
            return;
    }
    const { exec } = require("child_process");
    exec(`${command} ${url}`, (error) => {
        if (error) {
            console.error("Failed to open browser:", error);
            vscode.env.openExternal(vscode.Uri.parse(url));
        }
    });
}
function deactivate() {
    if (liveServer && liveServer.isRunning()) {
        liveServer.stop();
    }
}
//# sourceMappingURL=extension.js.map