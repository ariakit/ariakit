`Hidden` is a highly generic yet powerful Reakit component. It simply hides itself away and waits for a `visible` prop to show up.

```jsx
import { Hidden } from "reakit";

<Hidden visible>Hidden</Hidden>
```

You can use [HiddenContainer](HiddenContainer.md) to control its state with ease, and combine it with [HiddenShow](HiddenShow.md), [HiddenHide](HiddenHide.md) and [HiddenToggle](HiddenToggle.md) to get event handlers, like `onClick`, out of the box.

> **Pro tip:**

> Unless you're doing something different with state, it's highly recommended to pass the whole state down to components (`{...hidden}` in the example below). If something changes in the library in the future, even breaking changes, you most likely will not need to change your code, since the state details will be encapsulated.

```jsx
import { Block, Group, Button, Hidden } from "reakit";

<Hidden.Container>
  {hidden => (
    <Block>
      <Group>
        <Hidden.Show as={Button} {...hidden}>Show</Hidden.Show>
        <Hidden.Hide as={Button} {...hidden}>Hide</Hidden.Hide>
        <Hidden.Toggle as={Button} {...hidden}>Toggle</Hidden.Toggle>
      </Group>
      <Hidden {...hidden}>Hidden</Hidden>
    </Block>
  )}
</Hidden.Container>
```

If you want to show or hide the `Hidden` component on events other than `onClick`, you should use the methods provided by [HiddenContainer](HiddenContainer.md). Please, note that the `hideOnClickOutside` prop shouldn't be used in this case.

```jsx
import { Block, Input, Button } from "reakit";

<Hidden.Container>
  {hidden => (
    <Block>
      <Input
        onFocus={hidden.show}
        onBlur={hidden.hide}
        placeholder={hidden.visible ? "Blur me" : "Focus me"}
      />
      <Hidden {...hidden}>Hidden</Hidden>
    </Block>
  )}
</Hidden.Container>
```

You can hide/show `Hidden` components using transitions:

```jsx
import { Block } from "reakit";

const props = {
  background: "white",
  duration: "500ms"
};

<Hidden.Container>
  {hidden => (
    <Block>
      <Hidden.Toggle as={Button} {...hidden}>Toggle</Hidden.Toggle>
      <Hidden {...props} fade {...hidden}>Fade</Hidden>
      <Hidden {...props} delay="0.5s" slide {...hidden}>Slide</Hidden>
      <Hidden {...props} delay="1s" expand {...hidden}>Expand</Hidden>
      <Hidden {...props} delay="1.5s" fade slide {...hidden}>Fade + Slide</Hidden>
      <Hidden {...props} delay="2s" fade expand {...hidden}>Fade + Expand</Hidden>
      <Hidden {...props} delay="2.5s" expand slide {...hidden}>Expand + Slide</Hidden>
    </Block>
  )}
</Hidden.Container>
```

Finally, you can easily create your own transitions. Just make sure to pass `animated` and `duration` props accordingly:

```jsx
import { styled, keyframes, Block } from "reakit";
import { prop } from "styled-tools";

const bounce = keyframes`
  0%, 50%, 75%, 87.5%, 100% { transform: translateY(0) }
  30% { transform: translateY(-100%) }
  65% { transform: translateY(-50%) }
  82.5% { transform: translateY(-25%) }
`;

const rotateAndSlide = keyframes`
  0% { transform: none }
  50% { transform: rotateZ(180deg) }
  100% { transform: rotateZ(180deg) translateX(1000%) }
`;

const MyHidden = styled(Hidden)`
  background: palevioletred;
  width: 20px;
  height: 20px;
  margin: 10px;
  &[aria-hidden="false"] {
    animation: ${bounce} ${prop("duration")};
  }
  &[aria-hidden="true"] {
    animation: ${rotateAndSlide} ${prop("duration")};
  }
`;

<Hidden.Container>
  {hidden => (
    <Block>
      <Hidden.Toggle as={Button} {...hidden}>Toggle</Hidden.Toggle>
      <MyHidden animated unmount duration="750ms" {...hidden} />
    </Block>
  )}
</Hidden.Container>
```
