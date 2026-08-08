---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed Safari Option+Tab navigation being treated as pointer modality, so keyboard-focused components now receive `data-focus-visible` and trigger focus-driven behavior such as tooltips.
