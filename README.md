# kabouter

A minimalist, batteries included router for react 🍀

## Path with variables

Will strictly match all non `[variable]` path statements

```javascript
import { useRoute } from 'kabouter'

const Books = () => {
  const route = useRoute('books/[book]/[page]')
  const { book, page } = route.path
  return (
    <div
      onClick={() => {
        // Will result in path "/book/mybook/1"
        route.setPath({
          book,
          page: page + 1,
        })
      }}
    >
      {book} {page}
    </div>
  )
}
```

## Nested paths

Allows composition of different and path routes together

```javascript
import { useRoute } from 'kabouter'

const Page = () => {
  const route = useRoute('[page]')
  return <div>{route.path.page}</div>
}

const Books = () => {
  const route = useRoute('books/[book]')
  const { id } = route.path
  // Creates nested route page will now use "/books/mybook/1"
  return <div>{route.nest(<Page />)}</div>
}
```

## Query parameters

Use query paramets, set a parm to `null` to clear, pass `{ overwrite: true }` as option to overwrite current query params, default is merge

```javascript
import { useRoute } from 'kabouter'

const Counter = () => {
  const route = useRoute()
  return (
    <div
      onClick={() => {
        // merges by default
        route.setQuery({
          counter: route.query.counter + 1,
        })
      }}
    >
      {route.query.counter}
    </div>
  )
}
```

## Hash

Listen and modify the location hash

```javascript
import { useRoute } from 'kabouter'

const Counter = () => {
  const route = useRoute()
  return (
    <div
      onClick={() => {
        route.setHash(route.hash + 1)
      }}
    >
      {route.hash}
    </div>
  )
}
```

## Location

Listens and modify the whole location

```javascript
import { useRoute } from 'kabouter'

const Counter = () => {
  const route = useRoute()
  return (
    <div onClick={() => route.setLocation('/something')}>{route.location}</div>
  )
}
```

## useSearchParam

Hook to interact with a single search param, set to `null` to clear

```javascript
import { useSearchParam } from 'kabouter'

const Counter = () => {
  const [counter, setCounter] = useSearchParam('counter', 0)
  return (
    <div
      onClick={() => {
        setCounter((counter) => counter + 1)
      }}
    >
      {counter}
    </div>
  )
}
```
