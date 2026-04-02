---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Fixed components not dropping their internal `aria-labelledby` attribute when `aria-label` is explicitly passed. Per WAI-ARIA, `aria-labelledby` takes precedence over `aria-label`, so the user-supplied `aria-label` was being silently ignored. This affects [`Dialog`](https://ariakit.org/reference/dialog), [`TabPanel`](https://ariakit.org/reference/tab-panel), [`Select`](https://ariakit.org/reference/select), [`SelectList`](https://ariakit.org/reference/select-list), [`FormControl`](https://ariakit.org/reference/form-control), [`Group`](https://ariakit.org/reference/group), [`TooltipAnchor`](https://ariakit.org/reference/tooltip-anchor), and [`TagList`](https://ariakit.org/reference/tag-list).
