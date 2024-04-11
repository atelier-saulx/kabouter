import { useRoute } from './useRoute.js'

/**
Hook to interact with a single search param, set to `null` to clear

```javascript 
const [counter, setCounter] = useSearchParam('counter', 0)

<div onClick={() => {
        setCounter((counter) => counter + 1)
}}>
        {counter}
</div>
```
*/
export const useSearchParam = <T = any>(
  key: string,
  defaultValue?: T
): [T, (value: null | T | ((value: T) => T)) => void] => {
  const route = useRoute()
  const params = route.query
  const val = <T>params[key] ?? defaultValue
  return [
    val,
    (v) => {
      if (typeof v === 'function') {
        // @ts-ignore
        route.setQuery({ [key]: v(val) })
      } else {
        route.setQuery({ [key]: v })
      }
    },
  ]
}
