---
path: /docs/checkbox
---

# Checkbox

`Checkbox` follows the [WAI-ARIA Checkbox Pattern](https://www.w3.org/TR/wai-aria-practices/#checkbox), which means you'll have a working dual or tri-state toggle button regardless of the type of the underlying element. By default, it renders the native `<input type="checkbox">`.

## Installation

```sh
npm install reakit
```

Learn more in [Get started](/docs/get-started).

## Usage

It receives the same props as [controlled inputs](https://reactjs.org/docs/forms.html), such as `checked` and `onChange`:

```jsx
import React from "react";
import { Checkbox } from "reakit/Checkbox";

function Example() {
  const [checked, setChecked] = React.useState(false);
  const toggle = () => setChecked(!checked);
  return <Checkbox checked={checked} onChange={toggle} />;
}
```

### `useCheckboxState`

For convenience, Reakit provides a `useCheckboxState` that already implements the state logic:

```jsx
import { useCheckboxState, Checkbox } from "reakit/Checkbox";

function Example() {
  const checkbox = useCheckboxState({ currentValue: true });
  return <Checkbox {...checkbox} />;
}
```

### `indeterminate` state

You can programmatically set checkbox value as `indeterminate`:

```jsx
import React from "react";
import { Checkbox, useCheckboxState } from "reakit/Checkbox";

function useTreeState({ values }) {
  const group = useCheckboxState();
  const items = useCheckboxState();

  // updates items when group is toggled
  React.useEffect(() => {
    if (group.currentValue === true) {
      items.setValue(values);
    } else if (group.currentValue === false) {
      items.setValue([]);
    }
  }, [group.currentValue]);

  // updates group when items is toggled
  React.useEffect(() => {
    if (items.currentValue.length === values.length) {
      group.setValue(true);
    } else if (items.currentValue.length) {
      group.setValue("indeterminate");
    } else {
      group.setValue(false);
    }
  }, [items.currentValue]);

  return { group, items };
}

function Example() {
  const values = ["Apple", "Orange", "Watermelon"];
  const { group, items } = useTreeState({ values });
  return (
    <ul>
      <li>
        <label>
          <Checkbox {...group} /> Fruits
        </label>
      </li>
      <ul>
        {values.map((value, i) => (
          <li key={i}>
            <label>
              <Checkbox {...items} value={value} /> {value}
            </label>
          </li>
        ))}
      </ul>
    </ul>
  );
}
```

### `as` prop

You can render the checkbox as any element. Reakit will add the props and interactions necessary for accessibility. You may need to add some styling though. You can use selectors like `[aria-checked]` for doing so.

```jsx
import { useCheckboxState, Checkbox } from "reakit/Checkbox";

function Example() {
  const checkbox = useCheckboxState();
  return (
    <Checkbox {...checkbox} as="button">
      {checkbox.currentValue ? "Checked" : "Unchecked"}
    </Checkbox>
  );
}
```

## Accessibility

- `Checkbox` has role `checkbox`.
- When checked, `Checkbox` has `aria-checked` set to `true`.
- When not checked, `Checkbox` has `aria-checked` set to `false`.
- When partially checked, `Checkbox` has `aria-checked` set to `mixed`.

Learn more in [Accessibility](/docs/accessibility).

## Composition

- `Checkbox` uses [Tabbable](/docs/tabbable), and is used by [FormCheckbox](/docs/form) and [MenuItemCheckbox](/docs/menu).

Learn more in [Composition](/docs/composition#props-hooks).

## Props

<!-- Automatically generated -->

### `useCheckboxState`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>currentValue</code>&nbsp;</strong> | <code title="boolean &#124; any[] &#124; &#34;indeterminate&#34;">boolean&nbsp;&#124;&nbsp;any[]&nbsp;&#124;&nbsp;&#34;indeterm...</code> | Stores the state of the checkbox. If checkboxes that share this state have defined a `value` prop, it's going to be an array. |

### `Checkbox`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>disabled</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | Same as the HTML attribute. |
| <strong><code>focusable</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | When an element is `disabled`, it may still be `focusable`. It works similarly to `readOnly` on form elements. In this case, only `aria-disabled` will be set. |
| <strong><code>currentValue</code>&nbsp;</strong> | <code title="boolean &#124; any[] &#124; &#34;indeterminate&#34;">boolean&nbsp;&#124;&nbsp;any[]&nbsp;&#124;&nbsp;&#34;indeterm...</code> | Stores the state of the checkbox. If checkboxes that share this state have defined a `value` prop, it's going to be an array. |
| <strong><code>setValue</code>&nbsp;</strong> | <code title="(value: SetStateAction&#60;boolean &#124; any[] &#124; &#34;indeterminate&#34;&#62;) =&#62; void">(value:&nbsp;SetStateAction&#60;bool...</code> | Sets `currentValue`. |
| <strong><code>value</code>&nbsp;</strong> | <code>any</code> | Checkbox's value is going to be used when multiple checkboxes share the same state. Checking a checkbox with value will add it to the state array. |
| <strong><code>checked</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | Checkbox's checked state. If present, it's used instead of currentValue. |
