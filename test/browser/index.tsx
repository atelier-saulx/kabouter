import React, {
  FC,
  MouseEventHandler,
  ReactNode,
  useEffect,
  useState,
} from 'react'
import { useRoute, useRouterListeners } from '../../src'
import { createRoot } from 'react-dom'
import { RouterContext } from '../../src/Provider'

// if (window.location.pathname !== '/') {
//   window.location.pathname = '/'
// }

const Button: FC<{ onClick: MouseEventHandler; children: ReactNode }> = ({
  children,
  onClick,
}) => {
  return (
    <button
      style={{
        marginRight: 8,
        padding: 10,
        border: '2px solid black',
      }}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

const RouteWrapper = ({ children, id }) => {
  const r = useRoute(`[${id}]`)
  //   console.info(r)
  return (
    <div
      style={{
        marginTop: 32,
        marginLeft: 32,
      }}
    >
      <div style={{ margin: 32, border: '2px solid black' }}>{id}</div>
      <div
        style={{
          borderLeft: '2px solid black',
          paddingLeft: 24,
        }}
      >
        {children}
      </div>
    </div>
  )
}

const SimpleRoute = ({ id }) => {
  //   console.info('UPDATE S ROUTE')

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

export const Router = () => {
  const [s, set] = useState(true)
  const routes = useRouterListeners()
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
        <RouterContext.Provider value={routes}>
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
        </RouterContext.Provider>
      ) : null}
    </div>
  )
}

// render(element, container[, callback])
const root = createRoot(document.body)

root.render(<Router />)
