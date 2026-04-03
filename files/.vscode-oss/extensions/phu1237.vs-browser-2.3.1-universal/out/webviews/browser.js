"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const fs_1 = require("fs");
const webview_1 = require("../constants/webview");
function convertVarToHTML(v) {
    var type = typeof v;
    switch (type) {
        case "string":
            return v;
    }
    return String(v);
}
function getFavourites(workspaceFolder) {
    let favorites = {};
    const configs = vscode.workspace.getConfiguration("vs-browser.favourites");
    const configsFavouritesList = configs.get("list") ?? {};
    favorites = {
        ...configsFavouritesList,
    };
    // Not supported yet
    if (workspaceFolder) {
        const workspaceConfigs = vscode.workspace.getConfiguration("vs-browser.favourites", workspaceFolder);
        const workspaceConfigsFavouritesList = workspaceConfigs.get("list") ?? {};
        favorites = {
            ...workspaceConfigsFavouritesList,
        };
    }
    return favorites;
}
exports.default = (webviewContext, data) => {
    // Render asset url
    function asset(path) {
        return webviewContext.webviewUri + path;
    }
    // Data
    const viewType = data["viewType"];
    const title = data["title"];
    // Get current config
    const configs = vscode.workspace.getConfiguration("vs-browser");
    const proxyMode = data["proxyMode"] !== undefined
        ? data["proxyMode"]
        : configs.get("proxyMode") || false;
    const url = data["url"] !== undefined
        ? data["url"]
        : configs.get("url") || "http://localhost";
    const favourites = data["favourites"] !== undefined ? data["favourites"] : getFavourites();
    const autoCompleteUrl = data["autoCompleteUrl"] !== undefined
        ? data["autoCompleteUrl"]
        : configs.get("autoCompleteUrl") || "http://";
    const localProxyServerEnabled = data["localProxyServerEnabled"] !== undefined
        ? data["localProxyServerEnabled"]
        : configs.get("localProxyServer.enabled") || false;
    const localProxyServerPort = data["localProxyServerPort"] !== undefined
        ? data["localProxyServerPort"]
        : configs.get("localProxyServer.port") || 9999;
    const localProxyServerForceLocation = data["localProxyServerForceLocation"] !== undefined
        ? data["localProxyServerForceLocation"]
        : configs.get("localProxyServer.forceLocation") || false;
    const autoReloadDurationEnabled = data["autoReloadDurationEnabled"] !== undefined
        ? data["autoReloadDurationEnabled"]
        : configs.get("reload.autoReloadDurationEnabled") || false;
    const autoReloadDurationTime = data["autoReloadDurationTime"] !== undefined
        ? data["autoReloadDurationTime"]
        : configs.get("reload.autoReloadDurationTime") || 15000;
    const replaceObject = {
        codiconsCss: asset("node_modules/@vscode/codicons/dist/codicon.css"),
        browserCss: asset("assets/css/browser.css"),
        jqueryJS: asset("assets/js/jquery-3.7.1.slim.min.js"),
        proxyJS: asset("assets/js/proxy.js"),
        localProxyServerScript: localProxyServerEnabled === true
            ? `<script>window.localProxy = 'http://localhost:${localProxyServerPort}/'</script>`
            : "",
        localProxyServerForceLocationScript: `<script>window.forceLocation = ${localProxyServerForceLocation}</script>`,
        proxyMode: proxyMode,
        url: `'${url}'`,
        favourites: JSON.stringify(favourites),
        autoCompleteUrl: `'${autoCompleteUrl}'`,
        localProxyServerEnabled: localProxyServerEnabled,
        localProxyServerPort: localProxyServerPort,
        localProxyServerForceLocation: localProxyServerForceLocation,
        autoReloadDurationEnabled: autoReloadDurationEnabled,
        autoReloadDurationTime: autoReloadDurationTime,
        viewType: `'${viewType}'`,
        title: `'${title}'`,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        CONST_WEBVIEW_POST_MESSAGE_TYPE_FAVOURITE_ADD: `'${webview_1.default.POST_MESSAGE.TYPE.FAVOURITE_ADD}'`,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        CONST_WEBVIEW_POST_MESSAGE_TYPE_FAVOURITE_REMOVE: `'${webview_1.default.POST_MESSAGE.TYPE.FAVOURITE_REMOVE}'`,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        CONST_WEBVIEW_POST_MESSAGE_TYPE_GO_TO_SETTINGS: `'${webview_1.default.POST_MESSAGE.TYPE.GO_TO_SETTINGS}'`,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        CONST_WEBVIEW_POST_MESSAGE_TYPE_OPEN_INSPECTOR: `'${webview_1.default.POST_MESSAGE.TYPE.OPEN_INSPECTOR}'`,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        CONST_WEBVIEW_POST_MESSAGE_TYPE_REFRESH_FAVOURITES: `'${webview_1.default.POST_MESSAGE.TYPE.REFRESH_FAVOURITES}'`,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        CONST_WEBVIEW_POST_MESSAGE_TYPE_RELOAD: `'${webview_1.default.POST_MESSAGE.TYPE.RELOAD}'`,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        CONST_WEBVIEW_POST_MESSAGE_TYPE_SHOW_MESSAGE_BOX: `'${webview_1.default.POST_MESSAGE.TYPE.SHOW_MESSAGE_BOX}'`,
    };
    let html = (0, fs_1.readFileSync)(webviewContext.extensionPath + "assets/browser.html", "utf8");
    for (const key in replaceObject) {
        html = html.replace(new RegExp(`{ ${key} }`, "g"), convertVarToHTML(replaceObject[key]));
    }
    console.log(html);
    return html;
};
//# sourceMappingURL=browser.js.map