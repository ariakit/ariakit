# Tab with Next.js App Router

<p data-description>
  Using <a href="https://nextjs.org/docs/app/building-your-application/routing/parallel-routes">Next.js Parallel Routes</a> to create accessible <a href="/components/tab">Tabs</a> and tab panels that are rendered on the server and controlled by the URL.
</p>

<a href="./layout.tsx" data-playground>Example</a>

## Abstracting the Tab components

In this example, we're abstracting the Ariakit [Tab](/components/tab) components into higher-level components with a simpler API integrated with the [Next.js App Router](https://nextjs.org/docs/api-reference/next/router). Check out the `tabs.tsx` file above to see the source code.

We're using React Context to provide the tab store to the [`TabList`](/apis/tab-list) and [`TabPanel`](/apis/tab-panel) components. You can learn more about this pattern on the [Component stores](/guide/component-stores#using-react-context) guide.

## Controlling the Tab state

To control the selected tab state, you can pass the [`selectedId`](/apis/tab-store#selectedid) and [`setSelectedId`](/apis/tab-store#setselectedid) props to [`useTabStore`](/apis/tab-store). These props allow you to synchronize the tab state with other state sources, such as the browser history.

```jsx {5,6}
const router = useRouter();
const pathname = usePathname();

const tab = Ariakit.useTabStore({
  selectedId: pathname,
  setSelectedId: (id) => router.push(id || "/"),
});
```

You can learn more about controlled state on the [Component stores](/guide/component-stores#controlled-state) guide.

## Rendering a single TabPanel

It's possible to render a single [`TabPanel`](/apis/tab-panel) component and use the [`tabId`](/apis/tab-panel#tabid) prop to point to the selected tab.

```jsx
const selectedId = tab.useState("selectedId");

<TabPanel tabId={selectedId}>{props.children}</TabPanel>;
```
