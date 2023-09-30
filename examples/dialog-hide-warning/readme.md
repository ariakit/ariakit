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

## Preventing Dialog from hiding

The [Dialog](/components/dialog) component provides two callback props that are triggered when the dialog is about to hide: [`hideOnEscape`](/reference/dialog#hideonescape) and [`hideOnInteractOutside`](/reference/dialog#hideoninteractoutside). These props accept a `boolean` value or a function that takes an event object and returns a `boolean` value. If `false` is either passed to these props or returned from the function, the dialog won't close.

Moreover, we can keep the dialog from hiding by invoking `event.preventDefault()` on the [`DialogDismiss`](/reference/dialog-dismiss) click:

```jsx
function warnOnHide(event) {
  // OK to hide
  if (!value) return true;
  // Show warning and prevent hiding
  warning.show();
  event.preventDefault();
  return false;
}

<Dialog hideOnEscape={warnOnHide} hideOnInteractOutside={warnOnHide}>
  <DialogDismiss onClick={warnOnHide}>
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
- [](/examples/dialog-backdrop-scrollable)
- [](/examples/dialog-react-toastify)
- [](/examples/dialog-next-router)
- [](/examples/combobox-textarea)

</div>
