
export function parseQuery(query, methods) {
  const methodNames = Object.keys(methods)
  const length = query.split(' ').length

  for (let i = 0; i < length; i++) {
    const parts = query.split(' ')
    Array(i).fill(0)
      .forEach(_ => parts.pop())
    const segment = parts.join(' ')

    if (methodNames.includes(segment)) {
      const method = segment
      const payload = query.slice(method.length + 1)
      return [method, payload]
    }
  }

  throw new Error(`No method found for query ${query}`)
}

export async function executeSteps(steps, methods, parsers) {
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const [method, payload] = parseQuery(step, methods)
    const action = methods[method]
    const parser = parsers[method]
    const data = parser ? parser(payload) : payload

    try {
      await action(data)
    } catch (err) {
      console.error('Failed to execute strategy step', err.message)
    }
  }
}
