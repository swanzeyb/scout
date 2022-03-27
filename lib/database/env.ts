import 'dotenv/config'

export function getEnv(key: string) {
  const result = process.env[key]
  if (!result) {
    const msg = `${key} missing from env`
    throw new Error(msg)
  }
  return result
}
