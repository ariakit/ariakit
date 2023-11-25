---
tags:
  - Combobox
  - Concurrent React
  - Search
  - Dropdowns
  - Form controls
---

# Combobox with links

<div data-description>

Using a [Combobox](/components/combobox) with items rendered as links that can be clicked with keyboard and mouse. This is useful for creating an accessible page search input in React.

</div>

<div data-tags></div>

<a href="./index.tsx" data-playground>Example</a>

## Components

<div data-cards="components">

- [](/components/combobox)

</div>

## Rendering a link

The [`ComboboxItem`](/reference/combobox-item) component can be rendered as a link using the [`render`](/apis/combobox-item#render) prop:

```jsx "render"
<ComboboxItem
  {...specificComboboxItemProps}
  render={<a {...specificAnchorProps} />}
/>
```

You can learn more about this pattern on the [Composition](/guide/composition) guide.

## Link features

When rendered as a link, [`ComboboxItem`](/reference/combobox-item) supports all native link behaviors, including:

- Open in a new tab in the background: <span class="whitespace-nowrap"><kbd>⌘</kbd> <kbd>Enter</kbd></span>
- Open in a new tab and switch to the tab: <span class="whitespace-nowrap"><kbd>⌘</kbd> <kbd>Shift</kbd> <kbd>Enter</kbd></span>
- Open in new window: <span class="whitespace-nowrap"><kbd>Shift</kbd> <kbd>Enter</kbd></span>
- Download: <span class="whitespace-nowrap"><kbd>Alt</kbd> <kbd>Enter</kbd></span>

<aside data-type="note" title="Hide on click">

To provide a better user experience, when opening the link in a new tab, the [`ComboboxPopover`](/reference/combobox-popover) will remain open, even if the [`hideOnClick`](/reference/combobox-item#hideonclick) prop is explicitly set to `true`.

</aside>

## Related examples

<div data-cards="examples">

- [](/examples/combobox-filtering)
- [](/examples/combobox-filtering-integrated)
- [](/examples/combobox-animated)
- [](/examples/combobox-group)
- [](/examples/combobox-cancel)
- [](/examples/combobox-disclosure)

</div>
