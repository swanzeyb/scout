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
exports.every = exports.define = void 0;
const es_1 = require("agenda/es");
const utils_1 = require("./utils");
const MONGO_URI = (0, utils_1.getEnv)('MONGO_URI');
const agenda = new es_1.Agenda();
agenda.database(MONGO_URI, 'agenda');
agenda.start();
const ready = new Promise(resolve => agenda.once('ready', resolve));
function define(name, task) {
    return __awaiter(this, void 0, void 0, function* () {
        yield ready;
        return agenda.define(name, task);
    });
}
exports.define = define;
function every(interval, name) {
    return __awaiter(this, void 0, void 0, function* () {
        yield ready;
        return agenda.every(interval, name);
    });
}
exports.every = every;
