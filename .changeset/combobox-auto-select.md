---
"ariakit": minor
---

Improved `Combobox` with `autoSelect` behavior. ([#1821](https://github.com/ariakit/ariakit/pull/1821))

Before, when `autoSelect` was enabled, the first item would be selected only on text insertion. That is, deleting or pasting text was ignored. Now, the first item is selected on any change to the input value, including programmatic changes.
