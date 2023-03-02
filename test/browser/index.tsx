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
        padding: 10,
        border: '2px solid black',
      }}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

const SimpleRoute = () => {
  console.info('UPDATE S ROUTE')

  const [t, updateT] = useState(0)

  //   useEffect(() => {
  //     const i = setInterval(() => {
  //       updateT((i) => i + 0.1)
  //     }, 10)

  //     return () => {
  //       clearInterval(i)
  //     }
  //   }, [])

  const route = useRoute('[flap]/[snur]/[snapje]/[bla]/[$]')
  return (
    <div
      style={{
        background: `linear-gradient(${
          t * 100
        }deg, rgba(0,255,255,0.1), rgba(255,255,0,0.1))`,
        width: 350,
        // height: 500,
        transition: 'transform 0.25s, background 0.25s',
        transform: `perspective(1450px) rotateY(${t * 0.1}deg) rotateX(${
          t * 0.1
        }deg) translate(500px, 500px)`,
        border: '3px solid black',
        borderRadius: '5px',
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
            $: Math.round(Math.random() * 1e6),
            snapje: Math.round(Math.random() * 1e6),
          })
        }}
      >
        Set snapje
      </Button>
      <pre>{JSON.stringify(route.path, null, 2)}</pre>
    </div>
  )
}

export const Router = () => {
  const routes = useRouterListeners()
  return (
    <>
      <RouterContext.Provider value={routes}>
        <SimpleRoute />
      </RouterContext.Provider>
    </>
  )
}

// render(element, container[, callback])
const root = createRoot(document.body)

root.render(<Router />)
