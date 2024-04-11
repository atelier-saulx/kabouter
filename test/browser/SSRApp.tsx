import React, { FC } from 'react'
import { Router, Link } from '../../src'

const AComponent = () => {
  return (
    <div>
      a component <Link query={{ articleId: 'foo' }}>link</Link>
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
      </Router>
    </div>
  )
}
