---
path: /docs/radio
---

# Radio

## Usage

```jsx
import { Radio, RadioGroup, useRadioState } from "reakit";

function Example() {
  const radio = useRadioState();
  return (
    <RadioGroup aria-label="fruits" {...radio}>
      <label>
        <Radio {...radio} value="apple" /> apple
      </label>
      <label>
        <Radio {...radio} value="orange" /> orange
      </label>
      <label>
        <Radio {...radio} value="watermelon" /> watermelon
      </label>
    </RadioGroup>
  );
}
```

## Props

<!-- Automatically generated -->

### `useRadioState`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>orientation</code>&nbsp;</strong> | <code title="&#34;horizontal&#34; &#124; &#34;vertical&#34; &#124; undefined">&#34;horizontal&#34;&nbsp;&#124;&nbsp;&#34;vertical&#34;&nbsp;&#124;...</code> | Defines the orientation of the rover list. |
| <strong><code>currentId</code>&nbsp;</strong> | <code>string&nbsp;&#124;&nbsp;null</code> | The current focused element ID. |
| <strong><code>loop</code>&nbsp;</strong> | <code>boolean</code> | If enabled, the next item after the last one will be the first one. |
| <strong><code>currentValue</code>&nbsp;</strong> | <code>any</code> | The `value` attribute of the current checked radio. |

### `Radio`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>disabled</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | Same as the HTML attribute. |
| <strong><code>focusable</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | When an element is `disabled`, it may still be `focusable`. It works similarly to `readOnly` on form elements. In this case, only `aria-disabled` will be set. |
| <strong><code>orientation</code>&nbsp;</strong> | <code title="&#34;horizontal&#34; &#124; &#34;vertical&#34; &#124; undefined">&#34;horizontal&#34;&nbsp;&#124;&nbsp;&#34;vertical&#34;&nbsp;&#124;...</code> | Defines the orientation of the rover list. |
| <strong><code>currentId</code>&nbsp;</strong> | <code>string&nbsp;&#124;&nbsp;null</code> | The current focused element ID. |
| <strong><code>stops</code>&nbsp;</strong> | <code>Stop[]</code> | A list of element refs and IDs of the roving items. |
| <strong><code>register</code>&nbsp;</strong> | <code title="(id: string, ref: RefObject&#60;HTMLElement&#62;) =&#62; void">(id:&nbsp;string,&nbsp;ref:&nbsp;RefObject...</code> | Registers the element ID and ref in the roving tab index list. |
| <strong><code>unregister</code>&nbsp;</strong> | <code>(id:&nbsp;string)&nbsp;=&#62;&nbsp;void</code> | Unregisters the roving item. |
| <strong><code>move</code>&nbsp;</strong> | <code>(id:&nbsp;string&nbsp;&#124;&nbsp;null)&nbsp;=&#62;&nbsp;void</code> | Moves focus onto a given element ID. |
| <strong><code>next</code>&nbsp;</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Moves focus onto the next element. |
| <strong><code>previous</code>&nbsp;</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Moves focus onto the previous element. |
| <strong><code>first</code>&nbsp;</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Moves focus onto the first element. |
| <strong><code>last</code>&nbsp;</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Moves focus onto the last element. |
| <strong><code>stopId</code>&nbsp;</strong> | <code>string&nbsp;&#124;&nbsp;undefined</code> | Element ID. |
| <strong><code>currentValue</code>&nbsp;</strong> | <code>any</code> | The `value` attribute of the current checked radio. |
| <strong><code>setValue</code>&nbsp;</strong> | <code>(value:&nbsp;any)&nbsp;=&#62;&nbsp;void</code> | Changes the `currentValue` state. |
| <strong><code>value</code>&nbsp;</strong> | <code>any</code> | Same as the `value` attribute. |
| <strong><code>checked</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | Same as the `checked` attribute. |

### `RadioGroup`

No props to show
