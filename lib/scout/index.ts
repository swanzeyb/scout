// import { createPersona, createSession } from './browser'
// import App from './app'

// const persona = createPersona()
// const session = createSession(persona)
// const app = App({ persona, session })
// console.log(app)

// When text is in context, do these steps
export function when(text, steps) {
  return {
    text,
    steps,
  }
}
