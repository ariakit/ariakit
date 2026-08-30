---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Modal popups no longer skip their fallback dismiss button

A modal [`Dialog`](https://ariakit.com/reference/dialog) with no dismiss control of its own renders a visually hidden fallback dismiss button, so that assistive technology users who can't press Escape or click outside aren't trapped in it. It used to accept any dismiss button in its subtree, including one belonging to a popup nested inside it.

A nested [`Popover`](https://ariakit.com/reference/popover) renders inline inside the dialog and stays rendered while it's closed, so its [`PopoverDismiss`](https://ariakit.com/reference/popover-dismiss) was enough to suppress the fallback even when the user never opened that popover, leaving those users with no way out. The same applied to every modal popup built on [`Dialog`](https://ariakit.com/reference/dialog), including [`SelectPopover`](https://ariakit.com/reference/select-popover) and [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover) with `modal`, and a modal [`Menu`](https://ariakit.com/reference/menu) whose submenu renders a [`MenuDismiss`](https://ariakit.com/reference/menu-dismiss). Only a dismiss button the popup renders itself counts now.

```tsx
<Ariakit.Dialog>
  <Ariakit.DialogHeading>Compose</Ariakit.DialogHeading>
  <Ariakit.PopoverProvider>
    <Ariakit.PopoverDisclosure>Formatting</Ariakit.PopoverDisclosure>
    <Ariakit.Popover>
      {/* Closes the popover, so the dialog still gets its fallback. */}
      <Ariakit.PopoverDismiss>Close formatting</Ariakit.PopoverDismiss>
    </Ariakit.Popover>
  </Ariakit.PopoverProvider>
</Ariakit.Dialog>
```

The decision is now also kept up to date while the popup stays open. A [`DialogDismiss`](https://ariakit.com/reference/dialog-dismiss) that mounts or unmounts after the dialog opened used to leave the fallback as it was, so a dialog that renders its dismiss control conditionally could end up with two dismiss controls, or with none.
