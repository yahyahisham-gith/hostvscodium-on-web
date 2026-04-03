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
exports.LiveServerTreeProvider = exports.FileItem = void 0;
const vscode = __importStar(require("vscode"));
class FileItem extends vscode.TreeItem {
    constructor(label, url, collapsibleState, iconPath, contextValue) {
        super(label, collapsibleState);
        this.url = url;
        if (contextValue) {
            this.contextValue = contextValue;
        }
        if (iconPath) {
            this.iconPath = iconPath;
        }
        if (url) {
            this.tooltip = url;
            this.command = {
                command: "liveServerPlusPlus.openUrl",
                title: "Open in Browser",
                arguments: [this],
            };
        }
    }
}
exports.FileItem = FileItem;
class LiveServerTreeProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.isRunning = false;
        this.port = 0;
        this.openedFiles = new Map();
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    setServerRunning(running, port) {
        this.isRunning = running;
        this.port = port;
        this.refresh();
    }
    addOpenedFile(filename, url) {
        this.openedFiles.set(filename, url);
        this.refresh();
    }
    removeOpenedFile(filename) {
        this.openedFiles.delete(filename);
        this.refresh();
    }
    clearOpenedFiles() {
        this.openedFiles.clear();
        this.refresh();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (!element) {
            const items = [];
            // ========== SERVER STATUS SECTION ==========
            const statusItem = new FileItem("SERVER STATUS", undefined, vscode.TreeItemCollapsibleState.None, new vscode.ThemeIcon("server"), "section");
            items.push(statusItem);
            if (this.isRunning) {
                const runningItem = new FileItem("Running", undefined, vscode.TreeItemCollapsibleState.None, new vscode.ThemeIcon("pass-filled", new vscode.ThemeColor("testing.iconPassed")));
                runningItem.description = `Port ${this.port}`;
                items.push(runningItem);
                const urlItem = new FileItem(`http://localhost:${this.port}`, `http://localhost:${this.port}`, vscode.TreeItemCollapsibleState.None, new vscode.ThemeIcon("globe"));
                urlItem.tooltip = "Click to open in browser";
                items.push(urlItem);
            }
            else {
                items.push(new FileItem("Stopped", undefined, vscode.TreeItemCollapsibleState.None, new vscode.ThemeIcon("circle-large-outline", new vscode.ThemeColor("testing.iconErrored"))));
            }
            // ========== QUICK ACTIONS SECTION ==========
            items.push(new FileItem("", undefined, vscode.TreeItemCollapsibleState.None));
            const actionsItem = new FileItem("QUICK ACTIONS", undefined, vscode.TreeItemCollapsibleState.None, new vscode.ThemeIcon("zap"), "section");
            items.push(actionsItem);
            if (this.isRunning) {
                // Open Current File button
                const openCurrentItem = new FileItem("Open Current File", undefined, vscode.TreeItemCollapsibleState.None, new vscode.ThemeIcon("file-code", new vscode.ThemeColor("charts.blue")));
                openCurrentItem.command = {
                    command: "liveServerPlusPlus.openCurrent",
                    title: "Open Current File",
                };
                openCurrentItem.tooltip = "Open the currently active HTML file";
                items.push(openCurrentItem);
                // Stop Server button
                const stopItem = new FileItem("Stop Server", undefined, vscode.TreeItemCollapsibleState.None, new vscode.ThemeIcon("debug-stop", new vscode.ThemeColor("testing.iconErrored")));
                stopItem.command = {
                    command: "liveServerPlusPlus.stop",
                    title: "Stop Server",
                };
                stopItem.tooltip = "Stop Live Server++";
                items.push(stopItem);
            }
            else {
                // Start Server button
                const startItem = new FileItem("Start Server", undefined, vscode.TreeItemCollapsibleState.None, new vscode.ThemeIcon("play", new vscode.ThemeColor("testing.iconPassed")));
                startItem.command = {
                    command: "liveServerPlusPlus.startWithPicker",
                    title: "Start Server",
                };
                startItem.tooltip = "Choose an HTML file and start the server";
                items.push(startItem);
            }
            // ========== ACTIVE FILES SECTION ==========
            if (this.isRunning && this.openedFiles.size > 0) {
                items.push(new FileItem("", undefined, vscode.TreeItemCollapsibleState.None));
                const filesHeaderItem = new FileItem("ACTIVE FILES", undefined, vscode.TreeItemCollapsibleState.None, new vscode.ThemeIcon("files"), "section");
                filesHeaderItem.description = `${this.openedFiles.size}`;
                items.push(filesHeaderItem);
                // List all opened files
                this.openedFiles.forEach((url, filename) => {
                    const fileItem = new FileItem(filename, url, vscode.TreeItemCollapsibleState.None, new vscode.ThemeIcon("file-code"), "openedFile");
                    fileItem.filename = filename;
                    fileItem.tooltip = `${url}\nClick to open in browser`;
                    items.push(fileItem);
                });
                // Clear All button
                if (this.openedFiles.size > 1) {
                    const clearAllItem = new FileItem("Clear All", undefined, vscode.TreeItemCollapsibleState.None, new vscode.ThemeIcon("clear-all"));
                    clearAllItem.command = {
                        command: "liveServerPlusPlus.stop",
                        title: "Clear All",
                    };
                    clearAllItem.tooltip = "Remove all files from the list";
                    items.push(clearAllItem);
                }
            }
            return Promise.resolve(items);
        }
        return Promise.resolve([]);
    }
}
exports.LiveServerTreeProvider = LiveServerTreeProvider;
//# sourceMappingURL=treeview.js.map