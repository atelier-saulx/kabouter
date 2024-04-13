import React from 'react'
import { createRoot } from 'react-dom/client'
import { RouterExample } from './SSRApp.js'
const root = createRoot(document.getElementById('root'))
root.render(<RouterExample />)
