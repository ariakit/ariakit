---
tags:
  - Combobox
  - Concurrent React
  - Search
  - Dropdowns
  - Form controls
---

# Combobox filtering

<div data-description>

Listing suggestions in a [Combobox](/components/combobox) component based on the input value using [`React.startTransition`](https://react.dev/reference/react/startTransition) to ensure the UI remains responsive during typing.

</div>

<div data-tags></div>

<a href="./index.tsx" data-playground>Example</a>

## Components

<div data-cards="components">

- [](/components/combobox)

</div>

## Setting the search value

In this example, we're using the [`setValue`](/reference/combobox-provider#setvalue) prop from the [`ComboboxProvider`](/reference/combobox-provider) component to set the search value when the user types. The state is updated in a [`React.startTransition`](https://react.dev/reference/react/startTransition) callback to ensure the UI remains responsive during typing.

```js {4-6}
const [searchValue, setSearchValue] = useState("");

<ComboboxProvider
  setValue={(value) => {
    startTransition(() => setSearchValue(value));
  }}
>
```

You can learn more about controlling state on the [Component providers](/guide/component-providers) guide.

## Filtering items

The [Combobox](/components/combobox) component is agnostic to the filtering method you use. Its concern lies solely in the items you render through the [`ComboboxItem`](/reference/combobox-item) component. You have the flexibility to select the filtering strategy that suits your specific use case.

In this example, we use the [match-sorter](https://www.npmjs.com/package/match-sorter) library to filter and sort items based on the search value. Another option is [fast-fuzzy](https://www.npmjs.com/package/fast-fuzzy), which employs advanced algorithms for fuzzy search.

```jsx "matchSorter" "ComboboxItem"
const matches = useMemo(() => {
  return matchSorter(list, searchValue);
}, [searchValue]);

matches.map((value) => <ComboboxItem key={value} value={value} />);
```

## Related examples

<div data-cards="examples">

- [](/examples/combobox-filtering-integrated)
- [](/examples/combobox-animated)
- [](/examples/combobox-cancel)
- [](/examples/combobox-group)
- [](/examples/combobox-links)
- [](/examples/combobox-multiple)
- [](/examples/combobox-tabs)
- [](/examples/menu-nested-combobox)

</div>
