---
"@ariakit/react-core": minor
"@ariakit/react": minor
---

Radio types have improved

**BREAKING** if you're using TypeScript and the [`onChange`](https://ariakit.org/reference/radio#onchange) prop on [`Radio`](https://ariakit.org/reference/radio), [`FormRadio`](https://ariakit.org/reference/form-radio), or [`MenuItemRadio`](https://ariakit.org/reference/menu-item-radio).

The [`onChange`](https://ariakit.org/reference/radio#onchange) callback argument type has changed from `React.SyntheticEvent` to `React.ChangeEvent`.

Before:

```tsx
<Radio onChange={(event: React.SyntheticEvent) => {}} />
```

After:

```tsx
<Radio onChange={(event: React.ChangeEvent) => {}} />
```
