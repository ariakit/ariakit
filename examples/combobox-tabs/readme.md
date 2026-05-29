---
tags:
  - Plus
  - Combobox
  - Tab
  - Concurrent React
  - Search
  - Dropdowns
  - Advanced
  - Abstracted examples
media:
  - type: image
    src: /media/combobox-tabs-1.jpg
    alt: A snippet of JSX code highlighting the use of React.startTransition on ComboboxProvider and TabProvider
    width: 960
    height: 720
---

# Combobox with Tabs

<div data-description>

Organizing [Combobox](/components/combobox) with [Tab](/components/tab) components that support mouse, keyboard, and screen reader interactions. The UI remains responsive by using `React.startTransition`.

</div>

<div data-tags></div>

<a href="./index.react.tsx" data-playground>Example</a>

## Components

<div data-cards="components">

- [](/components/combobox)
- [](/components/tab)

</div>

## Basic structure

By rendering [Tab](/components/tab) components within [`ComboboxProvider`](/reference/combobox-provider), the [`composite`](/reference/tab-provider#composite) prop is automatically assigned on the tab store. This enables both modules to function together seamlessly:

```jsx "TabProvider" "TabList" "Tab" "TabPanel"
<ComboboxProvider>
  <Combobox />
  <ComboboxPopover>
    <TabProvider>
      <TabList>
        <Tab />
      </TabList>
      <TabPanel unmountOnHide>
        <ComboboxList>
          <ComboboxItem />
        </ComboboxList>
      </TabPanel>
    </TabProvider>
  </ComboboxPopover>
</ComboboxProvider>
```

## Improving performance with Concurrent React

This example leverages the [`React.startTransition`](https://react.dev/reference/react/startTransition) API to enhance performance when changing tabs and filtering the list of options. This ensures the UI stays responsive for users on low-end devices.

This behavior is abstracted into the custom `ComboboxProvider` component and exposed through `onSearch` and `onTabChange` props:

```jsx {3-5,10-12}
<Ariakit.ComboboxProvider
  setValue={(value) => {
    React.startTransition(() => {
      props.onSearch?.(value)
    })
  }}
>
  <Ariakit.TabProvider
    setSelectedId={(id) => {
      React.startTransition(() => {
        props.onTabChange?.(id)
      })
    }}
  >
```

Additionally, we can make the mounting of the combobox popover children non-blocking by using [`React.useDeferredValue`](https://react.dev/reference/react/useDeferredValue) on the combobox `mounted` state:

```jsx "useDeferredValue"
const mounted = React.useDeferredValue(useStoreState(combobox, "mounted"));

<Ariakit.ComboboxPopover hidden={!mounted}>
  {mounted && props.children}
</Ariakit.ComboboxPopover>;
```

## Rendering a single `TabPanel`

Typically, we have one [`TabPanel`](/reference/tab-panel) for each [`Tab`](/reference/tab) component. But in this case, we want to render only one panel that contains the list of options for the selected tab. This ensures optimal React concurrent transitions and that [`ComboboxItem`](/reference/combobox-item) components are rendered only when necessary.

To render a single [`TabPanel`](/reference/tab-panel), we need to set its [`tabId`](/reference/tab-panel#tabid) prop to the [`selectedId`](/reference/use-tab-store#selectedid) state:

```jsx
const selectedId = useStoreState(tab, "selectedId");

<Ariakit.TabPanel tabId={selectedId}>
```

This ensures that the tab panel is always visible, and the `aria-controls` and `aria-labelledby` attributes are correctly assigned.

## Testing with screen readers

We initially experimented with this example using a completely different accessibility tree. The popup was designated as a `grid` instead of a `dialog`. Each tab was marked as a `columnheader`, which automatically linked their names with the `gridcell` elements, which we used instead of `tabpanel`. Then, the `listbox` along with its `option` elements were nested within this grid cell.

In theory, this method should have taken care of the necessary keyboard interactions without needing any custom handler. When moving between grid cells, their column header (tab) name would be announced.

However, we encountered several problems that ultimately made the experience quite confusing:

- Generally speaking, the announcements were annoyingly verbose. The grid was announced as containing 2 rows (the row with the `columnheader` elements and the row with the nested `listbox`/`option` elements). This was perplexing as this information conflicted with the number of options in the `listbox` and the columns in the `grid`. There were too many numbers when selecting the first option.

- Certain browser/screen reader combinations wouldn't announce the column header name when moving between grid cells.

### Just use the appropriate role

We attempted the `grid` approach because we assumed that the `combobox` role wouldn't recognize `tab` as a valid `aria-activedescendant` target. However, it turns out that all major screen readers support this. Moving virtual focus from the combobox input to a `tab` will correctly announce it as a `tab` in a `tablist`. Also, when the first `option` is chosen, the encompassing `tabpanel` name is announced.

It might not be clear that pressing <kbd>←</kbd> and <kbd>→</kbd> while an `option` is selected will shift focus to the previous/next `tab`. But, when this occurs, the `tab` name is announced along with its correct role and position within the `tablist`.

## Related examples

<div data-cards="examples">

- [](/examples/dialog-combobox-tab-command-menu)
- [](/examples/combobox-filtering)
- [](/examples/combobox-filtering-integrated)
- [](/examples/combobox-group)
- [](/examples/combobox-links)
- [](/examples/combobox-cancel)
- [](/examples/combobox-disclosure)
- [](/examples/select-combobox-tab)

</div>
