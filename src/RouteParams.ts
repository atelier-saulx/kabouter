import { parseQuery, deepEqual, deepMerge, serializeQuery } from '@saulx/utils'
import { QueryParams, PathParams, RouterCtx, Value } from './types'

const parseRoute = (
  ctx: RouterCtx,
  path: { vars: string[]; matcher: RegExp }[],
  start: number
): PathParams => {
  const params = {}
  const segs = ctx.pathName.split('/').slice(1)
  for (let i = start; i < path.length + start; i++) {
    const seg = segs[i]
    const { vars, matcher } = path[i - start]
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
  private _pathParams: PathParams
  private _usesQuery: boolean
  private _usesLocation: boolean
  private _usesHash: boolean
  public parsedPath: { vars: string[]; matcher: RegExp; seg: string }[]

  constructor(ctx: RouterCtx, path?: string) {
    this.ctx = ctx
    this._pathParams = {}

    if (!path) {
      this.parsedPath = []
      return this
    }

    const p = path.split('/')

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

  update(): boolean {
    if (this._usesLocation) {
      return true
    }

    if (this.parsedPath.length && this.ctx.pathChanged) {
      const nParams = parseRoute(this.ctx, this.parsedPath, this.start)

      if (!deepEqual(this._pathParams, nParams)) {
        this._pathParams = nParams
        return true
      }
    }

    if (this._usesQuery && this.ctx.queryChanged) {
      return true
    }

    if (this._usesHash && this.ctx.hashChanged) {
      return true
    }

    return true
  }

  get location(): string {
    this._usesLocation = true
    return this.ctx.location
  }

  get path(): { [key: string]: Value } {
    return this.parsedPath.length
      ? this._pathParams ||
          (this._pathParams = parseRoute(this.ctx, this.parsedPath, this.start))
      : {}
  }

  get query(): QueryParams {
    this._usesQuery = true
    return this.ctx.query || {}
  }

  get hash(): string {
    this._usesHash = true
    return this.ctx.hash
  }

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
    const [s, hash = ''] = this.ctx.location.split('#')
    const [pathName, q] = s.split('?')
    const x = pathName.split('/')

    console.error(s, x)

    results.forEach((v, k) => {
      const newIndex = k + this.start + 1
      if (newIndex > x.length - 1) {
        for (let i = 0; i < newIndex - (x.length - 1); i++) {
          x.push('')
        }
      }

      console.error(s, x, newIndex, 'START:', this.start, v[0])

      x[newIndex] = v[0]
    })

    const newLocation = parseLocation(
      q,
      hash,
      x
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

    console.error(x, newLocation)

    return this.setLocation(newLocation)
  }

  setQuery(query: QueryParams, opts?: { overwrite?: boolean }): boolean {
    if (query === null) {
      this.ctx.query = {}
    } else {
      if (opts?.overwrite) {
        this.ctx.query = query
      } else {
        deepMerge(this.ctx.query || {}, query)
      }
    }
    const q = serializeQuery(this.ctx.query)
    if (this.ctx.queryString === q) {
      return true
    }
    this.ctx.queryString = q
    const [s] = this.ctx.location.split('#')
    const [pathName] = s.split('?')
    this.ctx.location = parseLocation(q, this.ctx.hash, pathName)
    this.ctx.queryChanged = true
    this.ctx.updateRoute(false)
    return true
  }

  setHash(hash: string): boolean {
    if (hash === this.ctx.hash) {
      return false
    }
    if (!hash) {
      this.ctx.hash = ''
    }
    this.ctx.hash = hash
    const [s] = this.ctx.location.split('#')
    const [pathName, q] = s.split('?')
    this.ctx.location = parseLocation(q, hash, pathName)
    this.ctx.hashChanged = true
    this.ctx.updateRoute(false)
    return true
  }

  setLocation(location: string): boolean {
    if (location === this.ctx.location) {
      return false
    }

    const [s, hash = ''] = location.split('#')
    const [pathName, q] = s.split('?')
    this.ctx.hash = hash
    this.ctx.pathName = pathName
    this.ctx.query = q ? parseQuery(q) || {} : {}
    this.ctx.location = location
    this.ctx.pathChanged = true
    this.ctx.updateRoute(false)
    return true
  }
}
