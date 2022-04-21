"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.begin = exports.schedule = exports.start = exports.Env = exports.includesText = void 0;
// import browser from './browser'
const android_1 = __importStar(require("./android"));
const agenda_1 = require("./agenda");
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
// This function evalutes the screen at a set interval
function start(type, App, when) {
    switch (type) {
        // case Environment.BROWSER: return browser(App)
        case Env.ANDROID: return (0, android_1.default)(App);
        default:
            throw new Error('Invalid strategy environment argument');
    }
}
exports.start = start;
function schedule(when, what, App) {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, agenda_1.define)(what, () => __awaiter(this, void 0, void 0, function* () {
            console.log('RUN APP');
            yield (0, android_1.android)(App);
        }));
        yield (0, agenda_1.every)(when, what);
        console.log('SCHEDULED');
    });
}
exports.schedule = schedule;
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
