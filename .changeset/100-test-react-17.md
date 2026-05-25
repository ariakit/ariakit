---
"@ariakit/test": minor
---

Removed React 17 support from `@ariakit/test`

**BREAKING** if you're using `@ariakit/test` with React 17 or React Testing Library 12.

The `@ariakit/test` peer dependencies now support React 18 and 19, and React Testing Library 13 through 16.

Before:

```json
{
  "react": "17.x",
  "@testing-library/react": "12.x"
}
```

After:

```json
{
  "react": "18.x || 19.x",
  "@testing-library/react": "13.x || 14.x || 15.x || 16.x"
}
```
