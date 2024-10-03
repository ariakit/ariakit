---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Tab panels with scroll restoration

Ariakit now supports scroll restoration for the [`TabPanel`](https://ariakit.org/reference/tab-panel) component. This allows you to control whether and how the scroll position is restored when switching tabs.

To enable scroll restoration, use the new [`scrollRestoration`](https://ariakit.org/reference/tab-panel#scrollrestoration) prop:

```jsx
// Restores the scroll position of the tab panel element when switching tabs
<TabPanel scrollRestoration />
```

By default, the scroll position is restored when switching tabs. You can set it to `"reset"` to return the scroll position to the top of the tab panel when changing tabs. Use the [`scrollElement`](https://ariakit.org/reference/tab-panel#scrollelement) prop to specify a different scrollable element:

```jsx
// Resets the scroll position of a different scrollable element
<div className="overflow-auto">
  <TabPanel
    scrollRestoration="reset"
    scrollElement={(panel) => panel.parentElement}
  />
</div>
```
