---
"@ariakit/components": patch
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Improved [`useCollectionStore`](https://ariakit.com/reference/use-collection-store) performance when populating large collections, [`useCompositeStore`](https://ariakit.com/reference/use-composite-store) performance during sequential and multi-row keyboard navigation (including when finding the last enabled item), [`useDisclosureStore`](https://ariakit.com/reference/use-disclosure-store) performance when creating stores, and [`useTabStore`](https://ariakit.com/reference/use-tab-store) performance when keyboard focus and selection remain synchronized, with these improvements also benefiting components built on the stores such as [`Tab`](https://ariakit.com/reference/tab) and [`TabPanel`](https://ariakit.com/reference/tab-panel).
