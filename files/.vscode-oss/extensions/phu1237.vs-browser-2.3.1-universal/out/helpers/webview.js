"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bindWebviewEvents = exports.sendMessageToWebview = exports.sendMessageToActivePanels = exports.getWebViewContent = exports.createWebviewPanel = void 0;
const vscode = require("vscode");
// helpers
const common_1 = require("./common");
const server = require("./server");
const configs_1 = require("../constants/configs");
const webview_1 = require("../constants/webview");
const extension_1 = require("../helpers/extension");
let activePanels = [];
/**
 * Inject event and context to panel
 *
 * @param template Template of the webview
 * @param context Extension context
 * @param data Data to inject
 * @param webviewPanel Panel to show (ex: From restored state)
 * @returns
 */
function createWebviewPanel(template, context, data, webviewPanel) {
    // Start proxy server
    let configs = vscode.workspace.getConfiguration("vs-browser");
    let proxyMode = data["proxyMode"] !== undefined
        ? data["proxyMode"]
        : configs.get("proxyMode") || false;
    let localProxyServerEnabled = data["localProxyServerEnabled"] !== undefined
        ? data["localProxyServerEnabled"]
        : configs.get("localProxyServer.enabled") || false;
    if (proxyMode && localProxyServerEnabled) {
        server.start(function () {
            const configs = vscode.workspace.getConfiguration("vs-browser");
            const port = configs.get("localProxyServer.port") || 9999;
            extension_1.startStatusBarItem.text = "$(cloud) VS Browser: " + port;
        });
    }
    let panel = webviewPanel;
    if (!panel) {
        // Create new column
        const column = data["columnToShowIn"] !== undefined
            ? data["columnToShowIn"]
            : configs.get("columnToShowIn") || "Two";
        let columnToShowIn = vscode.ViewColumn.Two;
        switch (column) {
            case "One":
                columnToShowIn = vscode.ViewColumn.One;
                break;
            case "Two":
                columnToShowIn = vscode.ViewColumn.Two;
                break;
            case "Three":
                columnToShowIn = vscode.ViewColumn.Three;
                break;
            case "Active":
                columnToShowIn = vscode.ViewColumn.Active;
                break;
            case "Beside":
                columnToShowIn = vscode.ViewColumn.Beside;
                break;
            default:
        }
        panel = vscode.window.createWebviewPanel("vs-browser." + data["viewType"], // Identifies the type of the webview. Used internally
        data["title"], // Title of the panel displayed to the user
        columnToShowIn, // Editor column to show the new webview panel in.
        {
            enableScripts: true,
            // freeze when panel not focused
            retainContextWhenHidden: true,
            // enable find widget
            enableFindWidget: true,
        });
    }
    bindWebviewEvents(panel, template, context, data);
    activePanels.push(panel);
    return panel;
}
exports.createWebviewPanel = createWebviewPanel;
/**
 * Get webview context
 *
 * @param webview
 * @param extensionUri
 * @param extensionPath
 * @param data
 * @returns
 */
function getWebViewContent(template, webview, extensionUri, extensionPath, data) {
    // Create uri for webview
    const webviewUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, "/"));
    return template({
        webviewUri: webviewUri,
        extensionPath: extensionPath + "/",
    }, data);
}
exports.getWebViewContent = getWebViewContent;
function sendMessageToActivePanels(message) {
    console.log("Sending message to active panels: ", activePanels, message);
    activePanels.forEach((activePanel) => {
        sendMessageToWebview(activePanel, message);
    });
}
exports.sendMessageToActivePanels = sendMessageToActivePanels;
function sendMessageToWebview(panel, message) {
    panel.webview.postMessage(message);
}
exports.sendMessageToWebview = sendMessageToWebview;
function bindWebviewEvents(panel, template, context, data) {
    let configs = vscode.workspace.getConfiguration("vs-browser");
    panel.webview.html = getWebViewContent(template, panel.webview, context.extensionUri, context.extensionPath, data);
    // Handle messages from the webview
    panel.webview.onDidReceiveMessage((message) => {
        switch (message.type) {
            case webview_1.default.POST_MESSAGE.TYPE.FAVOURITE_ADD:
            case webview_1.default.POST_MESSAGE.TYPE.FAVOURITE_REMOVE: {
                const configs = vscode.workspace.getConfiguration("vs-browser.favourites");
                const configsFavouritesSavingProfile = configs.get("savingProfile") ||
                    configs_1.default.FAVOURITES_SAVING_PROFILE.DEFAULT;
                let favouritesSavingProfile;
                if (configsFavouritesSavingProfile ===
                    configs_1.default.FAVOURITES_SAVING_PROFILE.NAME.GLOBAL) {
                    favouritesSavingProfile = vscode.ConfigurationTarget.Global;
                }
                else if (configsFavouritesSavingProfile ===
                    configs_1.default.FAVOURITES_SAVING_PROFILE.NAME.WORKSPACE) {
                    favouritesSavingProfile = vscode.ConfigurationTarget.Workspace;
                }
                let favourites = configs.get("list") || {};
                favourites = {
                    ...favourites,
                };
                if (message.type === webview_1.default.POST_MESSAGE.TYPE.FAVOURITE_ADD) {
                    console.log("Click on Add to Favourites button");
                    favourites[message.value] = message.value;
                }
                else {
                    console.log("Click on Remove from Favourites button");
                    delete favourites[message.value];
                }
                configs.update("list", favourites, favouritesSavingProfile);
                console.log("Saved favorites: ", favourites);
                sendMessageToActivePanels({
                    type: webview_1.default.POST_MESSAGE.TYPE.REFRESH_FAVOURITES,
                    value: favourites,
                });
                return;
            }
            case webview_1.default.POST_MESSAGE.TYPE.OPEN_INSPECTOR:
                console.log("Click on Open Inspector button");
                vscode.commands.executeCommand("workbench.action.webview.openDeveloperTools");
                return;
            case webview_1.default.POST_MESSAGE.TYPE.GO_TO_SETTINGS:
                vscode.commands.executeCommand("workbench.action.openSettings", "vs-browser");
                return;
            case webview_1.default.POST_MESSAGE.TYPE.SHOW_MESSAGE_BOX:
                let type = message.value.type;
                let text = message.value.text;
                let detail = message.value.detail;
                console.log(message.value.detail);
                (0, common_1.showMessage)(type, text, {
                    detail: detail,
                });
                return;
        }
    }, undefined, context.subscriptions);
    // Handle panel state change event
    // panel.onDidChangeViewState(
    //   (e: any) => {
    //     let panel = e.webviewPanel;
    //     switch (panel.viewColumn) {
    //       case vscode.ViewColumn.One:
    //         console.log("ViewColumn.One");
    //         return;
    //       case vscode.ViewColumn.Two:
    //         console.log("ViewColumn.Two");
    //         return;
    //       case vscode.ViewColumn.Three:
    //         console.log("ViewColumn.Three");
    //         return;
    //     }
    //   },
    //   null,
    //   context.subscriptions
    // );
    // Handle when panel is closed
    panel.onDidDispose(() => {
        // When the panel is closed, cancel any future updates to the webview content
        const configs = vscode.workspace.getConfiguration("vs-browser");
        let localProxyServerEnabled = configs.get("localProxyServer.enabled");
        if (localProxyServerEnabled) {
            server.stop(function () {
                extension_1.startStatusBarItem.text = "$(globe) VS Browser";
            });
        }
        activePanels = activePanels.filter((p) => p !== panel);
    }, null, context.subscriptions);
    // Handle when save file
    let reloadOnSave = data["reloadOnSave"] !== undefined
        ? data["reloadOnSave"]
        : configs.get("reload.onSave") || false;
    if (reloadOnSave) {
        vscode.workspace.onDidSaveTextDocument((document) => {
            if (document.fileName.endsWith("settings.json")) {
                console.log("Edited settings file. Skip this reload.", document.fileName);
                return;
            }
            panel.webview.postMessage({
                type: webview_1.default.POST_MESSAGE.TYPE.RELOAD,
            });
        });
    }
}
exports.bindWebviewEvents = bindWebviewEvents;
//# sourceMappingURL=webview.js.map