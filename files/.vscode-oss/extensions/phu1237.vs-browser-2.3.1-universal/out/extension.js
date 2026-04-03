"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const extensionHelper = require("./helpers/extension");
// Create output channel
const outputConsole = vscode.window.createOutputChannel("VS Browser");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    outputConsole.appendLine("Activated!");
    // Check if the extension is updated
    extensionHelper.onVersionChanged(context, outputConsole);
    // Register Serializers for webviews type
    extensionHelper.registerWebviewPanelSerializers(context);
    // Register Status bar items
    extensionHelper.registerStatusBarItems(context);
    // Register Commands
    extensionHelper.registerCommands(context);
    // Register Views
    extensionHelper.registerViewContainer(context);
    // Register Document Link Providers
    extensionHelper.registerDocumentLinkProviders(context);
    // Register Terminal Link Providers
    extensionHelper.registerTerminalLinkProviders(context, outputConsole);
    // Watch configuration changes
    vscode.workspace.onDidChangeConfiguration((event) => {
        extensionHelper.handleConfigurationChange(context, outputConsole, event);
    });
    extensionHelper.updateContextKey();
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map