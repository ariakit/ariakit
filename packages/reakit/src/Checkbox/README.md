---
path: /docs/checkbox
---

# Checkbox

## Usage

```jsx
import React from "react";
import { Checkbox } from "reakit";

function Example() {
  const [checked, setChecked] = React.useState(false);
  const toggle = () => setChecked(!checked);
  return <Checkbox checked={checked} onChange={toggle} />;
}
```

```jsx
import { Checkbox, useCheckboxState } from "reakit";

function Example() {
  const checkbox = useCheckboxState();
  return <Checkbox {...checkbox} />;
}
```

```jsx
import { Checkbox, useCheckboxState } from "reakit";

function Example() {
  const checkbox = useCheckboxState({ currentValue: ["apple"] });

  return (
    <div role="group">
      <Checkbox {...checkbox} value="apple" />
      <Checkbox
        {...checkbox}
        as="div"
        style={{ width: 20, height: 20, background: "red" }}
        value="orange"
      />
      <Checkbox {...checkbox} value="watermelon" />
    </div>
  );
}
```

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
