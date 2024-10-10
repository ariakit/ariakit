---
tags:
  - Plus
  - Select
  - Dropdowns
  - Routing
  - Next.js
  - Next.js App Router
  - Concurrent React
  - Optimistic updates
  - Advanced
---

# Select with Next.js App Router

<div data-description>

Controlling the value of a [Select](/components/select) component via the URL using the [Next.js App Router](https://nextjs.org/docs/app) and [`React.useOptimistic`](https://react.dev/reference/react/useOptimistic) to ensure a responsive and accessible UI.

</div>

<div data-tags></div>

<a href="./page.tsx" data-playground>Example</a>

## Components

<div data-cards="components">

- [](/components/select)

</div>

## Using Zod to parse search params

In this example, we use the [Zod](https://zod.dev) to parse the [`searchParams`](https://nextjs.org/docs/app/api-reference/file-conventions/page#searchparams-optional) prop from the Next.js App Router. This allows us to safely parse the search params and remove invalid values:

```js
import { z } from "zod";

const schema = z.object({
  value: z.string().optional(),
});

export default function Page({ searchParams }) {
  const { value } = schema.parse(searchParams);
  // ...
}
```

## Controlling the state via the URL and optimistic updates

To control the value of the [Select](/components/select) component, we can use the [`value`](/reference/select-provider#value) and [`setValue`](/reference/select-provider#setvalue) props from the [`SelectProvider`](/reference/select-provider) component:

```jsx
const [value, setValue] = React.useState("");

<SelectProvider value={value} setValue={setValue}>
```

The [`setValue`](/reference/select-provider#setvalue) callback can be used to carry out asynchronous tasks, such as redirecting to a new URL:

```jsx
const router = useRouter();

const [isPending, startTransition] = React.useTransition();
const [optimisticValue, setOptimisticValue] = React.useOptimistic(props.value);

<SelectProvider
  value={optimisticValue}
  setValue={(value) => {
    startTransition(() => {
      // Instant update
      setOptimisticValue(value);
      // Depends on network conditions
      router.push(...);
    });
  }}
>
```

By using [`React.useOptimistic`](https://react.dev/reference/react/useOptimistic), we can optimistically update the UI before the navigation finishes, ensuring a responsive UI even in slow network conditions.

## Single select or multi-select

The [Select](/components/select) component can function as either a single select or multi-select component. This is decided by the [`value`](/reference/select-provider#value) prop's type. For single select, the value is a string, while for multi-select, it's an array of strings. Simply setting the value as an array activates the multi-select function.

In this example, we use the [`useSelectContext`](/reference/use-select-context) hook within our custom `SelectItem` component to access the [select store](/reference/use-select-store). We then verify if the value is an array using the [`useStoreState`](/reference/use-store-state) hook:

```jsx
const select = useSelectContext();
const isMultiSelect = useStoreState(
  select,
  (state) => Array.isArray(state.value),
);
```

To learn more, check out the [Component stores](/guide/component-stores#computed-values) guide.

## Rendering `SelectItem` as a Next.js `Link`

Using the [`render`](/reference/select-item#render) prop, we can render the Ariakit [`SelectItem`](/reference/select-item) component as a different custom component or native element.

We're currently updating the URL on the [`setValue`](/reference/select-provider#setvalue) callback, but we can also render the item as a Next.js `Link` component. This approach ensures users can use native link features, like opening the link in a new tab or previewing the page on mobile devices. By using the Next.js `Link` component, we also benefit from the built-in prefetching feature:

```jsx
<SelectItem render={<Link href="" />} />
```

As we're already updating the URL on the [`setValue`](/reference/select-provider#setvalue) callback, to avoid duplicate navigation, we can prevent the default behavior using the [`setValueOnClick`](/reference/select-item#setvalueonclick) prop:

```jsx {4}
<SelectItem
  render={<Link href="" />}
  setValueOnClick={(event) => {
    event.preventDefault();
    return true;
  }}
>
```

The [`setValueOnClick`](/reference/select-item#setvalueonclick) prop will only be called when it's safe to update the [`value`](/reference/select-provider#value) state. As such, it will ignore actions like opening the link in a new tab or opening the context menu, which should not be prevented.

## Related examples

<div data-cards="examples">

- [](/examples/tab-next-router)
- [](/examples/dialog-next-router)
- [](/examples/select-animated)
- [](/examples/select-combobox)
- [](/examples/select-multiple)
- [](/examples/toolbar-select)

</div>
