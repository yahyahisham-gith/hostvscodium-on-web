"use strict";(function(){const{contextBridge:e}=require("electron"),t={getSelectedText(){try{return window.getSelection()?.toString()??""}catch{return""}}};try{e.exposeInIsolatedWorld(999,"browserViewAPI",t)}catch(r){console.error(r)}})();

//# sourceMappingURL=https://github.com/VSCodium/sourcemaps/releases/download/stable-e2b23bbd5646cc28aaa6f26ee53b257c290b6be1/core-vs\platform\browserView\electron-browser\preload-browserView.js.map
