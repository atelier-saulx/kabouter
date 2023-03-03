import React, {
  CSSProperties,
  FC,
  MouseEventHandler,
  ReactNode,
  useState,
} from 'react'
import { useRoute, Router } from '../../src'
import { createRoot } from 'react-dom/client'

// useQueryParamState

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

const RouteWrapper = ({ children, id }) => {
  const route = useRoute(`wrapper-${id}[bla]`)

  return (
    <div
      style={{
        marginTop: 32,
        marginLeft: 32,
      }}
    >
      <div style={{ margin: 32, border: '2px solid black' }}>
        <span
          style={{
            fontFamily: 'helvetica',
            fontSize: 24,
            marginLeft: 32,
          }}
        >
          {id}
        </span>
        <Button
          style={{
            margin: 15,
          }}
          onClick={() => {
            route.setQuery({ hello: true, gur: [1, 2, 3, 4, 5], id })
          }}
        >
          Set q parameters
        </Button>
      </div>
      <div
        style={{
          borderLeft: '2px solid black',
          paddingLeft: 24,
        }}
      >
        {route.nest(children)}
      </div>
    </div>
  )
}

const SimpleRoute = ({ id }) => {
  console.info('RENDER SIMPLE ROUTE', id)

  const route = useRoute(`${id}-[flap]/[snur]/[snapje]/[bla]`)
  return (
    <div
      style={{
        width: 350,
        border: '2px solid black',
        padding: 10,
        margin: 10,
      }}
    >
      <Button
        onClick={() => {
          route.setLocation('/')
        }}
      >
        reset
      </Button>
      <Button
        onClick={() => {
          route.setPath({
            bla: 'bla',
            flap: 'flap',

            snapje: Math.round(Math.random() * 1e6),
          })
        }}
      >
        update path
      </Button>
      <pre>{JSON.stringify(route.path, null, 2)}</pre>
    </div>
  )
}

export const RouterExample = () => {
  const [s, set] = useState(true)
  return (
    <div style={{ padding: 100 }}>
      <Button
        onClick={() => {
          set(!s)
        }}
      >
        Flip
      </Button>
      {s ? (
        <Router>
          <RouteWrapper id="a">
            <RouteWrapper id="ab">
              <SimpleRoute id="aba" />
              <SimpleRoute id="abb" />
            </RouteWrapper>
            <RouteWrapper id="ac">
              <SimpleRoute id="aca" />
              <SimpleRoute id="acb" />
            </RouteWrapper>
          </RouteWrapper>
        </Router>
      ) : null}
    </div>
  )
}

// render(element, container[, callback])
const root = createRoot(document.body)

root.render(<RouterExample />)
