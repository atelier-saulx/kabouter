import { useCallback, useContext, useEffect, useMemo } from 'react'
import { useUpdate } from './useUpdate'
import { RouterContext } from './Provider'
import { PathSegment, RouterRootCtx, Value } from './types'
import { RouteParams } from './RouteParams'
import { useRouterListeners } from './useRouterListeners'

let routeId = 1

/**
Hook to listen to and update `location`

```javascript
  const route = useRoute('books/[book]/[page]', { book: 'default book!' })
  const { book, page } = route.path

  <div
      onClick={() => {
        // Will result in path "/book/mybook/1"
        route.setPath({
          book,
          page: page + 1,
        })
      }}
    >
      {book} {page}
    </div>
```
*/
export const useRoute = (
  path?: string,
  defaultValues?: { [key: string]: Value }
): RouteParams => {
  const ctx = useContext(RouterContext)

  let parent = ctx
  let rootCtx: RouterRootCtx

  const fromPath: PathSegment[] = []
  const id = useMemo(() => ++routeId, [])

  // can prob use a useMemo...
  while (parent && !rootCtx) {
    fromPath.unshift(...parent.path)
    if (parent.isRoot) {
      rootCtx = parent
      break
    }
    parent = parent.parent
  }

  if (!rootCtx) {
    rootCtx = useRouterListeners()
    ctx.parent = rootCtx
    rootCtx.createdBy = id
    fromPath.unshift(...rootCtx.path)
  } else if (rootCtx.createdBy === id) {
    useMemo(() => {}, [''])
    useEffect(() => {}, [''])
  }

  const start = fromPath.length - 1

  const routeParams = useMemo(() => {
    return new RouteParams(ctx, rootCtx, start, fromPath, path)
  }, [path, start])

  // use memo for faster effect then useeffect...
  useMemo(() => {
    if (defaultValues) {
      const n = {}
      let updateDefault = false
      for (const k in defaultValues) {
        if (routeParams.path[k] === undefined) {
          // @ts-ignore
          n[k] = routeParams._pathParams[k] = defaultValues[k]
          updateDefault = true
        }
      }
      if (updateDefault) {
        rootCtx.location = routeParams.parseLocation(n)
        rootCtx.updateRoute(false)
      }
    }
  }, [path])

  const update = useUpdate()

  useEffect(() => {
    return () => {
      rootCtx.componentMap.delete(id)
    }
  }, [])

  rootCtx.componentMap.set(id, {
    route: routeParams,
    update: useCallback(() => {
      if (routeParams.update()) {
        update()
      }
    }, [path]),
  })

  return routeParams
}
