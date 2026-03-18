---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Fixed `FormRadio` registering to ancestor composite stores

[`FormRadio`](https://ariakit.org/reference/form-radio) items nested inside components like [`TabPanel`](https://ariakit.org/reference/tab-panel) were incorrectly registering to the tab store, causing arrow keys in the tab list to navigate to radio items instead of other tabs. [`FormRadioGroup`](https://ariakit.org/reference/form-radio-group) now resets the composite context for its children, preventing form radio items from being picked up by unrelated parent stores.
