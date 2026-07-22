---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

`RadioGroup` disables descendant radios

The [`RadioGroup`](https://ariakit.com/reference/radio-group) `disabled` prop now marks the group as disabled and disables descendant [`Radio`](https://ariakit.com/reference/radio) components, including radios rendered as custom elements.

```tsx
<RadioGroup disabled>
  <Radio value="Apple" />
  <Radio value="Orange" />
</RadioGroup>
```

Thanks to [@kripod](https://github.com/kripod) for reporting the issue.
