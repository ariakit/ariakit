# Tab with React Router

<p data-description>
  Using <a href="https://reactrouter.com/">React Router</a> to create <a href="/components/tab">Tab</a> links and tab panels controlled by the browser history, while maintaining keyboard navigation.
</p>

<a href="./index.tsx" data-playground>Example</a>

## Controlling the Tab state

To control the selected tab state, you can pass the [`selectedId`](/apis/tab-store#selectedid) and [`setSelectedId`](/apis/tab-store#setselectedid) props to [`useTabStore`](/apis/tab-store). Theese props allow you to synchronize the tab state with other state sources, such as the browser history.

```jsx {5,6}
const navigate = useNavigate();
const { pathname } = useLocation();

const tab = Ariakit.useTabStore({
  selectedId: pathname,
  setSelectedId: (id) => navigate(id || "/"),
});
```

You can learn more about controlled state on the [Component stores](/guide/component-stores#controlled-state) guide.

## Rendering a single TabPanel

It's possible to render a single [`TabPanel`](/apis/tab-panel) component and use the [`tabId`](/apis/tab-panel#tabid) prop to control the selected tab.

```jsx
const selectedId = tab.useState("selectedId");

<TabPanel tabId={selectedId}>
  <Outlet />
</TabPanel>;
```
