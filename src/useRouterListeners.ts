import { useEffect, useMemo } from 'react'
import { parseQuery } from '@saulx/utils'
import { ComponentMap, RouterRootCtx, Location } from './types'
import { parsePath } from './preparePath'

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

export const useRouterListeners = (
  path: string = '',
  location: Location = {
    path: isBrowser ? window.location.pathname : '',
    query: isBrowser ? window.location.search.substring(1) : undefined,
    hash:
      isBrowser && window.location.hash
        ? window.location.hash.substring(1)
        : undefined,
  }
): RouterRootCtx => {
  const routes = useMemo(() => {
    const { path: pathName, query, hash } = location

    const componentMap: ComponentMap = new Map()
    const parsedLocation = parseLocation(query, hash, pathName)
    const ctx: RouterRootCtx = {
      isRoot: true,
      componentMap,
      hashChanged: false,
      queryChanged: false,
      pathChanged: false,
      hash,
      pathName,
      query: query ? parseQuery(query) || {} : {},
      location: parsedLocation,
      updateRoute: (fromPopState) => {
        const ordered = [...componentMap.values()].sort((a, b) => {
          return a.route.start < b.route.start
            ? -1
            : a.route.start === b.route.start
            ? 0
            : 1
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
      path: parsePath(path),
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
    return () => {}
  }, [path])

  return routes
}
