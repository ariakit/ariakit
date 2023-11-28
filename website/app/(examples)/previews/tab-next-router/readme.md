---
tags:
  - Tab
  - Routing
  - Next.js
  - Next.js App Router
  - Abstracted examples
---

# Tab with Next.js App Router

<div data-description>

Using [Next.js Parallel Routes](https://nextjs.org/docs/app/building-your-application/routing/parallel-routes) to create accessible [Tabs](/components/tab) and tab panels that are rendered on the server and controlled by the URL.

</div>

<div data-tags></div>

<a href="./layout.tsx" data-playground>Example</a>

## Components

<div data-cards="components">

- [](/components/tab)

</div>

## Abstracting the Tab components

In this example, we're abstracting the Ariakit [Tab](/components/tab) components into higher-level components with a simpler API integrated with the [Next.js App Router](https://nextjs.org/docs/api-reference/next/router). Check out the `tabs.tsx` file above to see the source code.

## Controlling the Tab state

To control the selected tab state, you can pass the [`selectedId`](/reference/tab-provider#selectedid) and [`setSelectedId`](/reference/tab-provider#setselectedid) props to [`TabProvider`](/reference/tab-provider). These props allow you to synchronize the tab state with other state sources, such as the browser history.

```jsx {5-8}
const router = useRouter();
const pathname = usePathname();

<TabProvider
  selectedId={pathname}
  setSelectedId={(id) => {
    router.push(id || pathname)
  }}
>
```

You can learn more about controlled state on the [Component providers](/guide/component-providers#controlled-state) guide.

## Rendering a single TabPanel

It's possible to render a single [`TabPanel`](/reference/tab-panel) component and use the [`tabId`](/reference/tab-panel#tabid) prop to point to the selected tab.

```jsx
const tabId = tab.useState("selectedId");

<TabPanel tabId={tabId}>{props.children}</TabPanel>;
```

## Related examples

<div data-cards="examples">

- [](/examples/dialog-next-router/)
- [](/examples/tab-react-router/)
- [](/examples/menubar-navigation)

</div>
