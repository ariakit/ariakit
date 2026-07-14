---
"@ariakit/react-store": patch
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Reduced React store subscription overhead by skipping listeners when setter callbacks are absent and reading four related [`DisclosureContent`](https://ariakit.com/reference/disclosure-content) state values through one subscription, including in [`TabPanel`](https://ariakit.com/reference/tab-panel) and [`Dialog`](https://ariakit.com/reference/dialog) components.
