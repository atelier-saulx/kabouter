import { useCallback, useContext, useEffect, useMemo } from 'react'
import { useUpdate } from './useUpdate'
import { RouterContext, Router } from './Provider'
import { PathSegment, RouterRootCtx } from './types'
import { RouteParams } from './RouteParams'
export { Router }

let routeId = 0

/**
Hook to listen to and update `location`

```javascript
  const route = useRoute('books/[book]/[page]')
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
export const useRoute = (path?: string): RouteParams => {
  // TODO: add optional rootPath for the root, and curent path for server
  const ctx = useContext(RouterContext)

  let parent = ctx
  let rootCtx: RouterRootCtx

  const fromPath: PathSegment[] = []

  while (parent && !rootCtx) {
    fromPath.unshift(...parent.path)
    if (parent.isRoot) {
      rootCtx = parent
      break
    }
    parent = parent.parent
  }

  const id = useMemo(() => ++routeId, [])
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
    path: routeParams.preparedPath,
    start: routeParams.start,
    update: useCallback(() => {
      if (routeParams.update()) {
        update()
      }
    }, [path]),
  })

  return routeParams
}
