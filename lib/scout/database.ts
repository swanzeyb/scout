
import { getEnv } from './env'
import { MongoClient } from 'mongodb'

// docker run -p 27017:27017 --name mongodev -d -e MONGO_INITDB_ROOT_USERNAME=scoutdev -e MONGO_INITDB_ROOT_PASSWORD=LgiWnWTSDPzthsX8 arm64v8/mongo:5.0.6-focal --replSet

export async function createDB(database, collection) {
  const MONGO_URI = getEnv('MONGO_URI')
  const client = await new MongoClient(MONGO_URI).connect()
  const db = client.db(database)
  const col = db.collection(collection)
  return col
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
