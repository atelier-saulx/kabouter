import React from 'react'
import { useRoute, Router } from '../../src/index.js'

export const NewPage = () => {
  const route = useRoute('[page]')
  return (
    <div
      style={{
        height: '100vw',
        width: '100vw',
        backgroundColor: 'green',
      }}
    >
      <button onClick={() => route.setPath({ page: 'snurp' })}>
        Route SetPath to ''
      </button>

      <button onClick={() => route.setPath({ page: null })}>
        Route SetPath to '/'
      </button>
    </div>
  )
}
