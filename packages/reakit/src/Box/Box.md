This is the abstract layout component that all other Reakit components are built on top of. By default it renders a `div` tag with basic reset styles.

```jsx
import { Box } from 'reakit';

<Box>Box</Box>
```

Any additional css rules can be added as props:

```jsx
import { Box } from 'reakit';

<Box backgroundColor="palevioletred" color="white">Box</Box>
```

You can use the `palette` prop to change its colors based on your [theme](../../docs/theming.md) (it has no effect if you're not using a theme):

```jsx
import { Box } from 'reakit';

<React.Fragment>
  <Box palette="primary">Box</Box>
  <Box palette="primary" opaque>Box</Box>
  <Box palette="primary" tone={1} opaque>Box</Box>
</React.Fragment>
```

It offers convenience props to control the `position` css property:

```jsx
import { Box } from 'reakit';

<Box relative width={100} height={40}>
  <Box
    absolute
    backgroundColor="palevioletred"
    left={0}
    bottom={0}
    width={10}
    height={10}
  />
</Box>
```

You can render it [as](../../docs/as.md) any other HTML element or React component:

```jsx
import { Box } from 'reakit';

<Box
  as="a"
  href="https://github.com/reakit/reakit"
  target="_blank"
>
  GitHub
</Box>
```
