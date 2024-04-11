import React, { FC } from 'react'
import { Router, Link, useRoute } from '../../src/index.js'

const AComponent = () => {
  return (
    <div>
      a component <Link query={{ articleId: 'foo' }}>link</Link>
    </div>
  )
}

const BComponent = () => {
  const route = useRoute()

  console.log('route in b', route.query.articleId)

  return (
    <div>
      b component <Link query={{ articleId: 'bar' }}>link</Link>
    </div>
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
        <AComponent />
        <BComponent />
      </Router>
    </div>
  )
}
