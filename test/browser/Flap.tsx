import React from 'react'
import { useRoute } from '../../src/index.js'

export default () => {
  const route = useRoute('[type]/[field]')
  return (
    <div
      style={{
        border: '2px solid black',
        padding: 20,
        background: '#eeffcc',
      }}
    >
      {JSON.stringify(route.path)}
    </div>
  )
}
