`Hidden` is a highly generic yet powerful ReaKit components. It simply hides away itself and wait for a `visible` prop to be passed in so it shows up.

```jsx
<Hidden visible>Hidden</Hidden>
```

```jsx
import { Block, Group, Button } from "reakit";

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