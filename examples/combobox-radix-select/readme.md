---
tags:
  - Combobox
  - Dropdowns
  - Form controls
  - Radix UI
---

# Radix Select with Combobox

<div data-description>

Rendering a searchable [Radix UI](https://radix-ui.com) Select component with a text field that enables typeahead & autocomplete features using the primitive Ariakit [Combobox](/components/combobox) components.

</div>

<div data-tags></div>

<aside data-type="note" title="Note">

This example is designed for those who are already using Radix UI in their projects and can't easily switch away from it. If you're starting from scratch or can update your custom select widgets to use Ariakit, we recommend checking out the [Select with Combobox](/examples/select-combobox) example instead, which uses the Ariakit [Select](/components/select) component.

</aside>

<a href="./index.tsx" data-playground>Example</a>

## Components

Explore the Ariakit components used in this example:

<div data-cards="components">

- [](/components/combobox)

</div>

## Basic structure

```jsx "ComboboxProvider" "Combobox" "ComboboxList" "ComboboxItem"
<RadixSelect.Root>
  <ComboboxProvider>
    <RadixSelect.Trigger />
    <RadixSelect.Content>
      <Combobox />
      <ComboboxList>
        <RadixSelect.Item asChild>
          <ComboboxItem />
        </RadixSelect.Item>
      </ComboboxList>
    </RadixSelect.Content>
  </ComboboxProvider>
</RadixSelect.Root>
```

## Sharing state between Ariakit and Radix UI

We can share state between Ariakit and Radix UI by passing our own `open` state to both Radix's `Root` and Ariakit's [`ComboboxProvider`](/reference/combobox-provider):

```jsx
const [open, setOpen] = useState(false);

<RadixSelect.RadixPopover.Root open={open} onOpenChange={setOpen}>
  <ComboboxProvider open={open} setOpen={setOpen}>
```

You can learn more about this Ariakit feature in the guide:

<div data-cards>

- [](/guide/component-providers)

</div>

## Filtering options

The Ariakit [Combobox](/components/combobox) component doesn't dictate how you filter the items. It focuses solely on the [`ComboboxItem`](/reference/combobox-item) elements you render. Consequently, you can render items conditionally based on the [`value`](/reference/combobox-provider#value) state.

We use the [`setValue`](/reference/combobox-provider#setvalue) callback in combination with [`React.startTransition`](https://react.dev/reference/react/startTransition) to update our search value state without blocking the UI:

```jsx {5-7}
const [searchValue, setSearchValue] = useState("");

<ComboboxProvider
  setValue={(value) => {
    React.startTransition(() => {
      setSearchValue(value);
    });
  }}
>
```

You're free to use any matching algorithm or library to filter the items. In this example, we use [match-sorter](https://www.npmjs.com/package/match-sorter):

```jsx "matchSorter"
const matches = useMemo(() => {
  return matchSorter(languages, searchValue, {
    keys: ["label", "value"],
  });
}, [languages, searchValue]);
```

## Rendering `SelectItem` as `ComboboxItem`

To get the items to function as both a Radix `SelectItem` and an Ariakit [`ComboboxItem`](/reference/combobox-item), we have to combine the two components:

```jsx "asChild" "ComboboxItem"
<RadixSelect.Item value="en" asChild>
  <ComboboxItem>
    <RadixSelect.ItemText>English</RadixSelect.ItemText>
  </ComboboxItem>
</RadixSelect.Item>
```

## More examples

<div data-cards="examples">

- [](/examples/combobox-radix)
- [](/examples/dialog-radix)
- [](/examples/menu-combobox)
- [](/examples/select-combobox)
- [](/examples/combobox-filtering)
- [](/examples/combobox-group)
- [](/examples/combobox-multiple)
- [](/examples/combobox-tabs)

</div>
