import { getEnv } from './env'
import { Agenda } from 'agenda/es'

const MONGO_URI = getEnv('MONGO_URI')

export async function createTasker() {
  const agenda = new Agenda()
  agenda.database(MONGO_URI, 'agenda')
  agenda.start()
  return new Promise(resolve => (
    agenda.once('ready', () => resolve(agenda))
  ))
}

export async function schedule(agenda, interval, name, task) {
  agenda.define(name, task)
  await agenda.every(interval, name)
}
