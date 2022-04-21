import { Agenda } from 'agenda/es'
import { getEnv } from './utils'

const MONGO_URI = getEnv('MONGO_URI')
const agenda = new Agenda()

agenda.database(MONGO_URI, 'agenda')
agenda.start()

const ready = new Promise(resolve => agenda.once('ready', resolve))

export async function define(name, task) {
  await ready
  return agenda.define(name, task)
}

export async function every(interval, name) {
  await ready
  return agenda.every(interval, name)
}
