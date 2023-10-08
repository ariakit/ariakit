---
tags:
  - Dialog
  - Button
  - Focusable
  - VisuallyHidden
---

# Warning on Dialog hide

<div data-description>

Preventing users from accidentally closing a [`modal`](/reference/dialog#modal) [Dialog](/components/dialog) component with unsaved changes by displaying a nested confirmation dialog.

</div>

<div data-tags></div>

<a href="./index.tsx" data-playground>Example</a>

## Components

<div data-cards="components">

- [](/components/dialog)
- [](/components/button)
- [](/components/focusable)
- [](/components/visually-hidden)

</div>

## Preventing Dialog from closing

By passing the [`open`](/reference/dialog#open) and [`onClose`](/reference/dialog#onclose) props to the [`Dialog`](/reference/dialog) component, we can control exactly when the dialog is open and closed.

When there are unsaved changes, instead of setting our `open` state within the [`onClose`](/reference/dialog#onclose) callback, we just open the nested warning dialog and prevent the default close behavior:

```jsx {7,8,10}
const [open, setOpen] = useState(false);

<Dialog
  open={open}
  onClose={(event) => {
    if (hasUnsavedChanges) {
      event.preventDefault();
      setWarningOpen(true);
    } else {
      setOpen(false);
    }
  }}
>
```

Within the warning dialog, the parent dialog can be closed when the user clicks on the [`DialogDismiss`](/reference/dialog-dismiss) component. This component will automatically hide its own dialog, namely the warning dialog, but we need to manually set the `open` state of the parent dialog:

```jsx {2-5}
<DialogDismiss
  onClick={() => {
    saveChanges();
    setOpen(false);
  }}
>
  Save
</DialogDismiss>
```

## Auto focus

The [Dialog](/components/dialog) component will automatically focus on the first tabbable element when it's open. This element, known as the "initial focus", can be managed either by the [`initialFocus`](/reference/dialog#initialfocus) prop on the [`Dialog`](/reference/dialog) component or the [`autoFocus`](/reference/focusable#autofocus) prop on a component that uses [`Focusable`](/reference/focusable). Essentially, every Ariakit component that can receive focus can use this feature.

In this example, we use a [Focusable](/components/focusable) component to render the textarea element, allowing us to pass the [`autoFocus`](/reference/focusable#autofocus) prop to it:

```jsx
<Focusable autoFocus render={<textarea />} />
```

## Re-triggering auto focus

We can re-trigger the auto focus behavior on the [Dialog](/components/dialog) component even when it's already open by toggling the [`autoFocusOnShow`](/reference/dialog#autofocusonshow) prop. In this example, we toggle the prop whenever the nested dialog closes, so the focus is always moved back to the input field:

```jsx
<Dialog autoFocusOnShow={!warningOpen}>
```

## Related examples

<div data-cards="examples">

- [](/examples/dialog-nested)
- [](/examples/dialog-animated)
- [](/examples/dialog-menu)
- [](/examples/dialog-backdrop-scrollable)
- [](/examples/dialog-next-router)
- [](/examples/combobox-textarea)

</div>
