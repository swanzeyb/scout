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
exports.targetToPoint = exports.randomInt = exports.executeSteps = exports.parseQuery = void 0;
function parseQuery(query, methods) {
    const methodNames = Object.keys(methods);
    const length = query.split(' ').length;
    for (let i = 0; i < length; i++) {
        const parts = query.split(' ');
        Array(i).fill(0)
            .forEach(_ => parts.pop());
        const segment = parts.join(' ');
        if (methodNames.includes(segment)) {
            const method = segment;
            const payload = query.slice(method.length + 1);
            return [method, payload];
        }
    }
    throw new Error(`No method found for query ${query}`);
}
exports.parseQuery = parseQuery;
function executeSteps(steps, methods, parsers) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            const [method, payload] = parseQuery(step, methods);
            const action = methods[method];
            const parser = parsers[method];
            const data = parser ? parser(payload) : payload;
            try {
                yield action(data);
            }
            catch (err) {
                console.error('Failed to execute strategy step', err.message);
            }
        }
    });
}
exports.executeSteps = executeSteps;
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
exports.randomInt = randomInt;
function targetToPoint(target, context) {
    const location = context
        .findIndex(block => block.text.includes(target));
    if (location === -1) {
        const msg = `Target: ${target} not found in context`;
        throw new Error(msg);
    }
    else {
        const block = context[location];
        return [block.left + 10, block.center[1]];
    }
}
exports.targetToPoint = targetToPoint;
