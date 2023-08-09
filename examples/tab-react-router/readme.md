---
tags:
  - Tab
  - Routing
  - React Router
---

# Tab with React Router

<div data-description>

Using <a href="https://reactrouter.com/">React Router</a> to create <a href="/components/tab">Tab</a> links and tab panels controlled by the browser history, while maintaining keyboard navigation.

</div>

<div data-tags></div>

<a href="./index.tsx" data-playground>Example</a>

## Components

<div data-cards="components">

- [](/components/tab)

</div>

## Controlling the Tab state

To control the selected tab state, you can pass the [`selectedId`](/reference/use-tab-store#selectedid) prop to [`useTabStore`](/reference/use-tab-store). This prop allows you to synchronize the tab state with other state sources, such as the browser history.

```jsx {4}
const location = useLocation();

const tab = Ariakit.useTabStore({
  selectedId: location.pathname,
});
```

You can learn more about controlled state on the [Component stores](/guide/component-stores#controlled-state) guide.

## Rendering a single TabPanel

It's possible to render a single [`TabPanel`](/reference/tab-panel) component and use the [`tabId`](/reference/tab-panel#tabid) prop to control the selected tab.

```jsx
const selectedId = tab.useState("selectedId");

<TabPanel tabId={selectedId}>
  <Outlet />
</TabPanel>;
```

## Related examples

<div data-cards="examples">

- [](/examples/dialog-react-router)
- [](/examples/tab-next-router)
- [](/examples/dialog-next-router)

</div>
