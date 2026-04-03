"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showMessage = void 0;
const vscode = require("vscode");
/**
 * Show message box
 * @param type Type of message
 * @param message Context of message
 * @param options https://code.visualstudio.com/api/references/vscode-api#MessageOptions
 */
function showMessage(type, message, options = {}) {
    const configs = vscode.workspace.getConfiguration('vs-browser');
    let showMessageDialog = configs.get('showMessageDialog') || false;
    if (showMessageDialog) {
        switch (type) {
            case 'error':
                vscode.window.showErrorMessage(message, options);
                break;
            case 'warning':
                vscode.window.showWarningMessage(message, options);
                break;
            case 'info':
                vscode.window.showInformationMessage(message, options);
        }
    }
}
exports.showMessage = showMessage;
//# sourceMappingURL=index.js.map