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
    return {
      vars,
      matcher,
      seg,
      noVar: seg.replace(matchVars, ''),
    }
  })
}
