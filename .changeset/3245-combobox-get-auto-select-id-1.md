---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Controlling the auto-select functionality of Combobox

The [`Combobox`](https://ariakit.org/reference/combobox) component now includes a new [`getAutoSelectId`](https://ariakit.org/reference/combobox#getautoselectid) prop. This allows you to specify the [`ComboboxItem`](https://ariakit.org/reference/combobox-item) that should be auto-selected if the [`autoSelect`](https://ariakit.org/reference/combobox#autoselect) prop is `true`.

By default, the first _enabled_ item is auto-selected. Now you can customize this behavior by returning the id of another item from [`getAutoSelectId`](https://ariakit.org/reference/combobox#getautoselectid):

```jsx
<Combobox
  autoSelect
  getAutoSelectId={(items) => {
    // Auto select the first enabled item with a value
    const item = items.find((item) => {
      if (item.disabled) return false;
      if (!item.value) return false;
      return true;
    });
    return item?.id;
  }}
/>
```
