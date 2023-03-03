export type QueryValue = string | number | boolean

export type QueryParams = {
  [key: string]: QueryValue | QueryValue[] | { [key: string]: any }
}

export type Value = string | number | boolean

export type PathParams = { [key: string]: Value }

export type ComponentMap = Map<
  any,
  {
    start: number
    path: { vars: string[]; matcher: RegExp; seg: string }[]
    update: () => void
  }
>

export type RouterRootCtx = {
  isRoot: true
  path: string[]
  updateRoute: (fromPopState: boolean) => void
  pathName: string
  query: QueryParams
  queryString?: string
  hash?: string
  location?: string
  queryChanged: boolean
  hashChanged: boolean
  pathChanged: boolean
  children: RouterCtx[]
  parent?: RouterCtx
  componentMap: ComponentMap
}

export type RouteChildCtx = {
  isRoot: false
  path: string[]
  parent?: RouterCtx
  children: RouterCtx[]
}

export type RouterCtx = RouterRootCtx | RouteChildCtx
