`Toolbar` is [Base](/components/primitives/base) with `display: block`. By default it renders as a `<div>`.

```jsx
import FacebookIcon from "react-icons/lib/fa/facebook";
import GoogleIcon from "react-icons/lib/fa/google";
import AppleIcon from "react-icons/lib/fa/apple";

<Toolbar background="#666" color="white">
  <Toolbar.Content>
    <Toolbar.Focusable as={Button}><FacebookIcon /></Toolbar.Focusable>
    <Toolbar.Focusable>Facebook</Toolbar.Focusable>
  </Toolbar.Content>
  <Toolbar.Content area="center">
    <Toolbar.Focusable as={Button}><GoogleIcon /></Toolbar.Focusable>
  </Toolbar.Content>
  <Toolbar.Content area="end">
    <Toolbar.Focusable as={Button}><AppleIcon /></Toolbar.Focusable>
  </Toolbar.Content>
</Toolbar>
```

```jsx
import FacebookIcon from "react-icons/lib/fa/facebook";
import GoogleIcon from "react-icons/lib/fa/google";
import AppleIcon from "react-icons/lib/fa/apple";

<Toolbar vertical background="#666" color="white">
  <Toolbar.Content>
    <Toolbar.Focusable as={Button}><FacebookIcon /></Toolbar.Focusable>
  </Toolbar.Content>
  <Toolbar.Content area="center">
    <Toolbar.Focusable as={Button}><GoogleIcon /></Toolbar.Focusable>
  </Toolbar.Content>
  <Toolbar.Content area="end">
    <Toolbar.Focusable as={Button}><AppleIcon /></Toolbar.Focusable>
  </Toolbar.Content>
</Toolbar>
```
