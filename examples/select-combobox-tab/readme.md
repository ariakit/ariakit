---
tags:
  - Plus
  - Combobox
  - Tab
  - Concurrent React
  - Search
  - Animated
  - CSS transitions
  - Dropdowns
  - Form controls
  - Abstracted examples
---

# Combobox Select with Tabs

<div data-description>

Abstracting [Combobox](/components/combobox) and [Tab](/components/tab) components into a searchable, tabbed select dropdown.

</div>

<div data-tags></div>

<a href="./index.react.tsx" data-playground>Example</a>

## Components

<div data-cards="components">

- [](/components/combobox)
- [](/components/tab)

</div>

## Component structure

We can create this searchable tabbed select widget by combining [Combobox](/components/combobox) and [Tab](/components/tab) components with the following structure:

```jsx
<ComboboxProvider>
  <ComboboxSelect />
  <ComboboxPopover>
    <ComboboxInput />
    <TabProvider>
      <TabList>
        <Tab />
      </TabList>
      <TabPanel>
        <ComboboxList>
          <ComboboxItem />
        </ComboboxList>
      </TabPanel>
    </TabProvider>
  </ComboboxPopover>
</ComboboxProvider>
```

In this example, we've abstracted the Ariakit components above into a custom `Select` component. This renders a Combobox Select with an optional search field and tabs, depending on the props and children passed to it:

```jsx
<Select combobox={<input />}>
  <SelectTabList>
    <SelectTab />
  </SelectTabList>
  <SelectTabPanel>
    <SelectList>
      <SelectItem />
    </SelectList>
  </SelectTabPanel>
</Select>
```

You can either leave out the `combobox` prop or choose not to render the `SelectTab*` components to create a simpler select dropdown.

## Tabs with manual selection

By default, pressing horizontal arrow keys within a select dropdown with tabs will automatically select the next or previous tab. This behavior can be disabled with the [`selectOnMove`](/reference/tab-provider#selectonmove) prop:

```jsx
<TabProvider selectOnMove={false}>
```

This means that the user must manually select a tab by pressing the <kbd>Enter</kbd> key or clicking on it.

## Adding custom items from user input

In this example, we let users add custom branches by typing into the combobox input. The custom `SelectItem` component renders a [`ComboboxItem`](/reference/combobox-item) with a click handler:

```jsx
<SelectItem
  value={searchValue}
  onClick={() => {
    setData((data) => ({
      ...data,
      branches: [...data.branches, searchValue],
    }));
  }}
>
  Create branch {searchValue} from {value}
</SelectItem>
```

## Related examples

<div data-cards="examples">

- [](/examples/select-combobox)
- [](/examples/select-animated)
- [](/examples/combobox-tabs)
- [](/examples/form-select)
- [](/examples/toolbar-select)
- [](/examples/select-next-router)

</div>
