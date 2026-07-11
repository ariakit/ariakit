---
"@ariakit/components": patch
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Reduced the work performed by [`useDisclosureStore`](https://ariakit.com/reference/use-disclosure-store) and components built on it, including [`TabPanel`](https://ariakit.com/reference/tab-panel), by avoiding unnecessary internal store creation.
