import React, { FC, ReactNode, CSSProperties, MouseEventHandler } from 'react'
import { Style, styled } from 'inlines'
import { useRoute } from './useRoute'

type LinkProps = {
  href?: string
  children?: ReactNode
  style?: CSSProperties | Style
  onClick?: MouseEventHandler<HTMLAnchorElement>
}
/*
 <a
        href={parsedHref}
        onClick={
          parsedHref.includes('?')
            ? (e) => {
                dispatchEvent(new Event('popstate'))
                onClick?.(e)
              }
            : parsedHref.includes('#')
            ? (e) => {
                dispatchEvent(new HashChangeEvent('hashchange'))
                onClick?.(e)
              }
            : onClick
        }
      >
*/

export const Link: FC<LinkProps> = styled(
  ({ href = '/', onClick, ...props }) => {
    const route = useRoute('/')

    // const parsedHref = parseHref(href)

    const wrappedOnClick: MouseEventHandler<HTMLAnchorElement> = onClick
      ? (e) => {
          e.preventDefault()
          e.stopPropagation()
          route.setPath({})
          onClick(e)
        }
      : (e) => {
          e.preventDefault()
          e.stopPropagation()
        }

    return <a href={href} onClick={wrappedOnClick} {...props} />
  },
  {
    display: 'block',
    color: 'inherit',
    textDecoration: 'none',
  }
)
