---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed modal [`Dialog`](https://ariakit.com/reference/dialog), and every component built on it such as [`Menu`](https://ariakit.com/reference/menu), skipping the fallback dismiss button when a popup nested inside it renders a dismiss button of its own, and not updating the fallback when a [`DialogDismiss`](https://ariakit.com/reference/dialog-dismiss) mounts or unmounts while the dialog stays open.
