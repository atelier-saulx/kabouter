import React, { createContext, ReactNode, FC } from 'react'
import { RouterCtx, RouterRootCtx, Location } from './types'
import { useRouterListeners } from './useRouterListeners'

export const RouterContext = createContext<RouterCtx>({
  path: [],
  children: [],
  isRoot: false,
})

const TopRouteWrapper: FC<{ children: ReactNode }> = ({ children }) => {
  return <>{children}</>
}

// Replace with top level hook (the first)
export const Router: FC<{
  children: ReactNode
  routes?: RouterRootCtx
  path?: string
  location?: Location
}> = ({ children, routes, path = '', location }) => {
  if (!routes) {
    routes = useRouterListeners(path, location)
  }
  return (
    <RouterContext.Provider value={routes}>
      <TopRouteWrapper>{children}</TopRouteWrapper>
    </RouterContext.Provider>
  )
}
