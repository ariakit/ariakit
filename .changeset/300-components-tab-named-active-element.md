---
"@ariakit/components": patch
---

Fixed the tab store leaving DOM focus on the previously selected tab when the selected tab changes while a tab holds focus and the document contains a form named `activeElement`.
