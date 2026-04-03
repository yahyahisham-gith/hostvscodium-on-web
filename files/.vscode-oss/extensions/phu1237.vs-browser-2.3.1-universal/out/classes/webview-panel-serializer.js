"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const webviewHelper = require("../helpers/webview");
const browser_1 = require("../webviews/browser");
class WebviewPanelSerializer {
    constructor(context) {
        this.context = context;
    }
    async deserializeWebviewPanel(webviewPanel, state) {
        // `state` is the state persisted using `setState` inside the webview
        console.log("Got state: " + JSON.stringify(state));
        // Restore the content of our webview.
        //
        // Make sure we hold on to the `webviewPanel` passed in here and
        // also restore any event listeners we need on it.
        webviewHelper.createWebviewPanel(browser_1.default, this.context, state, webviewPanel);
    }
}
exports.default = WebviewPanelSerializer;
//# sourceMappingURL=webview-panel-serializer.js.map