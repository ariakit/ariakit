---
tags:
  - New
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
  - type: image
    src: /media/combobox-tabs-2.jpg
    alt: A snippet of JavaScript code highlighting the use of setActiveId, select and next methods from the Ariakit tab store
    width: 960
    height: 720
---

# Combobox with tabs

<div data-description>

Organizing [Combobox](/components/combobox) with [Tab](/components/tab) components that support mouse, keyboard, and screen reader interactions. A UI that remains responsive by using [`React.startTransition`](https://react.dev/reference/react/startTransition).

</div>

<div data-tags></div>

<a href="./index.tsx" data-playground>Example</a>

## Components

<div data-cards="components">

- [](/components/combobox)
- [](/components/tab)

</div>

<aside data-type="note" title="This is an advanced example">

This example employs sophisticated methods to ensure maximum accessibility across different browsers, devices, and assistive technologies. You can easily copy and paste the provided code into your project and use it as a foundation.

Refer to the documentation below for a deeper understanding of the implementation details. As time progresses, we may introduce additional features to the Ariakit library to further simplify the implementation of this example.

</aside>

## Syncing Combobox and Tab state

To prevent the selected tab from remaining in a focused state when moving from the tab to a combobox option, we need to sync the [`activeId`](/reference/combobox-provider#activeid) state of both components. This can be achieved by [controlling the state](/guide/component-providers#controlled-state):

```jsx
const [activeId, setActiveId] = React.useState(null);

<ComboboxProvider activeId={activeId} setActiveId={setActiveId}>
  <TabProvider activeId={activeId} setActiveId={setActiveId}>
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

## Custom auto-select behavior

By default, the [`autoSelect`](/reference/combobox#autoselect) prop on [`Combobox`](/reference/combobox) will automatically select the first [`ComboboxItem`](/reference/combobox-item) when the user types in the input.

We can customize this behavior with the [`getAutoSelectId`](/reference/combobox#getautoselectid) prop. In this example, we use it to bypass the tab items:

```jsx
<Ariakit.Combobox
  autoSelect
  getAutoSelectId={(items) => {
    const firstNonTabEnabledItem = items.find((item) => {
      if (item.disabled) return false;
      return item.element?.getAttribute("role") !== "tab";
    });
    return firstNonTabEnabledItem?.id;
  }}
>
```

## Rendering `ComboboxCancel` conditionally

We use [the callback version of the store's `useState` hook](/guide/component-stores#computed-values) to check if the combobox input isn't empty. If it's not, we can then render the [`ComboboxCancel`](/reference/combobox-cancel) component:

```jsx
const hasValue = combobox.useState((state) => state.value !== "");

hasValue && <Ariakit.ComboboxCancel />;
```

## Rendering a listbox inside `TabPanel`

Elements with `role="listbox"` can only include elements with `role="group"` and `role="option"` as their accessibility children. That's why we override the default `role` of the [`ComboboxPopover`](/reference/combobox-popover) component, allowing us to display tabs and tab panels within it.

Consequently, we place the listbox element inside the [`TabPanel`](/reference/tab-panel) component:

```jsx
<Ariakit.ComboboxPopover role="dialog">
  <Ariakit.TabPanel>
    <div role="listbox">
      <Ariakit.ComboboxItem />
```

## Rendering `ComboboxItem` as `Tab`

By taking advantage of [composition](/guide/composition), we can get the [`Tab`](/reference/tab) component to function as a [`ComboboxItem`](/reference/combobox-item). This enables us to navigate between the selected tab and the combobox input using arrow keys.

To ensure a vertical list of items, we only register the _selected_ tab as a combobox item using the [`shouldRegisterItem`](/reference/combobox-item#shouldregisteritem) prop:

```jsx
const id = React.useId();
const isSelected = tab.useState((state) => state.selectedId === id);

<Ariakit.ComboboxItem
  id={id}
  shouldRegisterItem={isSelected}
  render={<Ariakit.Tab />}
/>;
```

Since the [`Tab`](/reference/tab) component is registered with the tab store, pressing <kbd>←</kbd> and <kbd>→</kbd> will continue to navigate between tabs when the selected tab is in focus.

## Rendering a single `TabPanel`

Typically, we have one [`TabPanel`](/reference/tab-panel) for each [`Tab`](/reference/tab) component. But in this case, we want to render only one panel that contains the list of options for the selected tab. This ensures optimal React concurrent transitions and that [`ComboboxItem`](/reference/combobox-item) components are rendered only when necessary.

To render a single [`TabPanel`](/reference/tab-panel), we need to set its [`tabId`](/reference/tab-panel#tabid) prop to the [`selectedId`](/reference/use-tab-store#selectedid) state:

```jsx
const selectedId = tab.useState("selectedId");

<Ariakit.TabPanel tabId={selectedId}>
```

This ensures that the tab panel is always visible, and the `aria-controls` and `aria-labelledby` attributes are correctly assigned.

## Allowing horizontal arrow keys to navigate tabs

We permit users to navigate between tabs using <kbd>←</kbd> and <kbd>→</kbd> on the [`ComboboxItem`](/reference/combobox-item) component, even when it's not displayed as a [`Tab`](/reference/tab). To accomplish this, we must write a custom `onKeyDown` handler and use methods from the [tab store](/reference/use-tab-store):

```jsx "setActiveId" "select" "next"
const tab = Ariakit.useTabContext();

<Ariakit.ComboboxItem
  onKeyDown={(event) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      const { selectedId } = tab.getState();
      tab.setActiveId(selectedId);
      tab.select(tab.next());
    }
  }}
/>;
```

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

- [](/examples/combobox-filtering)
- [](/examples/combobox-filtering-integrated)
- [](/examples/combobox-group)
- [](/examples/combobox-links)
- [](/examples/combobox-cancel)
- [](/examples/combobox-disclosure)

</div>
