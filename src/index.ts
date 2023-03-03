import { useCallback, useContext, useEffect, useMemo } from 'react'
import { useUpdate } from './useUpdate'
import { RouterContext } from './Provider'
import { parseQuery } from '@saulx/utils'
import { RouterCtx, ComponentMap, RouterRootCtx } from './types'
import { RouteParams } from './RouteParams'

// maybe make this into a seperate pkg? or make sure parsing works well
export const parseHref = (href = '/') => {
  if (href !== '/' && href[href.length - 1] === '/') {
    href = href.slice(0, -1)
  }
  const { search } = location
  if (search) {
    const i = href.indexOf('?')
    if (i !== -1) {
      const a = new URLSearchParams(search)
      const b = new URLSearchParams(href.substring(i))
      b.forEach((value, key) => {
        a.set(key, value)
      })
      href = `${href.substring(0, i)}?${a.toString()}`
    } else {
      href = `${href}${search}`
    }
  }
  return href
}

const parseLocation = (q: string, hash: string, pathName: string): string => {
  return q && hash
    ? pathName + '?' + q + '#' + hash
    : q
    ? pathName + '?' + q
    : hash
    ? pathName + '#' + hash
    : pathName
}

export const useRouterListeners = (path: string = '/'): RouterCtx => {
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
        // Want this to be ordered (top first)

        ordered.forEach((v) => {
          v.update()
        })

        routes.pathChanged = false
        routes.hashChanged = false
        routes.queryChanged = false
        if (!fromPopState) {
          global.history.pushState(undefined, undefined, ctx.location)
        }
      },
      children: [],
      path: p,
    }
    return ctx
  }, [path])

  useEffect(() => {
    if (typeof window !== 'undefined') {
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

let cnt = 0

export const useRoute = (path?: string): RouteParams => {
  const ctx = useContext(RouterContext)

  let parent = ctx
  let rootCtx: RouterRootCtx

  const fromPath: string[] = []

  while (parent && !rootCtx) {
    fromPath.unshift(...parent.path)

    if (parent.isRoot) {
      rootCtx = parent
      break
    }

    parent = parent.parent
  }

  const id = useMemo(() => ++cnt, [])
  const start = fromPath.length - 1

  const routeParams = useMemo(() => {
    return new RouteParams(ctx, rootCtx, start, fromPath, path)
  }, [path, start])

  const update = useUpdate()

  useEffect(() => {
    return () => {
      rootCtx.componentMap.delete(id)
    }
  }, [])

  rootCtx.componentMap.set(id, {
    path: routeParams.parsedPath,
    start: routeParams.start,
    update: useCallback(() => {
      if (routeParams.update()) {
        update()
      }
    }, [path]),
  })

  return routeParams
}
