A [Box](../Box/Box.md) that stacks its children on top of each other. The first child element determines the size of the container, while the others positioned absolutely on top.

```jsx
import { Stack } from "reakit";

<Stack>
  <Box
    border="1px solid rgb(219, 112, 147)"
    width={80}
    height={80}
  />
  <Box
    backgroundColor="rgb(219, 112, 147)"
    border="1px solid rgb(219, 112, 147)"
    width={40}
    height={40}
  />
</Stack>
```

By default, the stacked children are anchored to the top left corner of the stack. This can be customized by setting the `anchor` prop to an array that may contain any combination of `"top"`, `"right"`, `"bottom"` and `"left"`. For example, `["bottom", "right"]` places all stacked children at the bottom right corner of the container. To stretch the children horizontally, include both `"left"` and `"right"` in the array; similarly, specifying both `"top"` and `"bottom"` causes the stacked children to be stretched vertically.

```jsx
import { Stack } from "reakit";

<Flex>
  <Stack anchor={['top', 'right']}>
    <Box
      border="1px solid rgb(219, 112, 147)"
      width={80}
      height={80}
    />
    <Box
      backgroundColor="rgb(219, 112, 147)"
      width={40}
      height={40}
    />
  </Stack>

  <Stack anchor={['bottom', 'right']} marginLeft={8}>
    <Box
      border="1px solid rgb(219, 112, 147)"
      width={80}
      height={80}
    />
    <Box
      backgroundColor="rgb(219, 112, 147)"
      width={40}
      height={40}
    />
  </Stack>

  <Stack anchor={['top', 'bottom', 'left']} marginLeft={8}>
    <Box
      border="1px solid rgb(219, 112, 147)"
      width={80}
      height={80}
    />
    <Box
      backgroundColor="rgb(219, 112, 147)"
      width={40}
    />
  </Stack>

  <Stack anchor={['top', 'left', 'right']} marginLeft={8}>
    <Box
      border="1px solid rgb(219, 112, 147)"
      width={80}
      height={80}
    />
    <Box
      backgroundColor="rgb(219, 112, 147)"
      height={40}
    />
  </Stack>
</Flex>
```
