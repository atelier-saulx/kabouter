import React from 'react'
import { renderToPipeableStream } from 'react-dom/server'
import test from 'ava'
import { RouterExample } from './browser/App'
import { wait } from '@saulx/utils'
import fs from 'node:fs/promises'
import { join } from 'node:path'
import { createWriteStream } from 'node:fs'

test('path', async (t) => {
  const path = join(__dirname, 'tmp')
  await fs.rm(join(path, 'index.html')).catch(() => {})
  await fs.mkdir(path).catch(() => {})
  const writeHandler = createWriteStream(join(path, 'index.html'))

  renderToPipeableStream(
    React.createElement(RouterExample, {
      location:
        '/wrapper-a/wrapper-ab/aba-flap/*/466032/bla?hello&gur=1,2,3,4,5&id=ab&x=172',
    }),
    {}
  ).pipe(writeHandler)

  await wait(100)

  const file = await fs.readFile(join(path, 'index.html'))

  t.true(file.includes('466032'))
  t.true(file.includes('172'))
})
