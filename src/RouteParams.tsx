import { parseQuery, deepEqual, deepMerge, serializeQuery } from '@saulx/utils'
import React, { ReactNode } from 'react'
import { RouterContext } from './Provider'
import {
  QueryParams,
  PathParams,
  RouterCtx,
  Value,
  RouterRootCtx,
} from './types'

const parseRoute = (
  rootCtx: RouterRootCtx,
  fromPath: string[],
  path: { vars: string[]; matcher: RegExp }[],
  start: number
): PathParams => {
  const params = {}
  const segs = rootCtx.pathName.split('/')
  for (let i = 0; i < path.length + start + 1; i++) {
    if (i > start) {
      const seg = segs[i]
      const { vars, matcher } = path[i - start - 1]
      if (seg) {
        const pSeg = segs[i].match(matcher)
        if (pSeg) {
          for (let x = 1; x < pSeg.length; x++) {
            if (pSeg[x] === '*' || pSeg[x] === undefined) {
              params[vars[x - 1]] = undefined
            } else {
              params[vars[x - 1]] = pSeg[x]
            }
          }
        } else {
          return {}
        }
      }
    } else {
      const x = fromPath[i].replace(/\[.+\]/, '')
      if (x !== segs[i]) {
        return {}
      }
    }
  }
  return params
}

const parseLocation = (q: string, hash: string, pathName: string): string => {
  return q && hash
    ? pathName + '?' + q + '#' + hash
    : q
    ? pathName + '?' + q
    : hash
    ? pathName + '#' + hash
    : pathName
}

const matchVars = /\[.*?\]/g

export class RouteParams {
  public start: number
  public ctx: RouterCtx
  public rootCtx: RouterRootCtx
  public parsedPath: { vars: string[]; matcher: RegExp; seg: string }[]

  private _pathParams?: PathParams
  private _usesQuery: boolean
  private _usesLocation: boolean
  private _usesHash: boolean
  private _path: string[]
  private _fromPath: string[]

  constructor(
    ctx: RouterCtx,
    rootCtx: RouterRootCtx,
    start: number,
    fromPath: string[],
    path?: string
  ) {
    this.ctx = ctx
    this.rootCtx = rootCtx
    this.start = start
    this._fromPath = fromPath

    if (!path) {
      this._path = []
      this.parsedPath = []
      return this
    }

    const p = path.split('/')

    this._path = p

    this.parsedPath = []
    for (const seg of p) {
      const matchers = seg.match(matchVars)
      const matcher = new RegExp(seg.replace(matchVars, '(.+)'))
      const vars = matchers ? matchers.map((v) => v.slice(1, -1)) : []
      this.parsedPath.push({
        vars,
        matcher,
        seg,
      })
    }
  }

  /**
  Allows composition of different `path` routes together

  ```javascript
  const Page = () => {
    const route = useRoute('[page]')
    return <div>{route.path.page}</div>
  }

  const Books = () => {
    const route = useRoute('books/[book]')
    const { id } = route.path
    // Creates nested route page will now use "/books/mybook/1"
    return <div>{route.nest(<Page />)}</div>
  }
  ```
  */
  nest(children: ReactNode): ReactNode {
    return (
      <RouterContext.Provider
        value={{
          path: this._path,
          parent: this.ctx,
          children: [],
          isRoot: false,
        }}
      >
        {children}
      </RouterContext.Provider>
    )
  }

  update(): boolean {
    if (this._usesLocation) {
      return true
    }

    if (this.parsedPath.length && this.rootCtx.pathChanged) {
      const nParams = parseRoute(
        this.rootCtx,
        this._fromPath,
        this.parsedPath,
        this.start
      )

      if (!deepEqual(this._pathParams || {}, nParams)) {
        this._pathParams = nParams
        return true
      } else {
        return false
      }
    }

    if (this._usesQuery && this.rootCtx.queryChanged) {
      return true
    }

    if (this._usesHash && this.rootCtx.hashChanged) {
      return true
    }

    return false
  }

  /**
  Get full location

  ```javascript
  <div>{route.location}</div>
  ```
  */
  get location(): string {
    this._usesLocation = true
    return this.rootCtx.location
  }

  /**
  Get all variables from path

  ```javascript
  const { book, page } = route.path

  <div>{book} {page}</div>
  ```
  */
  get path(): { [key: string]: Value } {
    return this.parsedPath.length
      ? this._pathParams ||
          (this._pathParams = parseRoute(
            this.rootCtx,
            this._fromPath,
            this.parsedPath,
            this.start
          ))
      : {}
  }

  /**
  Returns query parameters as an object, when used will also start to listen for changes

  ```javascript
  <div>{route.query.counter}</div>
  ```
   */
  get query(): QueryParams {
    this._usesQuery = true
    return this.rootCtx.query || {}
  }

  /**
  Returns location hash, when used start listening for changes

  ```javascript
  <div>{route.hash}</div>
  ```
   */
  get hash(): string {
    this._usesHash = true
    return this.rootCtx.hash
  }

  /**
  Update `path`

  ```javascript
  <div
    onClick={() => {
      // Will result in path "/book/mybook/1"
      route.setPath({
        book,
        page: page + 1,
      })
    }}
  >
    {route.path.book} {route.path.page}
  </div>
  ```
   */
  setPath(p: { [key: string]: Value }): boolean {
    if (deepEqual(this._pathParams, p)) {
      return false
    }

    const results: Map<number, [string, Set<string>]> = new Map()
    for (let i = this.parsedPath.length - 1; i > -1; i--) {
      const parsed = this.parsedPath[i]
      for (const key in p) {
        if (parsed.vars.includes(key)) {
          if (!results.has(i)) {
            results.set(i, [parsed.seg, new Set()])
          }
          const r = results.get(i)
          r[0] = r[0].replaceAll(`[${key}]`, String(p[key]))
          r[1].add(key)
        }
      }
      if (results.has(i)) {
        const r = results.get(i)
        for (const v of parsed.vars) {
          if (!r[1].has(v)) {
            r[0] = r[0].replaceAll(`[${v}]`, String(this._pathParams[v] || ''))
          }
        }
      }
    }
    const [s, hash = ''] = this.rootCtx.location.split('#')

    const [pathName, q] = s.split('?')
    const x = pathName.split('/')

    const newPath = []

    for (let i = 0; i < this._fromPath.length; i++) {
      const y = this._fromPath[i].replace(/\[.+\]/, '')
      if (y !== x[i]) {
        newPath.push(y)
      } else {
        newPath.push(x[i])
      }
    }

    // make all thwse replaces perpared
    for (let i = 0; i < this._path.length; i++) {
      newPath.push(this._path[i].replace(/\[.+\]/, ''))
    }

    results.forEach((v, k) => {
      const newIndex = k + this.start + 1
      newPath[newIndex] = v[0]
    })

    const newLocation = parseLocation(
      q,
      hash,
      newPath
        .map((v, i) =>
          v === undefined || v === ''
            ? i > 0
              ? '*'
              : ''
            : typeof v === 'object'
            ? JSON.stringify(v)
            : v
        )
        .join('/')
    )

    return this.setLocation(newLocation)
  }

  /**
  Use query parameters, set a param to `null` to clear, pass `{ overwrite: true }` as option to overwrite current query params, default is merge

  ```javascript
  <div
    onClick={() => {
      // Merges by default
      route.setQuery({
        counter: route.query.counter + 1,
      })
    }}
  >
    {route.query.counter}
  </div>
  ```
   */
  setQuery(query: QueryParams, opts?: { overwrite?: boolean }): boolean {
    if (query === null) {
      this.rootCtx.query = {}
    } else {
      if (opts?.overwrite) {
        this.rootCtx.query = query
      } else {
        deepMerge(this.rootCtx.query || {}, query)
      }
    }
    for (const key in this.rootCtx.query) {
      if (this.rootCtx.query[key] === null) {
        delete this.rootCtx.query[key]
      }
    }
    const q = serializeQuery(this.rootCtx.query)
    if (this.rootCtx.queryString === q) {
      return true
    }
    this.rootCtx.queryString = q
    const [s] = this.rootCtx.location.split('#')
    const [pathName] = s.split('?')
    this.rootCtx.location = parseLocation(q, this.rootCtx.hash, pathName)
    this.rootCtx.queryChanged = true
    this.rootCtx.updateRoute(false)
    return true
  }

  /**
  Modify the location hash

  ```javascript
  <div
    onClick={() => {
      route.setHash(route.hash + 1)
    }}
  >{route.hash}</div>  
  ```
   */
  setHash(hash: string): boolean {
    if (hash === this.rootCtx.hash) {
      return false
    }
    if (!hash) {
      this.rootCtx.hash = ''
    }
    this.rootCtx.hash = hash
    const [s] = this.rootCtx.location.split('#')
    const [pathName, q] = s.split('?')
    this.rootCtx.location = parseLocation(q, hash, pathName)
    this.rootCtx.hashChanged = true
    this.rootCtx.updateRoute(false)
    return true
  }

  /**
  Modify the whole `location`

  ```javascript
  <div onClick={() => route.setLocation('/something')}>{route.location}</div>
  ``` 
*/
  setLocation(location: string): boolean {
    if (location === this.rootCtx.location) {
      return false
    }

    const [s, hash = ''] = location.split('#')
    const [pathName, q] = s.split('?')
    this.rootCtx.hash = hash
    this.rootCtx.pathName = pathName
    this.rootCtx.query = q ? parseQuery(q) || {} : {}
    this.rootCtx.location = location
    this.rootCtx.pathChanged = true
    this.rootCtx.updateRoute(false)
    return true
  }
}
