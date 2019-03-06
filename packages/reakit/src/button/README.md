---
path: /docs/button
redirect_from:
  - /components/button
---

# Box

Hello, "World"!

## Usage

### `Box`

```jsx
import { Box } from "reakit";

<Box>Box</Box>
```

### `useBoxProps`

```jsx static
import { useBoxProps } from "reakit";

function Box(props) {
  const boxProps = useBoxProps({}, props);
  return <div {...boxProps} />;
}

<Box>Box</Box>
```