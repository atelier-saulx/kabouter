import React, {
  CSSProperties,
  FC,
  MouseEventHandler,
  ReactNode,
  useState,
} from 'react'
import { useRoute, Router, useSearchParam } from '../../src'
import { createRoot } from 'react-dom/client'

// [params, setParams] = useSearchParam<type>('key', default)

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

const Page = () => {
  const [param, setParam] = useSearchParam('x', 1)

  const route = useRoute('pages/[pageId]/[pageNumber]')
  const { pageId, pageNumber } = route.path
  return (
    <div
      style={{
        margin: 30,
        padding: 30,
        border: '1px solid blue',
      }}
      onClick={() => {
        route.setPath({
          pageNumber: Number(pageNumber || 0) + 1,
        })
      }}
    >
      Pages
      {pageId} {pageNumber}
      X: {param}
      <div
        onClick={() => {
          setParam(~~(Math.random() * 1000))
        }}
      >
        set x
      </div>
      <div onClick={() => setParam(null)}>clear x</div>
    </div>
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
      <Router>
        <Button
          onClick={() => {
            set(!s)
          }}
        >
          Flip
        </Button>
        {s ? (
          <>
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
            <Page />
          </>
        ) : null}
      </Router>
    </div>
  )
}

// render(element, container[, callback])
const root = createRoot(document.body)

root.render(<RouterExample />)
