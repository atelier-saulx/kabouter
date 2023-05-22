import React from 'react'
import { useRoute, Router } from '../../src'

export const NewPage = () => {
  const route = useRoute()
  return (
    <div
      style={{
        height: '100vw',
        width: '100vw',
        backgroundColor: 'green',
      }}
    >
      <button onClick={() => route.setPath({ page: '' })}>
        Route SetPath to ''
      </button>

      <button onClick={() => route.setPath({ page: '/' })}>
        Route SetPath to '/'
      </button>
    </div>
  )
}
