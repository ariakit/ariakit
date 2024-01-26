---
tags:
  - Dialog
  - Button
  - VisuallyHidden
---

# Nested Dialog

<div data-description>

Rendering a [`modal`](/reference/dialog#modal) [Dialog](/components/dialog) to confirm an action inside another modal dialog using React.

</div>

<div data-tags></div>

<a href="./index.tsx" data-playground>Example</a>

## Components

<div data-cards="components">

- [](/components/dialog)
- [](/components/button)
- [](/components/visually-hidden)

</div>

## Identifying nested dialogs

There are three ways Ariakit can identify nested dialogs:

1. They are nested in the React tree.

   ```jsx
   <Dialog>
     <Dialog />
   </Dialog>
   ```

2. They are appended to the body element after the parent dialog is opened.

   ```jsx
   <Dialog />
   <Dialog unmountOnHide />
   ```

3. They are referenced in the [`getPersistentElements`](/reference/dialog#getpersistentelements) prop of the parent dialog.

   ```jsx
   <Dialog getPersistentElements={() => document.querySelectorAll(".dialog")} />
   <Dialog className="dialog" />
   ```

In this example, we're using the second method. By passing the [`unmountOnHide`](/reference/dialog#unmountonhide) prop to the nested dialog, it's rendered only when the dialog is open. This is the same strategy used by the [Dialog](/components/dialog) module to support third-party dialogs and browser extensions that open popups, such as **1Password**, **Google Translate**, and **Grammarly**.

This applies to all components that use [Dialog](/components/dialog) under the hood, such as [Combobox](/components/combobox), [Hovercard](/components/hovercard), [Menu](/components/menu), [Popover](/components/popover), [Select](/components/select), and [Tooltip](/components/tooltip).

## Related examples

<div data-cards="examples">

- [](/examples/dialog-hide-warning)
- [](/examples/dialog-animated)
- [](/examples/dialog-backdrop-scrollable)
- [](/examples/dialog-menu)
- [](/examples/dialog-combobox-command-menu)
- [](/examples/menu-nested)
- [](/examples/menubar-navigation)

</div>
