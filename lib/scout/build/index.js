"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.begin = exports.createSession = exports.Env = exports.includesText = void 0;
// import browser from './browser'
const android_1 = require("./android");
function includesText(text, keyword, then) {
    const hasKeyword = text
        .text(block => block.text.includes(keyword));
    if (hasKeyword)
        return then();
}
exports.includesText = includesText;
var Env;
(function (Env) {
    Env[Env["BROWSER"] = 0] = "BROWSER";
    Env[Env["ANDROID"] = 1] = "ANDROID";
})(Env = exports.Env || (exports.Env = {}));
function createSession(type) {
    switch (type) {
        // case Environment.BROWSER: return browser(App)
        case Env.ANDROID: return (0, android_1.session)();
        default:
            throw new Error('Invalid session environment argument');
    }
}
exports.createSession = createSession;
/*
  @ Experimential JSX support
*/
function begin({ func, attrs, children }) {
    return __awaiter(this, void 0, void 0, function* () {
        yield func(attrs);
        for (const [_, child] of children.entries()) {
            // await begin(child)
        }
    });
}
exports.begin = begin;
function tagMap(tag) {
    switch (tag) {
        case 'schedule': return;
        case 'perform': return;
        case 'activity': return;
        case 'text': return;
        case 'tap': return;
        default:
            console.error('Syntax Error');
    }
}
exports.default = {
    createElement(tag, attrs, ...children) {
        const func = tagMap(tag);
        return { func, attrs: Object.assign(Object.assign({}, attrs), { children }) };
    }
};
