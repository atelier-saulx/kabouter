import React, { CSSProperties, FC, MouseEventHandler, ReactNode } from 'react'
import { useRoute, Router } from '../../src'
import { NewPage } from './NewPage'

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
  const route = useRoute()
  console.info('RENDER NESTED')

  return (
    <>
      <button
        style={{
          marginRight: 8,
          padding: 10,
          border: '2px solid black',
        }}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          route.setLocation('/')
        }}
      >
        reset all
      </button>

      <button
        style={{
          marginRight: 8,
          padding: 10,
          border: '2px solid black',
        }}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          route.setLocation('/blog')
        }}
      >
        go to blog
      </button>
    </>
  )
}

const MainPage = () => {
  // [page]
  const route = useRoute()
  return (
    <>
      <Button onClick={() => route.setLocation('/blog')}>
        Route setLocation to 'blog'
      </Button>

      {/* <Button onClick={() => route.setPath({ page: 'bla' })}>
        Route setLocation to 'bla'
      </Button> */}
    </>
  )
}

export const App: FC = () => {
  const route = useRoute('[page]')
  const page = route.path.page

  console.info(page)

  if (page === 'snurp') return route.nest(<Nested />)

  if (page === 'blog') return <NewPage />
  return <MainPage />

  return (
    <>
      {/* <Button onClick={() => route.setPath({ bla: ~~(Math.random() * 1000) })}>
        Set bla {route.path.bla}
        {route.nest(<Nested />)}
      </Button> */}
    </>
  )
}
