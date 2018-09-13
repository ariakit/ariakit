> There's nothing more reliable than a `<div>`.

Except [containers](state-containers.md), all components exported by Reakit follow the [Single Element Pattern](https://medium.freecodecamp.org/introducing-the-single-element-pattern-dfbd2c295c5d), which makes them resemble native HTML elements.

## Render only one element

Every component is a single HTML element. Even the ones that are composed by others, like [Popover](../packages/reakit/src/Popover/Popover.md) and [PopoverArrow](../packages/reakit/src/Popover/PopoverArrow.md), are exported separately so you have full control over them.

Switch to `HTML` tab on the code block below to see the generated markup.
```jsx
import { Popover } from "reakit";

<Popover visible relative transform="none">
  <Popover.Arrow />
  Popover
</Popover>
```

## Never break the app

Even if you don't pass a required prop, Reakit components will be rendered without critical errors. You'll just see a warning on the browser's console:

> Warning: Failed prop type: The prop `hide` is marked as required in `HiddenHide`, but its value is `undefined`.

```jsx
import { Popover } from "reakit";

<Popover.Hide>Hide</Popover.Hide>
```

## Render all HTML attributes passed as props

Switch to `HTML` tab to see the generated markup.

```jsx
import { Input } from "reakit";

<Input 
  name="password"
  type="password" 
  placeholder="Password" 
  aria-label="Password" 
/>
```

## Always merge the styles passed as props

You can pass `style` and `className` props to change the style of Reakit components. Your styles will be merged into the internal style. Learn more on the [Styling](styling.md) section.

```jsx
import { Button } from "reakit";

<Button style={{ backgroundColor: "palevioletred", color: "white" }}>
  Button
</Button>
```

## Add all the event handlers passed as props

No matter whether a component has already implemented an event handler internally, yours will always be called. [PopoverToggle](../packages/reakit/src/Popover/PopoverToggle.md), for example, calls a `toggle` prop (passed as `{...popover}` in the example below) on the `click` event. But you can also pass another `onClick` prop. Both will be triggered.

```jsx
import { Popover, InlineBlock, Button } from "reakit";

<Popover.Container>
  {popover => (
    <InlineBlock relative>
      <Popover.Toggle as={Button} {...popover} onClick={alert}>
        Toggle
      </Popover.Toggle>
      <Popover {...popover}>Popover</Popover>
    </InlineBlock>
  )}
</Popover.Container>
```
