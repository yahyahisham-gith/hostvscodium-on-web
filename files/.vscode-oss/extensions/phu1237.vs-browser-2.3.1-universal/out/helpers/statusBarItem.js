"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStartStatusBarItem = exports.startStatusBarItem = void 0;
const vscode = require("vscode");
exports.startStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
function createStartStatusBarItem(context) {
    // create a new status bar item that we can now manage
    const configs = vscode.workspace.getConfiguration('vs-browser');
    let showStatusBarItem = configs.get('showStatusBarItem') || false;
    exports.startStatusBarItem.command = 'vs-browser.start';
    exports.startStatusBarItem.text = '$(globe) VS Browser';
    exports.startStatusBarItem.tooltip = 'Start VS Browser';
    context.subscriptions.push(exports.startStatusBarItem);
    if (showStatusBarItem) {
        exports.startStatusBarItem.show();
    }
    // show/hide status bar item when config changed
    vscode.workspace.onDidChangeConfiguration(() => {
        const configs = vscode.workspace.getConfiguration('vs-browser');
        showStatusBarItem = configs.get('showStatusBarItem') || false;
        if (!showStatusBarItem) {
            exports.startStatusBarItem.hide();
        }
        else {
            exports.startStatusBarItem.show();
        }
    });
}
exports.createStartStatusBarItem = createStartStatusBarItem;
//# sourceMappingURL=statusBarItem.js.map