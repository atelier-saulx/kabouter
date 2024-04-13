import React, { createContext, ReactNode, FC } from 'react'
import { RouterCtx, RouterRootCtx, Location } from './types.js'
import { useRouterListeners } from './useRouterListeners.js'
import { useRoute } from './useRoute.js'

export const defaultRoute: RouterCtx = {
  path: [],
  children: [],
  isRoot: false,
}

export const RouterContext = createContext<RouterCtx>(defaultRoute)

const Wrap = ({ children }) => {
  return useRoute().nest(children)
}

const DefaultRoutes: FC<{
  children: ReactNode
  path?: string
  prefix?: string
  location?: Location
}> = ({ children, path, location, prefix }) => {
  return (
    <RouterContext.Provider value={useRouterListeners(path, location, prefix)}>
      <Wrap>{children}</Wrap>
    </RouterContext.Provider>
  )
}

// Replace with top level hook (the first)
export const Router: FC<{
  children: ReactNode
  routes?: RouterRootCtx
  prefix?: string
  path?: string
  location?: Location
}> = ({ children, routes, path, location, prefix }) => {
  if (!routes) {
    return (
      <DefaultRoutes prefix={prefix} path={path || ''} location={location}>
        {children}
      </DefaultRoutes>
    )
  }

  return (
    <RouterContext.Provider value={routes}>{children}</RouterContext.Provider>
  )
}
