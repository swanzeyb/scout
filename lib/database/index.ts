
import { getEnv } from './env'
import { MongoClient } from 'mongodb'

export async function collection(database, collection) {
  const MONGO_URI = getEnv('MONGO_URI')
  const client = await new MongoClient(MONGO_URI).connect()
  const db = client.db(database)
  const col = db.collection(collection)
  return col
}

export function subscribe(collection, then) {
  collection.watch().on('change', change => {
    const {
      operationType: type,
      fullDocument: document,
    } = change
    if (type === 'insert') then(document)
  })
}

export async function set(cl, key, val) {
  try {
    return await cl.insertOne({
      ...val,
      _id: key,
    })
  } catch (err) {
    if (err.message.includes('duplicate key')) return
    throw new Error(err)
  }
}

export function get(cl, key) {
  return cl.findOne({
    _id: key,
  })
}

export function has(cl, key) {
  return cl.findOne({
    _id: key
  }).then(res => (
    res !== null
  ))
}

export async function setMany(cl, docs) {

}
