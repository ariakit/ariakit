<!-- Description -->

Shadow, just as the name says, adds shadow to its parent component.
The parent must have `position` set to something other than `static`, such as `relative`.
Shadow is built from Fit and by default renders as a `<div>`.

<!-- Minimal JSX to showcase component -->

```jsx
<Inline relative>
  <Shadow />
  This text has a Shadow child
</Inline>
```

Rendered HTML.

```html
<span class="Base-gxTqDr djbeTg Inline-dhDjwC cQwXYv">
  <div class="Shadow-bkZSDt hIIQbv Fit-dGrwIJ cnSmuS Base-gxTqDr bCPnxv">
  </div>
  This text has a Shadow child
</span>
```

The `depth` prop customizes the shadow depth.

```jsx
<Inline relative>
  <Shadow depth={9} />
  This text has a deeper Shadow child
</Inline>
```

Basic styling via props.

```jsx
const { Block } = require("reakit");

<Flex
  justifyContent="space-around"
  relative
  padding={10}
  fontSize={45}
  color="#717171"
>
  <Shadow depth={10} />

  <Block relative >
    <Shadow depth={2} />
    S
  </Block>
  <Block relative>
    <Shadow depth={2} />
    H
  </Block>
  <Block relative>
    <Shadow depth={2} />
    A
  </Block>
  <Block relative>
    <Shadow depth={2} />
    D
  </Block>
  <Block relative>
    <Shadow depth={2} />
    O
  </Block>
  <Block relative>
    <Shadow depth={2} />
    W
  </Block>
</Flex>;
```
