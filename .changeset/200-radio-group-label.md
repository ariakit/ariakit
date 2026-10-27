---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

New `RadioGroupLabel` component

The new [`RadioGroupLabel`](https://ariakit.com/reference/radio-group-label) component labels a [`RadioGroup`](https://ariakit.com/reference/radio-group). Render it inside the group, and the group gets an `aria-labelledby` attribute that points to the label.

```tsx
<RadioProvider>
  <RadioGroup>
    <RadioGroupLabel>Favorite fruit</RadioGroupLabel>
    <Radio value="apple" />
    <Radio value="orange" />
  </RadioGroup>
</RadioProvider>
```

The group gets the label id after hydration, so server-rendered HTML doesn't name the group. An `aria-label` prop on the [`RadioGroup`](https://ariakit.com/reference/radio-group) still takes precedence over the label.
