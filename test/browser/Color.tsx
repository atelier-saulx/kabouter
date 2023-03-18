import React, { useState, ReactNode } from 'react'
// lets add some routes here

export const Color = () => {
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

  const [bla, setBla] = useState('rgb(251, 248, 244)')

  for (const key in colors) {
    colorsE.push(
      <div
        key={key}
        onClick={() => {
          setBla(`rgb(${colors[key].join(',')})`)
        }}
        style={{
          fontFamily: 'andale mono',
          fontWeight:
            `rgb(${colors[key].join(',')})` === bla ? 'bold' : undefined,
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
    <div
      style={{
        backgroundColor: bla,
        width: '100vw',
        minHeight: '100vh',
        display: 'flex',
        flexWrap: 'wrap',
      }}
    >
      {colorsE}
    </div>
  )
}
