"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const webview_1 = require("../helpers/webview");
class WebviewViewProvider {
    constructor(template, context, data) {
        this.template = template;
        this.context = context;
        this.data = data;
    }
    // Resolves and sets up the Webview
    resolveWebviewView(webviewView, context, _token) {
        // Configure Webview options
        webviewView.webview.options = {
            enableScripts: true,
        };
        const { title, viewType, url } = context.state || {};
        const persistedState = {
            title,
            viewType,
            url,
        };
        const state = {
            ...this.data,
            ...persistedState,
        };
        // Set the Webview content
        (0, webview_1.bindWebviewEvents)(webviewView, this.template, this.context, state);
    }
}
exports.default = WebviewViewProvider;
//# sourceMappingURL=webview-view-provider.js.map