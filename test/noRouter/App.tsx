import React, { CSSProperties, FC, MouseEventHandler, ReactNode } from 'react'
import { useRoute } from '../../src'

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

export const App: FC = () => {
  const route = useRoute('[bla]/[flap]')
  return (
    <>
      <Button onClick={() => route.setPath({ bla: ~~(Math.random() * 1000) })}>
        Set bla {route.path.bla}
      </Button>
    </>
  )
}
