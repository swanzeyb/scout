import { when } from 'scout'

export default function App({ persona, session }) {

  session.on('posts', posts => {

  })

  return [
    when('start', [
      'goto https://facebook.com/marketplace',
    ]),
    when('must log in', [
      'click Mobile number',
      `type ${persona.username}`,
      'click Password',
      `type ${persona.password}`,
      'click Log In',
    ]),
    when(`Marketplace Isn't Available`, [
      'send alert Persona Banned',
      'end session',
      'delete persona',
    ]),
    when('done', [
      'collect posts',
      'schedule refresh 8 mins from now'
    ])
  ]
}
