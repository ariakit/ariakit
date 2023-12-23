---
tags:
  - Tab
  - Routing
  - React Router
  - Abstracted examples
---

# Tab with React Router

<div data-description>

Using [React Router](https://reactrouter.com/) to create [Tab](/components/tab) links and tab panels controlled by the browser history, while maintaining keyboard navigation.

</div>

<div data-tags></div>

<a href="./index.tsx" data-playground>Example</a>

## Components

<div data-cards="components">

- [](/components/tab)

</div>

## Controlling the Tab state

To control the selected tab state, you can pass the [`selectedId`](/reference/tab-provider#selectedid) prop to [`TabProvider`](/reference/tab-provider). This prop allows you to synchronize the tab state with other state sources, such as the browser history.

```jsx "selectedId"
const location = useLocation();

<TabProvider selectedId={location.pathname}>
```

You can learn more about controlled state on the [Component providers](/guide/component-providers#controlled-state) guide.

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
- [](/examples/menubar-navigation)
- [](/examples/combobox-tabs)

</div>
