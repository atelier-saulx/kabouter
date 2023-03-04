import { useEffect, useMemo } from 'react'
import { parseQuery } from '@saulx/utils'
import { ComponentMap, RouterRootCtx } from './types'

const isBrowser = typeof window !== 'undefined'

const parseLocation = (q: string, hash: string, pathName: string): string => {
  return q && hash
    ? pathName + '?' + q + '#' + hash
    : q
    ? pathName + '?' + q
    : hash
    ? pathName + '#' + hash
    : pathName
}

export const useRouterListeners = (path: string = ''): RouterRootCtx => {
  const routes = useMemo(() => {
    // TODO: fix for server side
    const p = path.split('/')
    const pathName = window.location.pathname
    const q = window.location.search.substring(1)
    const hash = window.location.hash
    const componentMap: ComponentMap = new Map()

    const location = parseLocation(q, hash, pathName)

    const ctx: RouterRootCtx = {
      isRoot: true,
      componentMap,
      hashChanged: false,
      queryChanged: false,
      pathChanged: false,
      hash,
      pathName,
      query: q ? parseQuery(q) || {} : {},
      location,
      updateRoute: (fromPopState) => {
        const ordered = [...componentMap.values()].sort((a, b) => {
          return a.start < b.start ? -1 : a.start === b.start ? 0 : 1
        })
        ordered.forEach((v) => {
          v.update()
        })
        routes.pathChanged = false
        routes.hashChanged = false
        routes.queryChanged = false
        if (!fromPopState && isBrowser) {
          global.history.pushState(undefined, undefined, ctx.location)
        }
      },
      children: [],
      path: p,
    }
    return ctx
  }, [path])

  useEffect(() => {
    if (isBrowser) {
      const listener = () => {
        const pathName = window.location.pathname
        const q = window.location.search.substring(1)
        const hash = window.location.hash
        if (routes.hash !== hash) {
          routes.hashChanged = true
        }
        routes.hash = hash
        if (pathName !== routes.pathName) {
          routes.pathChanged = true
        }
        routes.pathName = pathName
        if (q !== routes.queryString) {
          routes.queryChanged = true
        }
        routes.queryString = q
        routes.query = q ? parseQuery(q) || {} : {}
        const newLocation = parseLocation(q, hash, pathName)
        if (newLocation !== routes.location) {
          routes.location = newLocation
          routes.updateRoute(true)
        }
      }
      global.addEventListener('hashchange', listener)
      global.addEventListener('popstate', listener)
      return () => {
        global.removeEventListener('hashchange', listener)
        global.removeEventListener('popstate', listener)
      }
    }
    // Add path option in router  / here
    return () => {}
  }, [path])

  return routes
}
