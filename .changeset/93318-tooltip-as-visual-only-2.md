---
"@ariakit/react-core": minor
"@ariakit/react": minor
---

Tooltips no longer use `aria-describedby`

[Tooltip](https://ariakit.org/components/tooltip) no longer uses the `aria-describedby` attribute to associate the tooltip content with the anchor. This change prevents screen readers from announcing the tooltip content twice when the anchor element already carries the same label.
