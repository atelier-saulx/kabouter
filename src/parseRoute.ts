import { PathParams, PathSegment, RouterRootCtx } from './types'

export const parseRoute = (
  rootCtx: RouterRootCtx,
  fromPath: PathSegment[],
  path: PathSegment[],
  start: number
): PathParams => {
  const params = {}
  const segs = rootCtx.pathName.split('/')
  for (let i = 0; i < path.length + start + 1; i++) {
    const seg = segs[i]
    if (i > start) {
      const { vars, matcher } = path[i - start - 1]
      if (seg) {
        const pSeg = segs[i].match(matcher)
        if (pSeg) {
          for (let x = 1; x < pSeg.length; x++) {
            if (pSeg[x] === '*' || pSeg[x] === undefined) {
              params[vars[x - 1]] = undefined
            } else if (pSeg[x]) {
              params[vars[x - 1]] = decodeURIComponent(pSeg[x])
              if (/[[]{}]/.test(params[vars[x - 1]])) {
                console.info('is maybe json', pSeg[x])
              }
            } else {
              params[vars[x - 1]] = pSeg[x]
            }
          }
        } else {
          return {}
        }
      }
    } else {
      if (!fromPath[i].matcher.test(seg)) {
        return {}
      }
    }
  }
  return params
}

export const parseLocation = (
  q: string,
  hash: string,
  pathName: string
): string => {
  console.log('?????????????', q)

  return q && hash
    ? pathName + '?' + q + '#' + hash
    : q
    ? pathName + '?' + q
    : hash
    ? pathName + '#' + hash
    : pathName
}
