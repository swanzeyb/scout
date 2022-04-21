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
exports.onUpdate = exports.onMount = exports.useEffect = exports.useMount = void 0;
const mount = new Set();
const update = new Set();
function useMount(func) {
    mount.add(func);
}
exports.useMount = useMount;
function useEffect(func) {
    update.add(func);
}
exports.useEffect = useEffect;
function onMount(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const effect of mount) {
            yield effect(ctx);
        }
    });
}
exports.onMount = onMount;
function onUpdate(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const effect of update) {
            yield effect(ctx);
        }
    });
}
exports.onUpdate = onUpdate;
