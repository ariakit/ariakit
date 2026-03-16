---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Improved `CheckboxProvider` generic typing

This fixes TypeScript errors when wrapping [`CheckboxProvider`](https://ariakit.org/reference/checkbox-provider) in generic React components. Controlled and uncontrolled checkbox group wrappers now type-check correctly without requiring non-null assertions on values such as `defaultValue`.

Before, generic wrappers often needed a non-null assertion to satisfy the provider props:

```tsx
function CheckboxCardGrid<T extends string | number>({
  value,
  setValue,
  defaultValue,
}: {
  value?: T[];
  setValue?: (value: T[]) => void;
  defaultValue?: T[];
}) {
  return (
    <CheckboxProvider
      value={value}
      setValue={setValue}
      defaultValue={defaultValue!}
    />
  );
}
```

Now the same wrapper can type-check without the workaround:

```tsx
function CheckboxCardGrid<T extends string | number>({
  value,
  setValue,
  defaultValue,
}: {
  value?: T[];
  setValue?: (value: T[]) => void;
  defaultValue?: T[];
}) {
  return (
    <CheckboxProvider
      value={value}
      setValue={setValue}
      defaultValue={defaultValue}
    />
  );
}
```
