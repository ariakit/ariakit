<!-- Description -->

Tooltip is composed from Perpendicular.
It displays a tooltip when the parent element is hovered or receives focus.
By default it renders as a `<div>`.

<!-- Minimal JSX to showcase component -->
```jsx
const { Button } = require('reakit');

<Button>
  Hover me
  <Tooltip>Tooltip</Tooltip>
</Button>
```

Rendered HTML.
```html
<div>
  <div class="Button-kDSBcD eKEElF Box-cwadsP fBQxeS Base-gxTqDr dXMyxz" role="button" tabindex="0">Hover me
    <div class="Tooltip-fPHSWX bgARGo Perpendicular-dUeEhm fCaXcc Base-gxTqDr dXMyxz" role="tooltip">Tooltip</div>
  </div>
</div>
```

Tooltip.Arrow can be used to add an arrow to the tooltip.
Add it as a child of Tooltip.

```jsx
const { Button } = require('reakit');

<Button>
  Hover me
  <Tooltip><Tooltip.Arrow />Tooltip</Tooltip>
</Button>
```

Multiple Tooltips are possible.

```jsx
const { Button } = require('reakit');

<Button margin={32}>
  Hover me
  <Tooltip pos="top"><Tooltip.Arrow pos="bottom" />Tooltip</Tooltip>
  <Tooltip pos="right"><Tooltip.Arrow pos="left" />Tooltip</Tooltip>
  <Tooltip pos="bottom"><Tooltip.Arrow pos="top" />Tooltip</Tooltip>
  <Tooltip pos="left"><Tooltip.Arrow pos="right" />Tooltip</Tooltip>
</Button>
```

Basic styling via props.

```jsx
const { Button } = require('reakit');

<Button>
  Rose
  <Tooltip backgroundColor="palevioletred" borderColor="palevioletred">
    <Tooltip.Arrow color="palevioletred" />
    A type of flower: 🌹
  </Tooltip>
</Button>
```
