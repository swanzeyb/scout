import { playStrategy } from './strategy'
import { createSession } from './browser'

const name = 'Jeanie Beus'
const username = ''
const password = ''

const contextMap = {
  'inital': [
    'goto https://facebook.com/marketplace'
  ],
  'must log in': [
    'click Mobile number',
    `type ${username}`,
    'click Password',
    `type ${password}`,
    'click Log In',
  ],
  'Choose Your Account': [
    `click ${name.split(' ')[0]}`
  ],
  'Password': [
    'click Password',
    `type ${password}`,
    'click Log In',
  ],
  'Save your password': [
    'click Not now'
  ],
}

async function main() {
  const page = await createSession()
  playStrategy(contextMap, page)
    .then(() => console.log('Done!'))
    .catch(err => console.log('Play error', err.message))
}

main()
