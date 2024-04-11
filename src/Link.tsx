import React, {
  FC,
  ReactNode,
  CSSProperties,
  useContext,
  MouseEventHandler,
  useMemo,
  useCallback,
} from 'react'
import { PathParams, QueryParams } from './types.js'
import { RouterContext } from './Provider.js'
import { serializeQuery } from '@saulx/utils'
import { useRoute } from './useRoute.js'
import { setLocationOnContext } from './setLocation.js'

type LinkProps = {
  children?: ReactNode
  path?: PathParams
  query?: QueryParams
  href?: string
  hash?: string
  location?: string
  style?: CSSProperties
  onClick?: MouseEventHandler<HTMLAnchorElement>
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
  const route = useRoute()

  const hrefParsed = useMemo(() => {
    if (href) {
      return href
    }

    let link = '/'

    if (path && ctx.route) {
      const loc = ctx.route.parseLocation(path)
      link = loc
    } else if (ctx.isRoot) {
      link = ctx.pathName
    } else {
      link = ctx.route.rootCtx.pathName
    }

    const qP = query ? '?' + serializeQuery(query) : ''
    const hP = hash ? '#' + hash : ''

    return link + hP + qP
  }, [path, query, hash, href])

  const wrappedOnClick: MouseEventHandler<HTMLAnchorElement> = useCallback(
    (e) => {
      if (onClick) {
        onClick(e)
      }

      if (!hrefParsed.startsWith('http')) {
        e.preventDefault()
        e.stopPropagation()

        if (ctx.isRoot) {
          setLocationOnContext(hrefParsed, ctx)
        } else {
          ctx.route?.setLocation(hrefParsed)
        }
      }
    },
    [hrefParsed]
  )

  return <a href={hrefParsed} onClick={wrappedOnClick} {...props} />
}
