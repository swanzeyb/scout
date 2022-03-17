import { generate } from 'generate-password'

function generatePassword() {
  return generate({
    length: 16,
    numbers: true,
  })
}

/*
'Who?'
   What's their fingerpint?
   Name, Birthday, Email, Number, Device
   Name -> PI -> Contact -> Device
*/
// NOTE: This is debug dummy data
export function createIdentity() {
  return {
    name: {
      first: 'Lily',
      last: 'Horner',
    },
    pi: {
      birthday: {
        mm: 6,
        dd: 28,
        yyyy: 2000,
      },
    },
    contact: {
      email: 'lilyhorner176@gmail.com',
      phone: '',
    },
    account: {
      password: 'tDLvdQpxdka-Tw2y',
    },
    device: {
      userAgent: '',
      platform: '',
      platformVersion: '',
      model: '',
      arch: '',
      memory: '',
    },
  }
}

export function createAccount(identity) {
  // const username = 
  // return { username, password }
}
