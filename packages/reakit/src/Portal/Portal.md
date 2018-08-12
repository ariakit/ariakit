`Portal` is built upon [React Portals](https://reactjs.org/docs/portals.html) and can be used alone or in combination with other components to dettach the element from the current DOM hierarchy and put it in a new `<div>`, which will be appended to `<body>`.

```jsx
<Portal textAlign="center">
  I'm on the bottom of the page
</Portal>
```

[Overlays](/components/overlay) and [Backdrops](/components/backdrop) are good candidates to using portals. 

In the example below, while **not** a good example of usage, you can understand most of what you should expect when using portals alone or combined with other components. If you click on `Backdrop` or `Overlay`, you can see that, even though they aren't children of `Button` in the DOM (because of `Portal`), they keep bubbling up events, such as `onClick`, which triggers `Overlay.Toggle`.

```jsx
import { Button, Overlay } from "reakit";

<Overlay.Container>
  {overlay => (
    <Button as={Overlay.Toggle} {...overlay}>
      Open overlay
      <Backdrop as={Portal} {...overlay} />
      <Overlay as={Portal} {...overlay}>Overlay</Overlay>
    </Button>
  )}
</Overlay.Container>
```
