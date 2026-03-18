---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Fixed [`FormRadio`](https://ariakit.org/reference/form-radio) items incorrectly registering to ancestor composite stores when nested inside components like [`TabPanel`](https://ariakit.org/reference/tab-panel). This caused arrow keys in the tab list to navigate to radio items instead of other tabs.

[`FormRadioGroup`](https://ariakit.org/reference/form-radio-group) now resets the composite context for its children, preventing form radio items from being picked up by unrelated parent stores.
