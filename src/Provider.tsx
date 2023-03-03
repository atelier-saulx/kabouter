import React, { createContext, ReactNode, FC } from 'react'
import { RouterCtx, RouterRootCtx } from './types'
export const RouterContext = createContext<RouterCtx>({
  path: [],
  children: [],
  isRoot: false,
})

export const RootProvies: FC<{
  children: ReactNode
  routes: RouterRootCtx
}> = ({ children, routes }) => {
  return (
    <RouterContext.Provider value={routes}>{children}</RouterContext.Provider>
  )
}
