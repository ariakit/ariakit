---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`HovercardDisclosure`](https://ariakit.com/reference/hovercard-disclosure) throwing a `TypeError` when a blur event with a non-element `relatedTarget` (such as `window` or an `XMLHttpRequest`) reached its global listener while the disclosure was shown.
