---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Improved the performance of [`modal`](https://ariakit.com/reference/dialog#modal) dialogs when a nested dialog opens or closes, which made a pointer sweep across the submenus of a modal menu about 4 times faster in a benchmark with 5,000 elements outside the menu. This applies to all components built on [`Dialog`](https://ariakit.com/reference/dialog), such as a [`modal`](https://ariakit.com/reference/menu#modal) [`Menu`](https://ariakit.com/reference/menu) with submenus. Thanks to [@jonastreub](https://github.com/jonastreub).
