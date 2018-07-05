```jsx
import { Block, Group, Button } from "reakit";

<Hidden.Container>
  {({ visible, show, hide, toggle }) => (
    <Block>
      <Group>
        <Button onClick={show}>Show</Button>
        <Button onClick={hide}>Hide</Button>
        <Button onClick={toggle}>Toggle</Button>
      </Group>
      {visible && <Block>Block</Block>}
    </Block>
  )}
</Hidden.Container>
```
