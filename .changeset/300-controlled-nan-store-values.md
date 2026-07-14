---
"@ariakit/react-store": patch
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed controlled `NaN` values from unnecessarily firing setter callbacks in React stores, including [`useCheckboxStore`](https://ariakit.com/reference/use-checkbox-store) and [`useRadioStore`](https://ariakit.com/reference/use-radio-store).
