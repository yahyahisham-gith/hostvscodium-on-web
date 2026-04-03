"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
/* eslint-disable @typescript-eslint/naming-convention */
const FAVOURITES_SAVING_PROFILE = {
    NAME: {
        AUTO: "auto",
        GLOBAL: "global",
        WORKSPACE: "workspace",
    },
    DEFAULT: "global",
};
const STATUS_BAR_ITEM = {
    ALIGNMENT: vscode_1.StatusBarAlignment.Right,
    PRIORITY: 100,
};
exports.default = {
    FAVOURITES_SAVING_PROFILE,
    STATUS_BAR_ITEM,
};
//# sourceMappingURL=configs.js.map