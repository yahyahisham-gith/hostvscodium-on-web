"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateContextKey = exports.handleConfigurationChange = exports.unregisterTerminalLinkProviders = exports.registerTerminalLinkProviders = exports.unregisterDocumentLinkProviders = exports.registerDocumentLinkProviders = exports.registerViewContainer = exports.registerStatusBarItems = exports.registerCommands = exports.registerWebviewPanelSerializers = exports.onVersionChanged = exports.startStatusBarItem = void 0;
const vscode = require("vscode");
const webviewHelper = require("./webview");
const common_1 = require("./common");
const link_1 = require("./link");
const webview_panel_serializer_1 = require("../classes/webview-panel-serializer");
const webview_view_provider_1 = require("../classes/webview-view-provider");
const webview_1 = require("../constants/webview");
const browser_1 = require("../webviews/browser");
const changes_1 = require("../webviews/changes");
exports.startStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
/**
 * Watch the extension version is changed
 *
 * @param context VS Code context
 * @param outputConsole output console
 */
function onVersionChanged(context, outputConsole) {
    const configs = vscode.workspace.getConfiguration("vs-browser");
    let oldVersion = context.globalState.get("version");
    let extensionVersion = context.extension.packageJSON.version;
    let forceShowChanges = false;
    let showUpdateChanges = configs.get("showUpdateChanges");
    if ((oldVersion !== extensionVersion && showUpdateChanges) ||
        forceShowChanges) {
        context.globalState.update("version", extensionVersion);
        outputConsole.appendLine("> Extension is updated to " + extensionVersion);
        webviewHelper.createWebviewPanel(changes_1.default, context, {
            viewType: "changes",
            title: "VS Browser - New version changes",
            localProxyServerEnabled: false,
            columnToShowIn: "Active",
        });
    }
}
exports.onVersionChanged = onVersionChanged;
/**
 * Register Serializers for webviews type
 *
 * @param context VS Code context
 */
function registerWebviewPanelSerializers(context) {
    vscode.window.registerWebviewPanelSerializer("vs-browser.browser", new webview_panel_serializer_1.default(context));
    vscode.window.registerWebviewPanelSerializer("vs-browser.proxy", new webview_panel_serializer_1.default(context));
    vscode.window.registerWebviewPanelSerializer("vs-browser.withoutproxy", new webview_panel_serializer_1.default(context));
}
exports.registerWebviewPanelSerializers = registerWebviewPanelSerializers;
/**
 * Register Commands
 *
 * @param context VS Code context
 */
function registerCommands(context) {
    let start = vscode.commands.registerCommand("vs-browser.start", (args) => {
        const state = webview_1.default.CONFIG.BASE.BROWSER;
        if (args && args.url) {
            state.url = args.url;
        }
        webviewHelper.createWebviewPanel(browser_1.default, context, state);
    });
    context.subscriptions.push(start);
    // vs-browser.startWithProxy
    let startWithProxy = vscode.commands.registerCommand("vs-browser.startWithProxy", (args) => {
        const state = webview_1.default.CONFIG.BASE.PROXY;
        if (args && args.url) {
            state.url = args.url;
        }
        webviewHelper.createWebviewPanel(browser_1.default, context, webview_1.default.CONFIG.BASE.PROXY);
    });
    context.subscriptions.push(startWithProxy);
    // vs-browser.startWithoutProxy
    let startWithoutProxy = vscode.commands.registerCommand("vs-browser.startWithoutProxy", (args) => {
        const state = webview_1.default.CONFIG.BASE.WITHOUT_PROXY;
        if (args && args.url) {
            state.url = args.url;
        }
        webviewHelper.createWebviewPanel(browser_1.default, context, webview_1.default.CONFIG.BASE.WITHOUT_PROXY);
    });
    context.subscriptions.push(startWithoutProxy);
    // vs-browser.resetViewLocations
    let resetViewLocation = vscode.commands.registerCommand("vs-browser.resetViewLocations", () => {
        vscode.commands.executeCommand("vs-browser-browser.resetViewLocation");
        vscode.commands.executeCommand("vs-browser-proxy.resetViewLocation");
        vscode.commands.executeCommand("vs-browser-without-proxy.resetViewLocation");
    });
    context.subscriptions.push(resetViewLocation);
}
exports.registerCommands = registerCommands;
/**
 * Register Status bar items
 *
 * @param context VS Code context
 */
function registerStatusBarItems(context) {
    // register a new status bar item that we can now manage
    const configs = vscode.workspace.getConfiguration("vs-browser");
    let showStatusBarItem = configs.get("showStatusBarItem") || false;
    exports.startStatusBarItem.command = "vs-browser.start";
    exports.startStatusBarItem.text = "$(globe) VS Browser";
    exports.startStatusBarItem.tooltip = "Start VS Browser";
    context.subscriptions.push(exports.startStatusBarItem);
    if (showStatusBarItem) {
        exports.startStatusBarItem.show();
    }
    // show/hide status bar item when config changed
    vscode.workspace.onDidChangeConfiguration(() => {
        const configs = vscode.workspace.getConfiguration("vs-browser");
        showStatusBarItem = configs.get("showStatusBarItem") || false;
        if (!showStatusBarItem) {
            exports.startStatusBarItem.hide();
        }
        else {
            exports.startStatusBarItem.show();
        }
    });
}
exports.registerStatusBarItems = registerStatusBarItems;
/**
 * Register View Container
 *
 * @param context VS Code context
 */
function registerViewContainer(context) {
    context.subscriptions.push(vscode.window.registerWebviewViewProvider("vs-browser-browser", new webview_view_provider_1.default(browser_1.default, context, webview_1.default.CONFIG.BASE.BROWSER)));
    context.subscriptions.push(vscode.window.registerWebviewViewProvider("vs-browser-proxy", new webview_view_provider_1.default(browser_1.default, context, webview_1.default.CONFIG.BASE.PROXY)));
    context.subscriptions.push(vscode.window.registerWebviewViewProvider("vs-browser-without-proxy", new webview_view_provider_1.default(browser_1.default, context, webview_1.default.CONFIG.BASE.WITHOUT_PROXY)));
}
exports.registerViewContainer = registerViewContainer;
/////////////////////////////
// Document Link Providers //
/////////////////////////////
const registeredDocumentLinkProviders = [];
/**
 * Register Document Link Providers
 */
function registerDocumentLinkProviders(context) {
    const configs = vscode.workspace.getConfiguration("vs-browser");
    const isLinkEnabled = configs.get("link.enabled");
    const isOpenInDocument = configs.get("link.openIn") === "default" ||
        configs.get("link.openIn") === "document";
    if (!isLinkEnabled || (isLinkEnabled && !isOpenInDocument)) {
        return;
    }
    // Register command to open link
    registeredDocumentLinkProviders.push(vscode.commands.registerCommand("vs-browser.openLink", async ({ url }) => {
        await (0, link_1.handleLink)(context, {
            data: url,
        });
    }));
    registeredDocumentLinkProviders.push(vscode.languages.registerDocumentLinkProvider({ pattern: "**/*" }, {
        provideDocumentLinks(document) {
            const matches = (0, common_1.extractURLs)(document.getText());
            return matches.map((match) => {
                const args = { url: match[0] };
                return {
                    range: new vscode.Range(document.positionAt(match.index ?? 0), document.positionAt((match.index ?? 0) + match[0].length)),
                    tooltip: "Open Link in VS Browser",
                    target: vscode.Uri.parse(`command:vs-browser.openLink?${JSON.stringify(args)}`),
                };
            });
        },
    }));
}
exports.registerDocumentLinkProviders = registerDocumentLinkProviders;
/**
 * Unregister Document Link Providers
 */
function unregisterDocumentLinkProviders() {
    let disposable;
    while ((disposable = registeredDocumentLinkProviders.pop())) {
        disposable.dispose();
    }
}
exports.unregisterDocumentLinkProviders = unregisterDocumentLinkProviders;
/////////////////////////////
// Terminal Link Providers //
/////////////////////////////
const registeredTerminalLinkProviders = [];
/**
 * Register Terminal Link Providers
 *
 * @param context VS Code context
 */
function registerTerminalLinkProviders(context, outputConsole) {
    const configs = vscode.workspace.getConfiguration("vs-browser");
    const isLinkEnabled = configs.get("link.enabled");
    const isOpenInTerminal = configs.get("link.openIn") === "default" ||
        configs.get("link.openIn") === "terminal";
    if (!isLinkEnabled || (isLinkEnabled && !isOpenInTerminal)) {
        return;
    }
    registeredTerminalLinkProviders.push(vscode.window.registerTerminalLinkProvider(new (class {
        provideTerminalLinks(context, _token) {
            const matches = (0, common_1.extractURLs)(context.line);
            return matches.map((match) => {
                outputConsole.appendLine("Clicked to link: " + match[0]);
                return {
                    data: match[0],
                    startIndex: match.index,
                    tooltip: "Open Link in VS Browser",
                    length: match[0].length,
                };
            });
        }
        async handleTerminalLink(link) {
            await (0, link_1.handleLink)(context, link);
        }
    })()));
}
exports.registerTerminalLinkProviders = registerTerminalLinkProviders;
/**
 * Unregister Terminal Link Providers
 */
function unregisterTerminalLinkProviders() {
    registeredTerminalLinkProviders.forEach((disposable) => {
        disposable.dispose();
    });
}
exports.unregisterTerminalLinkProviders = unregisterTerminalLinkProviders;
/**
 * Handle when the configuration change
 *
 * @param event An event describing the change in Configuration
 */
function handleConfigurationChange(context, outputConsole, event) {
    const configs = vscode.workspace.getConfiguration("vs-browser");
    if (event.affectsConfiguration("vs-browser.link.enabled") ||
        event.affectsConfiguration("vs-browser.link.openIn")) {
        const isEnabled = configs.get("link.enabled");
        if (!isEnabled || event.affectsConfiguration("vs-browser.link.openIn")) {
            unregisterDocumentLinkProviders();
            unregisterTerminalLinkProviders();
        }
        registerDocumentLinkProviders(context);
        registerTerminalLinkProviders(context, outputConsole);
    }
    if (event.affectsConfiguration("vs-browser.showViewContainer")) {
        updateContextKey();
    }
    if (event.affectsConfiguration("vs-browser.showStatusBarItem")) {
        const showStatusBarItem = configs.get("showStatusBarItem");
        if (!showStatusBarItem) {
            exports.startStatusBarItem.hide();
        }
        else {
            exports.startStatusBarItem.show();
        }
    }
}
exports.handleConfigurationChange = handleConfigurationChange;
/**
 * Update VS Code context key to use when in package.json
 */
function updateContextKey() {
    const configs = vscode.workspace.getConfiguration("vs-browser");
    const showViewContainer = configs.get("showViewContainer");
    vscode.commands.executeCommand("setContext", "config.vs-browser.showViewContainer", showViewContainer);
}
exports.updateContextKey = updateContextKey;
//# sourceMappingURL=extension.js.map