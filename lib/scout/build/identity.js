"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAccount = exports.createIdentity = void 0;
const generate_password_1 = require("generate-password");
function generatePassword() {
    return (0, generate_password_1.generate)({
        length: 16,
        numbers: true,
    });
}
/*
'Who?'
   What's their fingerpint?
   Name, Birthday, Email, Number, Device
   Name -> PI -> Contact -> Device
*/
// NOTE: This is debug dummy data
function createIdentity() {
    return {
        name: {
            first: 'Alexia',
            last: 'Wooten',
        },
        pi: {
            birthday: {
                mm: 6,
                dd: 9,
                yyyy: 2000,
            },
        },
        contact: {
            email: 'wootenalexia7@gmail.com',
            phone: '9866008680',
        },
        account: {
            password: 'tDLvdQpxdka-Tw2y',
        },
        device: {
            userAgent: 'Mozilla/5.0 (Linux; Android 9; moto e6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.73 Mobile Safari/537.36',
            platform: 'Android',
            platformVersion: '9.0.0',
            model: 'moto e6',
            arch: '',
            memory: '2',
        },
    };
}
exports.createIdentity = createIdentity;
function createAccount(identity) {
    // const username = 
    // return { username, password }
}
exports.createAccount = createAccount;
