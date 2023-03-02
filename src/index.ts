import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  // @ts-ignore
  __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED as ITS_OK_DONT_WORRY,
} from 'react'
import { useUpdate } from './useUpdate'
import { RouterContext } from './Provider'
import { parseQuery } from '@saulx/utils'
import { RouterCtx, ComponentMap } from './types'
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

// TODO remove this!
// @ts-ignore
global.ITS_OK_DONT_WORRY = ITS_OK_DONT_WORRY
// ----------------------------------------------------------------------

const parseLocation = (q: string, hash: string, pathName: string): string => {
  return q && hash
    ? pathName + '?' + q + '#' + hash
    : q
    ? pathName + '?' + q
    : hash
    ? pathName + '#' + hash
    : pathName
}

export const useRouterListeners = (path?: string): RouterCtx => {
  const routes = useMemo(() => {
    // TODO: fix for server side
    const p = path ? path.split('/').slice(1) : []
    const pathName = window.location.pathname
    const q = window.location.search.substring(1)
    const hash = window.location.hash
    const componentMap: ComponentMap = new Map()
    const ctx: RouterCtx = {
      hashChanged: false,
      queryChanged: false,
      pathChanged: false,
      hash,
      pathName,
      query: q ? parseQuery(q) || {} : {},
      location: parseLocation(q, hash, pathName),
      updateRoute: (fromPopState) => {
        const ordered = [...componentMap.values()].sort((a, b) => {
          return a.start < b.start ? -1 : a.start === b.start ? 0 : 1
        })
        // want this to be ordered (top first)
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
      rootPath: p,
      componentMap,
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
  const node = ITS_OK_DONT_WORRY.ReactCurrentOwner.current

  const routeParams = useMemo(() => {
    return new RouteParams(ctx, path)
  }, [path])

  // ref also?
  useEffect(() => {
    return () => {
      ctx.componentMap.delete(node)
    }
  }, [])

  const update = useUpdate()

  if (node) {
    if (!node._id) {
      node._id = ++cnt
    }

    let parent = node.return
    let parentStore = ctx.componentMap.get(parent)
    while (!parentStore) {
      parent = parent.return
      if (parent) {
        parentStore = ctx.componentMap.get(parent)
      } else {
        break
      }
    }

    routeParams.start = parentStore
      ? parentStore.start + parentStore.path.length
      : ctx.rootPath.length

    ctx.componentMap.set(node, {
      path: routeParams.parsedPath,
      start: routeParams.start,
      update: useCallback(() => {
        if (routeParams.update()) {
          update()
        }
      }, [path]),
    })
  }

  // on update

  return routeParams
}
