---
tags:
  - Combobox
  - Dropdowns
  - Form controls
  - Radix UI
---

# Radix Combobox

<div data-description>

Using just the necessary Ariakit components to build a [Combobox](/components/combobox) with [Radix UI](https://radix-ui.com). For projects already using Radix UI and looking for autocomplete, autosuggest and search features.

</div>

<div data-tags></div>

<aside data-type="note" title="Additional Combobox features">

If you're searching for extra features such as filtering, multiple selections, and more, take a look at other examples:

<div data-cards>

- [](/examples/combobox-filtering)
- [](/examples/combobox-multiple)
- [](/examples/menu-combobox)
- [](/examples/select-combobox)

</div>

</aside>

## Live example

<a href="./index.tsx" data-playground>Example</a>

## Components

Explore the Ariakit components used in this example:

<div data-cards="components">

- [](/components/combobox)

</div>

## Basic structure

```jsx "ComboboxProvider" "Combobox" "ComboboxList" "ComboboxItem"
<RadixPopover.Root>
  <ComboboxProvider>
    <RadixPopover.Anchor asChild>
      <Combobox />
    </RadixPopover.Anchor>
    <RadixPopover.Content asChild>
      <ComboboxList>
        <ComboboxItem />
      </ComboboxList>
    </RadixPopover.Content>
  </ComboboxProvider>
</RadixPopover.Root>
```

## Sharing state between Ariakit and Radix UI

We can share state between Ariakit and Radix UI by passing our own `open` state to both Radix's `Root` and Ariakit's [`ComboboxProvider`](/reference/combobox-provider):

```jsx
const [open, setOpen] = useState(false);

<RadixPopover.Root open={open} onOpenChange={setOpen}>
  <ComboboxProvider open={open} setOpen={setOpen}>
```

You can learn more about this Ariakit feature in the guide:

<div data-cards>

- [](/guide/component-providers)

</div>

## Composing `PopoverContent` with `ComboboxList`

Rather than using the [`ComboboxPopover`](/reference/combobox-popover) component from Ariakit, we can use the Radix `PopoverContent` in conjunction with the Ariakit [`ComboboxList`](/reference/combobox-list) component, which doesn't bundle popover features.

Here are a few things to keep in mind when assembling these components:

1. A combobox typically doesn't auto-focus when it opens, so we need to stop the Radix `onOpenAutoFocus` event from performing its default behavior:

   ```jsx
   <RadixPopover.Content
     onOpenAutoFocus={(event) => event.preventDefault()}
   >
   ```

2. We need to stop Radix from closing the popover when interacting with the [`Combobox`](/reference/combobox) or any component within [`ComboboxList`](/reference/combobox-list):

   ```jsx
   <RadixPopover.Content
     onInteractOutside={(event) => {
       const isCombobox = comboboxElement === event.target;
       const inListbox = listboxElement?.contains(event.target);
       if (isCombobox || inListbox) {
         event.preventDefault();
       }
     }}
   >
   ```

3. Finally, we must explicitly set `role="listbox"` on the [`ComboboxList`](/reference/combobox-list) component, otherwise Radix will overwrite it with `role="dialog"`.

## More examples

<div data-cards="examples">

- [](/examples/combobox-radix-select)
- [](/examples/dialog-radix)
- [](/examples/combobox-group)
- [](/examples/combobox-links)
- [](/examples/combobox-disclosure)
- [](/examples/combobox-cancel)
- [](/examples/combobox-tabs)
- [](/examples/dialog-combobox-command-menu)

</div>
