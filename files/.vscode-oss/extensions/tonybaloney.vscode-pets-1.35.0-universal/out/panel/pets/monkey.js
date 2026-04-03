"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MONKEY_NAMES = exports.Monkey = void 0;
const basepettype_1 = require("../basepettype");
class Monkey extends basepettype_1.BasePetType {
    label = 'monkey';
    static possibleColors = ["gray" /* PetColor.gray */];
    sequence = {
        startingState: "sit-idle" /* States.sitIdle */,
        sequenceStates: [
            {
                state: "sit-idle" /* States.sitIdle */,
                possibleNextStates: ["walk-right" /* States.walkRight */],
            },
            {
                state: "walk-right" /* States.walkRight */,
                possibleNextStates: ["sit-idle" /* States.sitIdle */, "walk-left" /* States.walkLeft */],
            },
            {
                state: "walk-left" /* States.walkLeft */,
                possibleNextStates: ["sit-idle" /* States.sitIdle */, "walk-right" /* States.walkRight */],
            },
            {
                state: "chase" /* States.chase */,
                possibleNextStates: ["idle-with-ball" /* States.idleWithBall */],
            },
            {
                state: "idle-with-ball" /* States.idleWithBall */,
                possibleNextStates: ["sit-idle" /* States.sitIdle */],
            },
        ],
    };
    get emoji() {
        return '🐒';
    }
    get hello() {
        return `Ooh ooh aah aah!`;
    }
}
exports.Monkey = Monkey;
exports.MONKEY_NAMES = ['Punch'];
//# sourceMappingURL=monkey.js.map