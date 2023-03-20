import React, {
  FC,
  ReactNode,
  CSSProperties,
  useContext,
  MouseEventHandler,
  useMemo,
  useCallback,
} from 'react'
import { PathParams, QueryParams } from './types'
import { RouterContext } from './Provider'
import { serializeQuery } from '@saulx/utils'

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

console.log('fuck fuck')

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

  const hrefParsed = useMemo(() => {
    if (href) {
      return href
    }

    let link = '/'

    if (path && ctx.route) {
      const loc = ctx.route.parseLocation(path)
      link = loc
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
        ctx.route?.setLocation(hrefParsed)
      }
    },
    [hrefParsed]
  )

  return <a href={hrefParsed} onClick={wrappedOnClick} {...props} />
}
