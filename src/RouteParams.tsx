import { parseQuery, deepEqual, deepMerge, serializeQuery } from '@saulx/utils'
import React, { ReactNode } from 'react'
import { RouterContext } from './Provider'
import {
  QueryParams,
  PathParams,
  RouterCtx,
  Value,
  RouterRootCtx,
  PathSegment,
} from './types'
import { parseLocation, parseRoute } from './parseRoute'
import { parsePath, parseVal } from './path'

export class RouteParams {
  public start: number
  public ctx: RouterCtx
  public rootCtx: RouterRootCtx

  private _usesQuery: boolean
  private _usesLocation: boolean
  private _usesHash: boolean

  // step 1
  private _pathParams?: PathParams
  private _fromPath: PathSegment[]
  public preparedPath: PathSegment[]

  constructor(
    ctx: RouterCtx,
    rootCtx: RouterRootCtx,
    start: number,
    fromPath: PathSegment[],
    path?: string
  ) {
    this.ctx = ctx
    this.rootCtx = rootCtx
    this.start = start
    this._fromPath = fromPath

    if (!path) {
      this.preparedPath = []
      return this
    }

    this.preparedPath = parsePath(path)
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
          route: this,
          path: this.preparedPath,
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

    if (this.preparedPath.length && this.rootCtx.pathChanged) {
      const nParams = parseRoute(
        this.rootCtx,
        this._fromPath,
        this.preparedPath,
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
    return this.preparedPath.length
      ? this._pathParams ||
          (this._pathParams = parseRoute(
            this.rootCtx,
            this._fromPath,
            this.preparedPath,
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
  setPath(m: { [key: string]: Value | null }, overwrite?: boolean): boolean {
    const p = { ...m }

    if (!overwrite) {
      for (const k in this._pathParams) {
        const x = this._pathParams[k]
        if ((x !== undefined && p[k] === '') || p[k] === undefined) {
          p[k] = x
        }
      }
    }

    if (deepEqual(this._pathParams, p)) {
      return false
    }

    const newLocation = this.parseLocation(p)
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
    const q = encodeURIComponent(serializeQuery(this.rootCtx.query))
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

    const nQ = q ? parseQuery(q) || {} : {}

    if (pathName !== this.rootCtx.pathName) {
      this.rootCtx.pathChanged = true
    }

    if (!deepEqual(nQ, this.rootCtx.query)) {
      this.rootCtx.queryChanged = true
    }

    if (hash !== this.rootCtx.hash) {
      this.rootCtx.hashChanged = true
    }

    this.rootCtx.pathName = pathName
    this.rootCtx.query = nQ
    this.rootCtx.hash = hash
    this.rootCtx.location = location
    this.rootCtx.updateRoute(false)
    return true
  }

  parseLocation(p: { [key: string]: Value | null }): string {
    const results: Map<number, [string, Set<string>]> = new Map()
    let len = Object.keys(p).length

    for (let i = this.preparedPath.length - 1; i > -1; i--) {
      const parsed = this.preparedPath[i]
      for (const key in p) {
        if (parsed.vars.includes(key)) {
          const rKey = parsed.spread ? '...' + key : key

          if (!results.has(i)) {
            results.set(i, [parsed.seg, new Set()])
          }
          const r = results.get(i)
          if (p[key] === null) {
            r[0] = r[0].replaceAll(`[${rKey}]`, '')
          } else {
            if (Array.isArray(p[key])) {
              // @ts-ignore
              r[0] = r[0].replaceAll(`[${rKey}]`, p[key].join('/'))
            } else {
              r[0] = r[0].replaceAll(`[${rKey}]`, String(p[key]))
            }
          }
          r[1].add(key)
          len--
          if (len === 0) {
            break
          }
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
      if (len === 0) {
        break
      }
    }

    const [s, hash = ''] = this.rootCtx.location.split('#')
    const [pathName, q] = s.split('?')
    const x = pathName.split('/')
    const newPath = []

    if (len) {
      let parent = this.ctx
      while (parent) {
        if (parent.path) {
          for (let i = 0; i < parent.path.length; i++) {
            const match = parent.path[i]
            for (const k in p) {
              if (match.vars.includes(k)) {
                if (p[k] === null) {
                  x[parent.route.start + i + 1] = ''
                } else {
                  x[parent.route.start + i + 1] = String(p[k] || '')
                }
                len--
                if (len === 0) {
                  break
                }
              }
            }
            if (len === 0) {
              break
            }
          }
        }
        if (len === 0) {
          break
        } else {
          parent = parent.parent
        }
      }
    }

    for (let i = 0; i < this._fromPath.length; i++) {
      const from = this._fromPath[i]
      if (!from.matcher.test(x[i])) {
        newPath.push(parseVal(from.noVar, newPath.length))
      } else {
        newPath.push(parseVal(x[i], newPath.length))
      }
    }

    for (let i = 0; i < this.preparedPath.length; i++) {
      newPath.push(parseVal(this.preparedPath[i].noVar, newPath.length))
    }

    results.forEach((v, k) => {
      const newIndex = k + this.start + 1
      newPath[newIndex] = parseVal(v[0], newIndex)
    })

    for (let i = newPath.length - 1; i > -1; i--) {
      if (newPath[i] === '*' || newPath[i] === '') {
        newPath.pop()
      } else {
        break
      }
    }

    const newLocation = parseLocation(q, hash, newPath.join('/'))

    return newLocation
  }
}
