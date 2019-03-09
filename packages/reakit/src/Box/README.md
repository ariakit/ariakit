---
path: /docs/box
redirect_from:
  - /components/box
  - /components/block
  - /components/flex
  - /components/grid
  - /components/inline
  - /components/inlineblock
  - /components/inlineflex
  - /components/avatar
  - /components/backdrop
  - /components/blockquote
  - /components/card
  - /components/card/cardfit
  - /components/code
  - /components/divider
  - /components/field
  - /components/group
  - /components/group/groupitem
  - /components/heading
  - /components/image
  - /components/input
  - /components/label
  - /components/link
  - /components/list
  - /components/navigation
  - /components/paragraph
  - /components/table
  - /components/table/tablewrapper
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