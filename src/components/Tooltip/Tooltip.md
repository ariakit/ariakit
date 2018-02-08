```jsx
const { Button } = require('reas');

<Button>
  Hover me
  <Tooltip>Tooltip</Tooltip>
</Button>
```

```jsx
const { Button } = require('reas');

<Button>
  Hover me
  <Tooltip><Tooltip.Arrow />Tooltip</Tooltip>
</Button>
```

```jsx
const { Button } = require('reas');

<Button margin={32}>
  Hover me
  <Tooltip pos="top"><Tooltip.Arrow pos="bottom" />Tooltip</Tooltip>
  <Tooltip pos="right"><Tooltip.Arrow pos="left" />Tooltip</Tooltip>
  <Tooltip pos="bottom"><Tooltip.Arrow pos="top" />Tooltip</Tooltip>
  <Tooltip pos="left"><Tooltip.Arrow pos="right" />Tooltip</Tooltip>
</Button>
```

```jsx
const { Button } = require('reas');

<Button>
  Hover me
  <Tooltip backgroundColor="palevioletred" borderColor="palevioletred">
    <Tooltip.Arrow color="palevioletred" />
    Tooltip
  </Tooltip>
</Button>
```
