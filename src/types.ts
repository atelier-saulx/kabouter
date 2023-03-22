import { RouteParams } from './RouteParams'

export type QueryValue = string | number | boolean

export type QueryParams = {
  [key: string]: QueryValue | QueryValue[] | { [key: string]: any }
}

export type Value = string | number | boolean

export type PathParams = { [key: string]: Value }

export type PathSegment = {
  vars: string[]
  spread?: string
  matcher: RegExp
  seg: string
  noVar: string
}

export type ComponentMap = Map<
  any,
  {
    route: RouteParams
    update: () => void
  }
>

export type RouterRootCtx = {
  isRoot: true
  path: PathSegment[]
  updateRoute: (fromPopState: boolean) => void
  pathName: string
  query: QueryParams
  queryString?: string
  hash?: string
  location?: string
  route?: RouteParams
  queryChanged: boolean
  hashChanged: boolean
  pathChanged: boolean
  children: RouterCtx[]
  parent?: RouterCtx
  componentMap: ComponentMap
}

export type Location = {
  hash?: string
  query?: string
  path: string
}

export type RouteChildCtx = {
  isRoot: false
  path: PathSegment[]
  route?: RouteParams
  parent?: RouterCtx
  children: RouterCtx[]
}

export type RouterCtx = RouterRootCtx | RouteChildCtx
