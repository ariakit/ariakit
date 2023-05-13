---
"@ariakit/react-core": minor
"@ariakit/react": minor
---

**BREAKING**: The backdrop element on the `Dialog` component is now rendered as a sibling rather than as a parent of the dialog. This should make it easier to animate them separately. ([#2407](https://github.com/ariakit/ariakit/pull/2407))

This might be a breaking change if you're relying on their parent/child relationship for styling purposes (for example, to position the dialog in the center of the backdrop). If that's the case,
you can apply the following styles to the dialog to achieve the same effect:

```css
.dialog {
  position: fixed;
  inset: 1rem;
  margin: auto;
  height: fit-content;
  max-height: calc(100vh - 2 * 1rem);
}
```

These styles work even if the dialog is a child of the backdrop, so you can use them regardless of whether you're upgrading to this version or not.
