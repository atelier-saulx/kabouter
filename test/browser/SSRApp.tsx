import React, { FC, useState } from 'react'
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
      PATH {JSON.stringify(path)} <Link path={path}>link!</Link>
    </div>
  )
}

const Bla = () => {
  const [open, setOpen] = useState(false)
  const r = useRoute()
  return (
    <div
      style={{
        marginTop: 20,
        paddingTop: 20,
        borderTop: '1px solid black',
      }}
    >
      <p>SECTION: {r.path.section}</p>
      <p>ARTICLE: {r.path.article}</p>
      <PathLink path={{ section: null, article: null }} />
      <div
        style={{
          marginTop: 50,
          marginBottom: 50,
        }}
        onClick={() => {
          r.setPath({
            section: 'FLAP',
            article: 'BLA',
          })
        }}
      >
        Click
      </div>

      <Link
        onClick={() => {
          if (!open) {
            setOpen(true)
            return true
          }
          console.log('GO')
        }}
        path={{ section: 'GO', article: 'GO TIME' }}
      >
        GO time
      </Link>
    </div>
  )
}

const Doink = () => {
  const r = useRoute()

  return (
    <div>
      {r.location}

      <Bla />
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

      <Doink />
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
                path: '/migration/ar995f9cbd',
              }
            : undefined
        }
      >
        <Things />
      </Router>
    </div>
  )
}
