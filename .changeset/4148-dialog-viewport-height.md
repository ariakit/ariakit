---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Full height dialogs and on-screen virtual keyboards

A new [`--dialog-viewport-height`](https://ariakit.org/guide/styling#--dialog-viewport-height) CSS variable has been added to the [Dialog](https://ariakit.org/components/dialog) component. This variable exposes the height of the visual viewport, considering the space taken by virtual keyboards on mobile devices. Use this CSS variable when you have input fields in your dialog to ensure it always fits within the visual viewport:

```css
.dialog {
  max-height: var(--dialog-viewport-height, 100dvh);
}
```
