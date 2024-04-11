import React, { createContext, ReactNode, FC } from 'react'
import { RouterCtx, RouterRootCtx, Location } from './types.js'
import { useRouterListeners } from './useRouterListeners.js'

export const defaultRoute: RouterCtx = {
  path: [],
  children: [],
  isRoot: false,
}

export const RouterContext = createContext<RouterCtx>(defaultRoute)

const DefaultRoutes: FC<{
  children: ReactNode
  path?: string
  location?: Location
}> = ({ children, path, location }) => {
  return (
    <RouterContext.Provider value={useRouterListeners(path, location)}>
      {children}
    </RouterContext.Provider>
  )
}

// Replace with top level hook (the first)
export const Router: FC<{
  children: ReactNode
  routes?: RouterRootCtx
  path?: string
  location?: Location
}> = ({ children, routes, path, location }) => {
  if (!routes) {
    return (
      <DefaultRoutes path={path || ''} location={location}>
        {children}
      </DefaultRoutes>
    )
  }

  return (
    <RouterContext.Provider value={routes}>{children}</RouterContext.Provider>
  )
}
