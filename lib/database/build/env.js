"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnv = void 0;
require("dotenv/config");
function getEnv(key) {
    const result = process.env[key];
    if (!result) {
        const msg = `${key} missing from env`;
        throw new Error(msg);
    }
    return result;
}
exports.getEnv = getEnv;
