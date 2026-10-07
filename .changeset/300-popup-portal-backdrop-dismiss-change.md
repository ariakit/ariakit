---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Popup interactions after element, portal, and backdrop changes

This update fixes several interactions when an open [`Dialog`](https://ariakit.com/reference/dialog) or [`Popover`](https://ariakit.com/reference/popover) changes its element, portal, backdrop, or dismiss button:

- **Escape closes the last popup first.** A non-modal [`Dialog`](https://ariakit.com/reference/dialog) that moves to a new portal node no longer closes before a popup that opened after it. The same applies to a non-modal [`Popover`](https://ariakit.com/reference/popover) that moves out of a portal.

- **Modal popups disable the earlier popup.** A modal popup now disables an earlier non-modal [`Dialog`](https://ariakit.com/reference/dialog) after that dialog moves to a new portal node. It also disables an earlier non-modal [`Popover`](https://ariakit.com/reference/popover) that moves out of a portal and renders next to it.

- **Later modal dialogs stay usable.** Changing an earlier modal [`Dialog`](https://ariakit.com/reference/dialog)'s [`portal`](https://ariakit.com/reference/dialog#portal) or [`portalElement`](https://ariakit.com/reference/dialog#portalelement) no longer disables a modal dialog that opened after it. Before, both dialogs could become unreachable by pointer and keyboard.

- **New or moved backdrops respond to later popups.** When a non-modal [`Dialog`](https://ariakit.com/reference/dialog) moves out of a portal or gains a [`backdrop`](https://ariakit.com/reference/dialog#backdrop), clicking the backdrop now also closes popups that opened after the dialog. A later modal popup that renders next to the backdrop disables it.

- **Replacement backdrops keep their behavior.** When a non-modal [`Dialog`](https://ariakit.com/reference/dialog)'s [`backdrop`](https://ariakit.com/reference/dialog#backdrop) changes to another element type, the new backdrop closes the dialog on click and gets its `z-index`.

- **Hidden dismiss buttons stay disabled behind later modal popups.** This now works when a modal [`Dialog`](https://ariakit.com/reference/dialog) without a [`DialogDismiss`](https://ariakit.com/reference/dialog-dismiss) moves out of a portal beside a later modal popup. It also works when the earlier dialog loses its [`DialogDismiss`](https://ariakit.com/reference/dialog-dismiss) while a later modal popup is open. Assistive technology can no longer reach the earlier dialog's hidden dismiss button in these cases.

- **Focus on new page elements keeps the dialog open.** A [`Dialog`](https://ariakit.com/reference/dialog) that has received focus no longer closes when focus moves to an element added after it opened, such as a toast, even after its element type changes through [`render`](https://ariakit.com/reference/dialog#render).

For example, typing a discount below changes the invoice's [`portal`](https://ariakit.com/reference/dialog#portal) prop while both dialogs are open. The discount dialog now stays usable:

```tsx
const [value, setValue] = useState("");
const [discountOpen, setDiscountOpen] = useState(false);

<>
  <Dialog open portal={!value} aria-label="Invoice">
    <button onClick={() => setDiscountOpen(true)}>Add discount</button>
  </Dialog>
  {discountOpen && (
    <Dialog open onClose={() => setDiscountOpen(false)} aria-label="Discount">
      <input
        aria-label="Discount amount"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
    </Dialog>
  )}
</>;
```

These changes apply to all components built on [`Dialog`](https://ariakit.com/reference/dialog), including [`Popover`](https://ariakit.com/reference/popover), [`Hovercard`](https://ariakit.com/reference/hovercard), [`Menu`](https://ariakit.com/reference/menu), [`Tooltip`](https://ariakit.com/reference/tooltip), [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover), and [`SelectPopover`](https://ariakit.com/reference/select-popover).
