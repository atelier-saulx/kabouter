import React, { createContext, ReactNode, FC } from 'react'
import { RouterCtx, RouterRootCtx } from './types'
import { useRouterListeners } from './index'

export const RouterContext = createContext<RouterCtx>({
  path: [],
  children: [],
  isRoot: false,
})

export const Router: FC<{
  children: ReactNode
  routes?: RouterRootCtx
}> = ({ children, routes }) => {
  if (!routes) {
    routes = useRouterListeners()
  }
  return (
    <RouterContext.Provider value={routes}>{children}</RouterContext.Provider>
  )
}
