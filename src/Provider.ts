import { createContext } from 'react'
import { RouterCtx } from './types'
export const RouterContext = createContext<RouterCtx>({
  rootPath: [],
  componentMap: new Map(),
  pathName: '',
  query: {},
  queryChanged: false,
  hashChanged: false,
  pathChanged: false,
  updateRoute: () => {},
})
