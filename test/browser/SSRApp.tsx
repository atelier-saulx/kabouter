import React, { FC } from 'react'
import { Router, Link, useRoute } from '../../src/index.js'

const QueryLink = ({ query }) => {
  return (
    <div>
      QUERY {JSON.stringify(query)} <Link query={query}>link</Link>
    </div>
  )
}

const PathLink = ({ path }) => {
  return (
    <div>
      PATH {JSON.stringify(path)} <Link path={path}>link</Link>
    </div>
  )
}

const Things = () => {
  const r = useRoute('[section]/[article]')
  return r.nest(
    <div>
      <div
        onClick={() => {
          r.setPath({ section: 'YO' })
        }}
      >
        CLICK
      </div>
      <PathLink path={{ article: 'snurp', section: 'flap' }} />
      <PathLink path={{ article: 'snarp', section: 'eu' }} />
    </div>,
  )
}

export const RouterExample: FC<{ location?: string }> = ({ location }) => {
  return (
    <div style={{ padding: 100 }}>
      <Router
        prefix="/ssr"
        location={
          location
            ? {
                path: location.split('?')[0],
                query: location.split('?')[1],
              }
            : {
                path: '/ssr',
                query: '',
              }
        }
      >
        <Things />
        <div>
          <Link href={'/paniloris'}>href</Link>
        </div>
        <div>
          <Link query={null}>RESET</Link>
        </div>
        <QueryLink query={{ articleId: 'foo' }} />
        <QueryLink query={{ articleId: 'bar' }} />
      </Router>
    </div>
  )
}
