"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleLink = void 0;
const vscode = require("vscode");
const webview_1 = require("../constants/webview");
const webviewHelper = require("./webview");
const browser_1 = require("../webviews/browser");
/**
 * Handle Link
 *
 * @param context vscode.ExtensionContext
 * @param link CustomLink
 */
async function handleLink(context, link) {
    if (link.data === "") {
        vscode.window.showErrorMessage("VS Browser: No URL found to open.");
        return;
    }
    let configs = vscode.workspace.getConfiguration("vs-browser.link");
    let openWith = configs.get("openWith");
    if (configs.get("openWith") === "ask") {
        openWith = await vscode.window.showQuickPick([
            "default",
            "vs-browser-browser",
            "vs-browser-proxy",
            "vs-browser-without-proxy",
        ], {
            placeHolder: "Where do you want to open the link?",
        });
    }
    let state;
    switch (openWith) {
        case "vs-browser-browser":
            state = webview_1.default.CONFIG.BASE.BROWSER;
            break;
        case "vs-browser-proxy":
            state = webview_1.default.CONFIG.BASE.PROXY;
            break;
        case "vs-browser-without-proxy":
            state = webview_1.default.CONFIG.BASE.WITHOUT_PROXY;
            break;
        case "default":
            vscode.env.openExternal(vscode.Uri.parse(link.data));
            return;
        default:
            return;
    }
    state.url = link.data;
    webviewHelper.createWebviewPanel(browser_1.default, context, state);
}
exports.handleLink = handleLink;
//# sourceMappingURL=link.js.map