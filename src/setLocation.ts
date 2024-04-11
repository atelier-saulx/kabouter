import { parseQuery, deepEqual } from '@saulx/utils'
import { RouterRootCtx } from './types'

export function setLocationOnContext(location: string, context: RouterRootCtx) {
  if (location === context.location) {
    return false
  }

  const [s, hash = ''] = location.split('#')
  const [pathName, q] = s.split('?')
  context.hash = hash

  const nQ = q ? parseQuery(decodeURIComponent(q)) || {} : {}

  if (pathName !== context.pathName) {
    context.pathChanged = true
  }

  if (!deepEqual(nQ, context.query)) {
    context.queryChanged = true
  }

  if (hash !== context.hash) {
    context.hashChanged = true
  }

  context.pathName = pathName
  context.query = nQ
  context.hash = hash
  context.location = location
  context.updateRoute(false)
  return true
}
