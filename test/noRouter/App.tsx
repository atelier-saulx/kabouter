import React, { CSSProperties, FC, MouseEventHandler, ReactNode } from 'react'
import { useRoute, Router } from '../../src'

const Button: FC<{
  onClick: MouseEventHandler
  children: ReactNode
  style?: CSSProperties
}> = ({ children, onClick, style }) => {
  return (
    <button
      style={{
        marginRight: 8,
        padding: 10,
        border: '2px solid black',
        ...style,
      }}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

const Nested: FC<{
  children?: ReactNode
}> = ({ children }) => {
  const route = useRoute('[person]')
  console.info('RENDER NESTED')

  return (
    <button
      style={{
        marginRight: 8,
        padding: 10,
        border: '2px solid black',
      }}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        route.setPath({
          person: Math.random() > 0.5 ? 'jim' : 'kyle',
        })
      }}
    >
      NESTED {route.path.person} {children}
    </button>
  )
}

export const App: FC = () => {
  const route = useRoute('[bla]/[flap]')

  console.info('RENDER APP')

  return (
    <>
      <Button onClick={() => route.setPath({ bla: ~~(Math.random() * 1000) })}>
        Set bla {route.path.bla}
        {route.nest(<Nested />)}
      </Button>
    </>
  )
}
