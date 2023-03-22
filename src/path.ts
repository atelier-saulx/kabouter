import { PathSegment } from './types'

const matchVars = /\[.*?\]/g
const emptyMatch = /^.{0}$/

export const parsePath = (path: string): PathSegment[] => {
  return path.split('/').map((seg) => {
    const matchers = seg.match(matchVars)

    const matcher =
      matchers === null
        ? emptyMatch
        : new RegExp('^' + seg.replace(matchVars, '(.+)?') + '$')
    const vars = matchers ? matchers.map((v) => v.slice(1, -1)) : []

    for (let i = 0; i < vars.length; i++) {
      const v = vars[i]

      if (v.startsWith('...')) {
        const nV = v.slice(3)
        vars[i] = nV

        return {
          spread: nV,
          vars,
          matcher,
          seg,
          noVar: seg.replace(matchVars, ''),
        }
      }
    }

    return {
      vars,
      matcher,
      seg,
      noVar: seg.replace(matchVars, ''),
    }
  })
}

export const parseVal = (v: string, i: number): string =>
  v === undefined || v === ''
    ? i > 0
      ? '*'
      : ''
    : typeof v === 'object'
    ? encodeURIComponent(JSON.stringify(v))
    : v
