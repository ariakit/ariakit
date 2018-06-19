<!-- Description -->

Fit is absolute positioned and takes up all space inside the parent element.
It can be used in many ways, as a transparency, as a background, as a layer...
By default it doesn't have styling.
Parent below is a 50px square Block.

<!-- Minimal JSX to showcase component -->

```jsx
const { Block } = require("reakit");

<Block relative width={50} height={50}>
  <Fit backgroundColor="#f4f4f4" />
</Block>;
```

Rendered HTML.

```html
<div class="Block-euiAZJ tSBxN Base-gxTqDr djbeTg" style="width: 50px; height: 50px;">
  <div class="Fit-dGrwIJ cnSmuS Base-gxTqDr bCPnxv"></div>
</div>
```

Basic styling via props.

<!-- while(not done) { Prop explanation, examples } -->

```jsx
const { Block } = require("reakit");

<Block relative width={50} height={50} border="2px solid palevioletred">
  <Fit
    backgroundColor="rgba(85.9%, 43.9%, 57.6%, 0.75)"
    transform="translate(33%, 33%)"
  />
  <Fit
    backgroundColor="rgba(85.9%, 43.9%, 57.6%, 0.75)"
    transform="translate(-33%, -33%)"
  />
  <Fit
    backgroundColor="rgba(85.9%, 43.9%, 57.6%, 0.75)"
    transform="translate(20%, -46%) rotate(45deg)"
  />
  <Fit
    backgroundColor="rgba(85.9%, 43.9%, 57.6%, 0.75)"
    transform="translate(-20%, 46%) rotate(45deg)"
  />
</Block>;
```

<!-- Cool styling example -->
