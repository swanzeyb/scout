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
exports.setMany = exports.has = exports.get = exports.set = exports.subscribe = exports.collection = void 0;
const env_1 = require("./env");
const mongodb_1 = require("mongodb");
function collection(database, collection) {
    return __awaiter(this, void 0, void 0, function* () {
        const MONGO_URI = (0, env_1.getEnv)('MONGO_URI');
        const client = yield new mongodb_1.MongoClient(MONGO_URI).connect();
        const db = client.db(database);
        const col = db.collection(collection);
        return col;
    });
}
exports.collection = collection;
function subscribe(collection, then) {
    collection.watch().on('change', change => {
        const { operationType: type, fullDocument: document, } = change;
        if (type === 'insert')
            then(document);
    });
}
exports.subscribe = subscribe;
function set(cl, key, val) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield cl.insertOne(Object.assign(Object.assign({}, val), { _id: key }));
        }
        catch (err) {
            if (err.message.includes('duplicate key'))
                return;
            throw new Error(err);
        }
    });
}
exports.set = set;
function get(cl, key) {
    return cl.findOne({
        _id: key,
    });
}
exports.get = get;
function has(cl, key) {
    return cl.findOne({
        _id: key
    }).then(res => (res !== null));
}
exports.has = has;
function setMany(cl, docs) {
    return __awaiter(this, void 0, void 0, function* () {
    });
}
exports.setMany = setMany;
