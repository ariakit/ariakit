---
tags:
  - Plus
  - Combobox
  - Dropdowns
  - Routing
  - Next.js
  - Next.js App Router
  - Concurrent React
  - Optimistic updates
  - Advanced
---

# Combobox Select with Next.js App Router

<div data-description>

Controlling the selected value of a [Combobox](/components/combobox) via the URL using the [Next.js App Router](https://nextjs.org/docs/app) and [`React.useOptimistic`](https://react.dev/reference/react/useOptimistic) to ensure a responsive and accessible UI.

</div>

<div data-tags></div>

<a href="./page.tsx" data-playground>Example</a>

## Components

<div data-cards="components">

- [](/components/combobox)

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

To control the selected value of the Combobox Select, we can use the [`selectedValue`](/reference/combobox-provider#selectedvalue) and [`setSelectedValue`](/reference/combobox-provider#setselectedvalue) props from the [`ComboboxProvider`](/reference/combobox-provider) component:

```jsx
const [value, setValue] = React.useState("");

<ComboboxProvider
  selectedValue={value}
  setSelectedValue={setValue}
>
```

The [`setSelectedValue`](/reference/combobox-provider#setselectedvalue) callback can be used to carry out asynchronous tasks, such as redirecting to a new URL:

```jsx
const router = useRouter();

const [isPending, startTransition] = React.useTransition();
const [optimisticValue, setOptimisticValue] = React.useOptimistic(props.value);

<ComboboxProvider
  selectedValue={optimisticValue}
  setSelectedValue={(value) => {
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

The Combobox Select can function as either a single select or multi-select component. This is decided by the [`selectedValue`](/reference/combobox-provider#selectedvalue) prop's type. For single select, the value is a string, while for multi-select, it's an array of strings. Simply setting the value as an array activates the multi-select function.

In this example, we use the [`useComboboxContext`](/reference/use-combobox-context) hook within our custom `SelectItem` component to access the [combobox store](/reference/use-combobox-store). We then verify if the selected value is an array using the [`useStoreState`](/reference/use-store-state) hook:

```jsx
const combobox = useComboboxContext();
const isMultiSelect = useStoreState(combobox, (state) =>
  Array.isArray(state.selectedValue),
);
```

To learn more, check out the [Component stores](/guide/component-stores#computed-values) guide.

## Rendering `SelectItem` as a Next.js `Link`

Using the [`render`](/reference/combobox-item#render) prop, we can render the Ariakit [`ComboboxItem`](/reference/combobox-item) component as a different custom component or native element.

We're currently updating the URL on the [`setSelectedValue`](/reference/combobox-provider#setselectedvalue) callback, but we can also render the item as a Next.js Link component. This approach ensures users can use native link features, like opening the link in a new tab or previewing the page on mobile devices. By using the Next.js Link component, we also benefit from the built-in prefetching feature:

```jsx
<ComboboxItem render={<Link href="" />} />
```

As we're already updating the URL on the [`setSelectedValue`](/reference/combobox-provider#setselectedvalue) callback, to avoid duplicate navigation, we can prevent the default behavior using the [`selectValueOnClick`](/reference/combobox-item#selectvalueonclick) prop:

```jsx {4}
<ComboboxItem
  render={<Link href="" />}
  selectValueOnClick={(event) => {
    event.preventDefault();
    return true;
  }}
>
```

The [`selectValueOnClick`](/reference/combobox-item#selectvalueonclick) prop will only be called when it's safe to update the [`selectedValue`](/reference/combobox-provider#selectedvalue) state. As such, it will ignore actions like opening the link in a new tab or opening the context menu, which should not be prevented.

## Related examples

<div data-cards="examples">

- [](/examples/tab-next-router)
- [](/examples/dialog-next-router)
- [](/examples/select-animated)
- [](/examples/select-combobox)
- [](/examples/select-multiple)
- [](/examples/toolbar-select)

</div>
