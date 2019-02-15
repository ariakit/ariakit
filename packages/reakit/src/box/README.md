---
title: Box
path: /components/box
---

Hello

## Usage

### `Box`

```jsx
import { Box } from "reakit";

<Box>Box</Box>
```

### `useBoxProps`

```jsx
import { useBoxProps } from "reakit";

function Box(props) {
  const boxProps = useBoxProps({}, props);
  return <div {...boxProps} />;
}

<Box>Box</Box>
```