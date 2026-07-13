---
"@ariakit/components": patch
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Improved store performance

Improved [`useCollectionStore`](https://ariakit.com/reference/use-collection-store) performance when populating large collections and [`useCompositeStore`](https://ariakit.com/reference/use-composite-store) performance during sequential and multi-row keyboard navigation, including when finding the last enabled item.

Reduced the work performed by [`useDisclosureStore`](https://ariakit.com/reference/use-disclosure-store) when creating stores and by [`useTabStore`](https://ariakit.com/reference/use-tab-store) when keyboard focus and selection stay synchronized.

These improvements also apply to components built on the stores, including [`Tab`](https://ariakit.com/reference/tab) and [`TabPanel`](https://ariakit.com/reference/tab-panel).
