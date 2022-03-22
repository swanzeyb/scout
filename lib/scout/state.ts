
const states = new Map()
const instances = new Map()
let currentInstance

export function useState(initialState) {
  if (!states.has(currentInstance))
    states.set(currentInstance, initialState)

  return [
    states.get(currentInstance),
    (val) => states.set(currentInstance, val)
  ]
}

export function onUpdate(app, props) {
  const instanceToken = Symbol(app.name)

  if (!instances.has(app))
    instances.set(app, new Set())

  instances.get(app).add(instanceToken)
  currentInstance = instanceToken

  return {
    instance: instanceToken,
    children: app(props)
  }
}

// export default class State {
//   private states = new Map()
//   private instances = new Map()
//   private currentInstance

//   useState(initialState) {
//     if (!this.states.has(this.currentInstance))
//       this.states.set(this.currentInstance, initialState)

//     return [
//       this.states.get(this.currentInstance),
//       (val) => this.states.set(this.currentInstance, val)
//     ]
//   }

//   render(app, props) {
//     const instanceToken = Symbol(app.name)

//     if (!this.instances.has(app))
//       this.instances.set(app, new Set())

//     this.instances.get(app).add(instanceToken)
//     this.currentInstance = instanceToken

//     return {
//       instanceToken,
//       children: app(props)
//     }
//   }
// }
