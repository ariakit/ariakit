---
path: /docs/rover
---

# Rover

## Usage

```jsx
import { useRoverState, Rover } from "reakit";

function Example() {
  const roving = useRoverState({ currentId: "test" });
  return (
    <>
      <Rover {...roving}>Item 1</Rover>
      <Rover {...roving} disabled>
        Item 2
      </Rover>
      <Rover stopId="test" disabled {...roving}>
        Item 3
      </Rover>
      <Rover {...roving} disabled focusable>
        Item 4
      </Rover>
      <Rover {...roving}>Item 5</Rover>
    </>
  );
}
```

```jsx
import React from "react";
import { useRoverState, Rover } from "reakit";

function Example() {
  const roving = useRoverState({ currentId: "test" });
  const [visible, setVisible] = React.useState(false);
  return (
    <>
      <button onClick={() => setVisible(!visible)}>Toggle visible</button>
      <Rover {...roving}>Item 1</Rover>
      <Rover {...roving} disabled>
        Item 2
      </Rover>
      <Rover stopId="test" disabled {...roving}>
        Item 3
      </Rover>
      {visible && <Rover {...roving}>Item 3.5</Rover>}
      <Rover {...roving} disabled focusable>
        Item 4
      </Rover>
      <Rover {...roving}>Item 5</Rover>
    </>
  );
}
```

## Props

<!-- Automatically generated -->

### `useRoverState`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>orientation</code>&nbsp;</strong> | <code title="&#34;horizontal&#34; &#124; &#34;vertical&#34; &#124; undefined">&#34;horizontal&#34;&nbsp;&#124;&nbsp;&#34;vertical&#34;&nbsp;&#124;...</code> | Defines the orientation of the rover list. |
| <strong><code>currentId</code>&nbsp;</strong> | <code>string&nbsp;&#124;&nbsp;null</code> | The current focused element ID. |
| <strong><code>loop</code>&nbsp;</strong> | <code>boolean</code> | If enabled, the next item after the last one will be the first one. |

### `Rover`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>disabled</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | Same as the HTML attribute. |
| <strong><code>focusable</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | When an element is `disabled`, it may still be `focusable`. In this case, only `aria-disabled` will be set. |
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
