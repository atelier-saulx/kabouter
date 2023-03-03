# kabouter

Minimalist router for react 🍀

```javascript
import { useRoute } from 'kabouter'

const Page = () => {
  const route = useRoute('pages/[pageId]/[pageNumber]')
  const { pageId, pageNumber } = route.path
  return (
    <div
      onClick={() => {
        route.setPath({
          pageNumber: pageNumber + 1,
        })
      }}
    >
      {pageId} {pageNumber}
    </div>
  )
}
```
