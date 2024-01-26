---
tags:
  - New
  - Dialog
  - Combobox
  - Button
  - Animated
  - CSS transitions
  - Concurrent React
  - Search
  - Abstracted examples
---

# Command Menu

<div data-description>

Combining [Dialog](/components/dialog) and [Combobox](/components/combobox) to enable users to search a command list in a [Raycast](https://www.raycast.com/)-style modal.

</div>

<div data-tags></div>

<a href="./index.tsx" data-playground>Example</a>

## Components

<div data-cards="components">

- [](/components/dialog)
- [](/components/combobox)
- [](/components/button)

</div>

## Understanding the basic structure

This example creates a custom `CommandMenu` component with the following API structure:

```jsx
<CommandMenu>
  <CommandMenuInput />
  <CommandMenuList>
    <CommandMenuGroup>
      <CommandMenuItem />
    </CommandMenuGroup>
  </CommandMenuList>
</CommandMenu>
```

Under the hood, we render a set of [Dialog](/components/dialog) and [Combobox](/components/combobox) components structured as follows:

```jsx
<Dialog>
  <ComboboxProvider>
    <Combobox />
    <DialogDismiss />
    <ComboboxList>
      <ComboboxGroup>
        <ComboboxGroupLabel />
        <ComboboxItem />
      </ComboboxGroup>
    </ComboboxList>
  </ComboboxProvider>
</Dialog>
```

## Syncing the state between Dialog and Combobox

We need to synchronize the visibility state between the [Dialog](/components/dialog) and [Combobox](/components/combobox) components. This can be done by passing the dialog store, obtained from the [`useDialogStore`](/reference/use-dialog-store) hook, to the [`disclosure`](/reference/combobox-provider#disclosure) prop of the [`ComboboxProvider`](/reference/combobox-provider) component:

```jsx
const dialog = useDialogStore();

<Dialog store={dialog}>
  <ComboboxProvider disclosure={dialog}>
```

## Focusing on the first item by default

By default, the [Combobox](/components/combobox) component doesn't focus on the first option when the list opens. However, in this example, the combobox input and options are displayed simultaneously when the dialog appears. To improve usability, we focus on the first item immediately, allowing the user to choose the first suggestion with minimal effort.

To achieve this, we use the [`autoSelect`](/reference/combobox#autoselect) prop of the [`Combobox`](/reference/combobox) component, setting the value to `"always"`:

```jsx
<Combobox autoSelect="always" />
```

## Preventing items from losing focus

In this example, we've decided to maintain the highlight state on the currently active item, even if the user moves the mouse cursor away or interacts with the combobox input.

1. First, to ensure the active item doesn't lose focus when the user clicks or presses arrow keys to move focus to the combobox input, we set the [`includesBaseElement`](/reference/combobox-provider#includesbaseelement) state to `false` on the [`ComboboxProvider`](/reference/combobox-provider) component:

   ```jsx
   <ComboboxProvider includesBaseElement={false}>
   ```

2. Then, to avoid blurring the active item when the user moves the mouse cursor away, we set the [`blurOnHoverEnd`](/reference/combobox-item#bluronhoverend) prop of the [`ComboboxItem`](/reference/combobox-item) component to `false`. Coupled with [`focusOnHover`](/reference/combobox-item#focusonhover), this ensures the item stays focused when the user hovers over it and until they hover over another item:

   ```jsx
   <ComboboxItem focusOnHover blurOnHoverEnd={false} />
   ```

## Related examples

<div data-cards="examples">

- [](/examples/combobox-links)
- [](/examples/combobox-filtering)
- [](/examples/combobox-tabs)
- [](/examples/dialog-menu)
- [](/examples/dialog-nested)
- [](/examples/menu-combobox)
- [](/examples/select-combobox)

</div>
