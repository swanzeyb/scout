
const mount: Set<Function> = new Set()
const update: Set<Function>  = new Set()

export function useMount(func: Function) {
  mount.add(func)
}

export function useEffect(func: Function) {
  update.add(func)
}

export async function onMount(ctx) {
  for (const effect of mount) {
    await effect(ctx)
  }
}

export async function onUpdate(ctx) {
  for (const effect of update) {
    await effect(ctx)
  }
}
