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

const Bla = () => {
  const r = useRoute()
  return (
    <div>
      <p>SECTION: {r.path.section}</p>

      <p>ARTICLE: {r.path.article}</p>
      <PathLink path={{ article: null, section: null }} />
    </div>
  )
}

const Things = () => {
  const r = useRoute('[section]/[article]')

  return r.nest(
    <div>
      <p>LOCATION: {r.location}</p>

      <p>SECTION: {r.path.section}</p>

      <p>ARTICLE: {r.path.article}</p>
      <Bla />

      <div
        onClick={() => {
          r.setPath({ section: 'YO' })
        }}
      >
        CLICK
      </div>
      <PathLink path={{ article: 'snarp', section: 'eu' }} />
    </div>,
  )
}

export const RouterExample: FC<{ location?: string }> = ({ location }) => {
  return (
    <div style={{ padding: 100 }}>
      <Router
        location={
          location
            ? {
                path: location.split('?')[0],
                query: location.split('?')[1],
              }
            : undefined
        }
      >
        <Things />
      </Router>
    </div>
  )
}
