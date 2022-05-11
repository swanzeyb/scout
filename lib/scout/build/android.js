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
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.session = exports.executeSteps = exports.textContext = exports.extractTextBlocks = exports.Device = void 0;
const adbkit_1 = __importStar(require("@devicefarmer/adbkit"));
const buffer_1 = require("buffer");
const form_data_1 = __importDefault(require("form-data"));
const strategy_1 = require("./strategy");
const utils_1 = require("./utils");
const events_1 = require("events");
const TEXT_API_URI = (0, utils_1.getEnv)('TEXT_API_URI');
const EVAL_LOOP_DELAY = Number((0, utils_1.getEnv)('EVAL_LOOP_DELAY'));
/*
  @ Android ADB Creation
*/
const adb = adbkit_1.default.createClient();
class Device extends adbkit_1.DeviceClient {
    constructor(client, serial) {
        super(client, serial);
    }
    getResolution() {
        return this.shell('wm size')
            .then(utils_1.streamToBuffer)
            .then(buff => buff.toString('utf8'))
            .then(result => {
            const [width, height] = result
                .trim()
                .slice(result.indexOf(': ') + 2).split('x');
            this.resolution = {
                width: Number(width),
                height: Number(height)
            };
            return this.resolution;
        });
    }
    getActivity() {
        return this.shell('dumpsys window windows')
            .then(utils_1.streamToBuffer)
            .then(buff => buff.toString('utf8'))
            .then(res => (res.match(/(?<=net.|com.).+(?=\/)/g) || [])[0]);
    }
    isInteractive() {
        return this.shell('dumpsys input_method | grep mInteractive')
            .then(utils_1.streamToBuffer)
            .then(buff => buff.toString('utf8'))
            .then(result => {
            const is = result.slice(result.indexOf('mInteractive') + 13).trim();
            return is === 'true';
        });
    }
    togglePower() {
        return this.shell('input keyevent 26');
    }
    tap(x, y) {
        return this.shell(`input tap ${x} ${y}`);
    }
    swipe(x1, y1, x2, y2) {
        return this.shell(`input touchscreen swipe ${x1} ${y1} ${x2} ${y2}`);
    }
    type(text) {
        return this.shell(`input text "${text}"`)
            .then(stream => {
            stream.on('data', data => console.log('DATA YO', data));
        });
    }
    openApp(bundleID) {
        console.log('open bundle', bundleID);
        return this.shell(`monkey -p ${bundleID} -c android.intent.category.LAUNCHER 1`);
    }
    closeApp(bundleID) {
        return this.shell(`am force-stop ${bundleID}`);
    }
    keycode(code) {
        return this.shell(`input keyevent ${code}`);
    }
    goBack() {
        const x = (this.resolution.width / 3) - 20;
        const y = this.resolution.height - 20;
        return this.tap(x, y);
    }
    goHome() {
        const x = this.resolution.width / 2;
        const y = this.resolution.height - 20;
        return this.tap(x, y);
    }
    openTasker() {
        const x = this.resolution.width - ((this.resolution.width / 3) + 20);
        const y = this.resolution.height - 20;
        return this.tap(x, y);
    }
}
exports.Device = Device;
/*
  @ Context Report Generators
*/
function extractTextBlocks(image, viewport) {
    return new Promise((resolve, reject) => {
        const form = new form_data_1.default();
        form.append('image', image);
        form.append('viewport', JSON.stringify(viewport));
        form.submit(TEXT_API_URI, (err, response) => {
            if (err)
                return reject(err);
            response.once('data', buffer => {
                const str = buffer.toString('utf8');
                if (str === 'Internal Server Error')
                    reject('OCR API returned an internal error');
                const json = JSON.parse(str)['text'];
                resolve(json);
            });
        });
    });
}
exports.extractTextBlocks = extractTextBlocks;
function textContext(device, resolution, delay) {
    return __asyncGenerator(this, arguments, function* textContext_1() {
        const last = {
            cap: buffer_1.Buffer.alloc(0),
            texts: [],
        };
        while (true) {
            // console.time('Eval Loop')
            yield __await((0, utils_1.wait)(delay));
            const cap = yield __await(device.screencap()
                .then(utils_1.streamToBuffer));
            if (buffer_1.Buffer.compare(last.cap, cap) !== 0) {
                last.cap = cap;
                const texts = yield __await(extractTextBlocks(cap, resolution));
                last.texts = texts;
                yield yield __await(texts);
            }
            else {
                yield yield __await(last.texts);
            }
            // console.timeEnd('Eval Loop')
        }
    });
}
exports.textContext = textContext;
/*
  @ Strategy Execution
*/
const android = {
    refresh: ({ width, height }) => [width / 2, height * 0.14, width / 2, height * 0.5],
    scrollDown: ({ width, height }) => [width / 2, height * 0.7, width / 2, height * 0.35],
    scrollUp: ({ width, height }) => [width / 2, height * 0.35, width / 2, height * 0.7],
    tapVertical: (target, text, direction) => {
        const location = text
            .findIndex(block => block.text.includes(target));
        if (location === -1) {
            const msg = `Target: ${target} not found in context`;
            throw new Error(msg);
        }
        else {
            const block = text[location];
            return direction === -1
                ? [block.left + 10, block.top + block.height + 120]
                : [block.left + 10, block.top - 120];
        }
    },
};
const chrome = {
    searchBar: ({ width, height }) => [width / 2, 124],
};
function createMethods(device) {
    return {
        'tap': (pt) => device.tap(pt[0], pt[1]),
        'tap above': (pt) => device.tap(pt[0], pt[1] + 20),
        'tap below': (pt) => device.tap(pt[0], pt[1] - 20),
        'tap home': () => device.goHome(),
        'tap back': () => device.goBack(),
        'tap windows': () => device.openTasker(),
        'Chrome search': (pt) => device.tap(pt[0], pt[1]),
        'pull down refresh': (pts) => device.swipe(pts[0], pts[1], pts[2], pts[3]),
        'scroll down': (pts) => device.swipe(pts[0], pts[1], pts[2], pts[3]),
        'scroll up': (pts) => device.swipe(pts[0], pts[1], pts[2], pts[3]),
        'type': (txt) => device.type(txt),
        'wait': (amt) => (0, utils_1.wait)(amt),
        'enter': (code) => device.keycode(code),
        'open': (app) => device.openApp(app),
        'close': (app) => device.closeApp(app),
    };
}
function createParsers(device, text) {
    return {
        'tap': (target) => (0, strategy_1.targetToPoint)(target, text),
        'tap above': (target) => android.tapVertical(target, text, 1),
        'tap below': (target) => android.tapVertical(target, text, -1),
        'Chrome search': () => chrome.searchBar(device.resolution),
        'pull down refresh': () => android.refresh(device.resolution),
        'scroll down': () => android.scrollDown(device.resolution),
        'scroll up': () => android.scrollUp(device.resolution),
        'wait': (amount) => Number(amount),
        'enter': () => 66,
    };
}
function executeSteps(device, text, steps) {
    return __awaiter(this, void 0, void 0, function* () {
        const methods = createMethods(device);
        const parsers = createParsers(device, text);
        const actions = typeof steps === 'string' ? [steps] : steps;
        yield (0, strategy_1.executeSteps)(actions, methods, parsers);
    });
}
exports.executeSteps = executeSteps;
class Session extends events_1.EventEmitter {
    constructor(blocksReporter, device) {
        super();
        this.blocksReporter = blocksReporter;
        this.device = device;
    }
    start() {
        var e_1, _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                for (var _b = __asyncValues(this.blocksReporter), _c; _c = yield _b.next(), !_c.done;) {
                    const textBlocks = _c.value;
                    this.textBlocks = textBlocks;
                    this.emit('update', textBlocks);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) yield _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
        });
    }
    waitOneCycle() {
        return new Promise(resolve => {
            this.once('update', () => {
                resolve(null);
            });
        });
    }
    stopExecution() {
        this.emit('cancel');
    }
    perform(steps) {
        return executeSteps(this.device, this.textBlocks, steps);
    }
    repeatUntilText(text, repeat, timeout = 60000) {
        let start = Date.now();
        let stop = false;
        return new Promise((resolve, reject) => {
            const hasTextYet = (blocks) => __awaiter(this, void 0, void 0, function* () {
                if (blocks.some(block => block.text.includes(text)) || stop) {
                    this.removeListener('update', hasTextYet);
                    yield this.waitOneCycle();
                    resolve(null);
                }
                else if (Date.now() - start > timeout) {
                    reject('Operation Timeout');
                }
                else {
                    repeat();
                }
            });
            this.on('update', hasTextYet);
            this.once('cancel', () => {
                stop = true;
            });
        });
    }
    waitForText(text) {
        return this.repeatUntilText(text, () => null);
    }
    scrollDownToText(text) {
        return this.repeatUntilText(text, () => __awaiter(this, void 0, void 0, function* () {
            yield this.perform(['wait 200', 'scroll down', 'wait 200']);
        }));
    }
}
/*
  @ Device Setup
*/
function session(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const devices = yield adb.listDevices();
        if (devices.length < 1)
            throw new Error('No Android devices found');
        if (!devices.some(device => device.id === id))
            throw new Error(`Android Device ID '${id}' not found`);
        // For now, use first device found
        const deviceId = devices[0].id;
        const device = new Device(adb.getDevice(deviceId), deviceId);
        const resolution = yield device.getResolution();
        // Text on screen report generator
        const textBlocks = textContext(device, resolution, EVAL_LOOP_DELAY);
        // Start getting text off screen of device
        const session = new Session(textBlocks, device);
        session.start();
        return { device, session };
    });
}
exports.session = session;
