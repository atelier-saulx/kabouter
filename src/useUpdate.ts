import { useState } from 'react'

export const useUpdate = () => {
  const [, setCount] = useState(0)
  return () => {
    setCount((count) => count + 1)
  }
}
