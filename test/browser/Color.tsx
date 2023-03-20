import React, { ReactNode } from 'react'
import { useRoute } from '../../src'

const NestLevel2Flap = () => {
  const route = useRoute('[snur]')
  return (
    <div
      style={{
        marginTop: 24,
        marginBottom: 24,
      }}
    >
      <button
        onClick={() => {
          route.setPath({ snur: (~~(Math.random() * 1000)).toString(16) })
        }}
      >
        SET SNUR
      </button>
      <button
        onClick={() => {
          route.setLocation(
            route.location.split('#')[0].split('?')[0] + '?#bla'
          )
        }}
      >
        SET hash
      </button>
      <button
        onClick={() => {
          route.setHash('EWDW')
        }}
      >
        | SET hash 2
      </button>
    </div>
  )
}

const Bla = () => {
  return (
    <>
      <NestLevel2Flap />
    </>
  )
}

const NestLevel2 = () => {
  const route = useRoute('[snur]')
  return (
    <div
      style={{
        padding: 24,
        marginTop: 24,
        marginBottom: 24,
      }}
    >
      <button
        onClick={() => {
          route.setPath({ snur: (~~(Math.random() * 1000)).toString(16) })
        }}
      >
        SET SNUR
      </button>
      --SNUR: {route.path.snur}
      <Bla />
    </div>
  )
}

const NestLevel1 = () => {
  const route = useRoute('[bla]')
  return (
    <div
      style={{
        padding: 24,
        marginTop: 24,
        marginBottom: 24,
      }}
    >
      <button
        onClick={() => {
          route.setPath({ bla: (~~(Math.random() * 1000)).toString(16) })
        }}
      >
        SET BLA
      </button>
      --BLA: {route.path.bla}
      {route.nest(<NestLevel2 />)}
    </div>
  )
}

export const Color = () => {
  const route = useRoute('[bg]')

  const { bg = 'rgb(251, 248, 244)' } = route.path

  const colors = {
    bright: [255, 255, 255],
    whitwhite: [238, 239, 234],
    signal: [236, 236, 231],
    allWhite: [251, 248, 244],
    whim: [247, 243, 232],
    pointing: [247, 241, 227],
    skimskim: [223, 214, 203],
    wevet: [238, 233, 231],
    strongwhite: [229, 224, 219],
    black: [221, 219, 217],
    am: [221, 216, 207],
    ral9016: [241, 241, 234],
  }

  const mixers = {
    halfWhinm: ['allWhite', 'whim'],
    halfPoint: ['allWhite', 'pointing'],
    thirdPoint: ['allWhite', 'allWhite', 'pointing'],
    thirdStrong: ['allWhite', 'allWhite', 'strongwhite'],
    thirWhim: ['allWhite', 'allWhite', 'whim'],
    FrouththSkim: ['allWhite', 'allWhite', 'allWhite', 'skimskim'],
    thirdwev: ['allWhite', 'allWhite', 'wevet'],
    Fourthblack: ['allWhite', 'allWhite', 'allWhite', 'black'],
    plafond: ['bright', 'allWhite'],
  }

  for (const key in mixers) {
    const mix = mixers[key]
    const rgbs = [0, 0, 0]
    const len = mix.length
    for (const x of mix) {
      for (let i = 0; i < 3; i++) {
        rgbs[i] += colors[x][i] * (1 / len)
      }
    }
    colors[key] = rgbs.map((x) => Math.round(x))
  }

  const colorsE: ReactNode[] = []

  for (const key in colors) {
    colorsE.push(
      <div
        key={key}
        onClick={() => {
          route.setPath({ bg: `rgb(${colors[key].join(',')})` })
        }}
        style={{
          fontFamily: 'andale mono',
          fontWeight:
            `rgb(${colors[key].join(',')})` === bg ? 'bold' : undefined,
          margin: 50,
          backgroundColor: `rgba(${colors[key][0]},${colors[key][1]},${colors[key][2]})`,
          width: 300,
          height: 300,
          display: 'flex',
          fontSize: 18,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              marginBottom: 16,
            }}
          >
            {key}
          </div>
          <div style={{ fontSize: 12 }}>{colors[key].join(',')}</div>
        </div>
      </div>
    )
  }

  return (
    <>
      {route.nest(<NestLevel1 />)}
      <div
        style={{
          backgroundColor: String(bg),
          width: '100vw',
          minHeight: '100vh',
          display: 'flex',
          flexWrap: 'wrap',
        }}
      >
        {colorsE}
      </div>
    </>
  )
}
