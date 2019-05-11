---
path: /docs/composition/
redirect_from:
  - /guide/composition/
---

# Composition

Reakit has been built with composition in mind. In fact, its own components are composed by a few other abstract ones, like [Box](/docs/box/), [Tabbable](/docs/tabbable/) and [Rover](/docs/rover/).

The API isn't different. It's designed so you can create new things based on any existing module.

<carbon-ad></carbon-ad>

## `as` prop

The primary way to compose components is through the `as` prop. If you want to change the underlying element of a Reakit component or combine it with another component, this is the way to go.

```jsx
import { useCheckboxState, Checkbox, Button } from "reakit";

function Example() {
  const checkbox = useCheckboxState();
  return (
    <Checkbox {...checkbox} as={Button}>
      {checkbox.state ? "😄 Happy" : "😞 Sad"}
    </Checkbox>
  );
}
```

The topmost component (in the case above, [Checkbox](/docs/checkbox/)) will take precedence if there's any conflict between props.

## Render props

Alternatively, you can pass children as a function (also known as [render props](https://reactjs.org/docs/render-props.html)). All Reakit components support this technique. Compared to the `as` prop, it has the disadvantage of adding more nesting into the code. On the other hand, you have more control over the components and props added.

```jsx
import { useCheckboxState, Checkbox, Button } from "reakit";

function Example() {
  const checkbox = useCheckboxState();
  return (
    <Button {...checkbox}>
      {props => (
        <Checkbox {...props} as="div">
          {checkbox.state ? "😄 Happy" : "😞 Sad"}
        </Checkbox>
      )}
    </Button>
  );
}
```

## Props hooks

You can leverage the **low level API** provided by props hooks to compose multiple Reakit components. This is what Reakit does underneath.

Props hooks receive two arguments: `options` and `htmlProps`; and return new `htmlProps`. This means that you can pass the return value of a props hook to the second argument of another one.

Props will be merged automatically. If there's any conflict between props, the topmost hook (in the case below, `useButton`) will take precedence.

```jsx
import { useCheckboxState, useCheckbox, useButton } from "reakit";

function Example() {
  const options = useCheckboxState();
  // Composing Checkbox and Button together
  const htmlProps = useCheckbox(options, useButton());
  return (
    <button {...htmlProps}>{options.state ? "😄 Happy" : "😞 Sad"}</button>
  );
}
```

## State hooks

State hooks are composable as well. For example, [`useTabState`](/docs/tab/) uses [`useRoverState`](/docs/rover/) underneath. You can take advantage of the same approach to create new fancy state hooks.

```jsx
import React from "react";
import { useHiddenState, Hidden, HiddenDisclosure } from "reakit";

function useDelayedHiddenState({ delay, ...initialState } = {}) {
  const hidden = useHiddenState(initialState);
  const [transitioning, setTransitioning] = React.useState(false);
  return {
    ...hidden,
    transitioning,
    toggle: () => {
      setTransitioning(true);
      setTimeout(() => {
        hidden.toggle();
        setTransitioning(false);
      }, delay);
    }
  };
}

function Example() {
  const { transitioning, ...hidden } = useDelayedHiddenState({ delay: 500 });
  return (
    <>
      <HiddenDisclosure {...hidden}>
        {transitioning
          ? "Please wait..."
          : hidden.visible
          ? "Hide with delay"
          : "Show with delay"}
      </HiddenDisclosure>
      <Hidden {...hidden}>Hidden</Hidden>
    </>
  );
}
```

Learn more in [Managing state](/docs/managing-state/).
