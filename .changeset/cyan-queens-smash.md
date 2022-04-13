---
"ariakit": patch
---

Fix `useDisclosureState` (and derivative hooks, such as `useDialogState`, `useMenuState`, etc.) reading from a mutating ref on the render phase. ([#1224](https://github.com/ariakit/ariakit/pull/1224))
