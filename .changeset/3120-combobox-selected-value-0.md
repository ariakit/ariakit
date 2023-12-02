---
"@ariakit/core": patch
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Multi-selectable Combobox

We've added support for the [Combobox](https://ariakit.org/components/combobox) with multiple selection capabilities using a new [`selectedValue`](https://ariakit.org/reference/combobox-provider#selectedvalue) prop, along with [`defaultSelectedValue`](https://ariakit.org/reference/combobox-provider#defaultselectedvalue) and [`setSelectedValue`](https://ariakit.org/reference/combobox-provider#setselectedvalue).

This works similarly to the [`value`](https://ariakit.org/reference/select-provider#value) prop on [Select](https://ariakit.org/components/select) components. If it receives an array, the combobox will allow multiple selections. By default, it's a string that represents the selected value in a single-select combobox.

Check out the [Multi-selectable Combobox](https://ariakit.org/examples/combobox-multiple) example to see it in action.
