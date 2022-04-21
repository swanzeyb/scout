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
exports.schedule = exports.createTasker = void 0;
const env_1 = require("./env");
const es_1 = require("agenda/es");
const MONGO_URI = (0, env_1.getEnv)('MONGO_URI');
function createTasker() {
    return __awaiter(this, void 0, void 0, function* () {
        const agenda = new es_1.Agenda();
        agenda.database(MONGO_URI, 'agenda');
        agenda.start();
        return new Promise(resolve => (agenda.once('ready', () => resolve(agenda))));
    });
}
exports.createTasker = createTasker;
function schedule(agenda, interval, name, task) {
    return __awaiter(this, void 0, void 0, function* () {
        agenda.define(name, task);
        yield agenda.every(interval, name);
    });
}
exports.schedule = schedule;
