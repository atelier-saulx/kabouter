import { useCallback, useContext, useEffect, useMemo } from 'react'
import { useUpdate } from './useUpdate'
import { RouterContext, Router } from './Provider'
import { RouterRootCtx } from './types'
import { RouteParams } from './RouteParams'
export { Router }

let routeId = 0

/**
Hook to interact with a single search param, set to `null` to clear

```javascript 
const [counter, setCounter] = useSearchParam('counter', 0)

<div onClick={() => {
        setCounter((counter) => counter + 1)
}}>
        {counter}
</div>
```
*/
export const useSearchParam = <T = any>(
  key: string,
  defaultValue?: T
): [T, (value: null | T | ((value: T) => T)) => void] => {
  const route = useRoute()
  const params = route.query
  const val = <T>params[key] ?? defaultValue
  return [
    val,
    (v) => {
      if (typeof v === 'function') {
        // @ts-ignore
        route.setQuery({ [key]: v(val) })
      } else {
        route.setQuery({ [key]: v })
      }
    },
  ]
}

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
