---
"@ariakit/react-core": minor
"@ariakit/react": minor
---

[`#2714`](https://github.com/ariakit/ariakit/pull/2714) Added support for a dynamic `store` prop on component stores.

This is similar to the `store` prop on components. Now, component store hooks can support modifying the value of the `store` prop after the initial render. For instance:

```js
// props.store can change between renders now
const checkbox = useCheckboxStore({ store: props.store });
```

When the `store` prop changes, the object returned from the store hook will update as well. Consequently, effects and hooks that rely on the store will re-run.

While it's unlikely, this **could represent a breaking change** if you're depending on the `store` prop in component stores to only acknowledge the first value passed to it.
