import React, {
  FC,
  ReactNode,
  CSSProperties,
  useContext,
  MouseEventHandler,
  MouseEvent,
  useMemo,
  useCallback,
} from 'react'
import { PathParams, QueryParams } from './types.js'
import { RouterContext } from './Provider.js'
import { serializeQuery } from '@saulx/utils'
import { hashObjectIgnoreKeyOrder } from '@saulx/hash'

type LinkProps = {
  children?: ReactNode
  path?: PathParams
  query?: QueryParams
  href?: string
  hash?: string
  location?: string
  style?: CSSProperties
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => boolean | void
}

/**
Link element supports all set functionality of useRoute, creates an `<a>` tag with the parsed url.
Attaches to the closest `route.nest()`

```javascript
    <Link
      path={{ bla: true }}
    >
      Go to bla!
    </Link>
```
*/
export const Link: FC<LinkProps> = ({
  onClick,
  path,
  query,
  hash,
  href,
  ...props
}) => {
  const ctx = useContext(RouterContext)

  if (ctx.isRoot) {
    const msg = 'Link needs to be used in a nested route'
    console.error(msg)
    return <div style={{ color: 'red' }}>{msg}</div>
  }

  const hrefParsed = useMemo(() => {
    if (href) {
      return href
    }

    let link = '/'

    if (path) {
      const loc = ctx.route.parseLocation(path)
      link = loc
    } else {
      link = ctx.route.rootCtx.location.replace(ctx.route.rootCtx.prefixRe, '')
    }

    const qP = query ? '?' + serializeQuery(query) : ''
    const hP = hash ? '#' + hash : ''

    return ctx.route.rootCtx.prefix + link + hP + qP
  }, [path ? hashObjectIgnoreKeyOrder(path) : null, query, hash, href])

  const wrappedOnClick: MouseEventHandler<HTMLAnchorElement> = useCallback(
    (e) => {
      if (onClick) {
        if (onClick(e)) {
          return
        }
      }
      if (!hrefParsed.startsWith('http')) {
        e.preventDefault()
        e.stopPropagation()
        if (href) {
          ctx.route.setLocation(href)
        }

        if (query !== undefined) {
          ctx.route.setQuery(query)
        }

        if (path) {
          ctx.route.setPath(path)
        }
      }
    },
    [hrefParsed],
  )

  return <a href={hrefParsed} onClick={wrappedOnClick} {...props} />
}
