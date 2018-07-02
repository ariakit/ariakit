`Backdrop` is a [Hidden](/components/hidden) component that sits behind some other component and handles clicks (like a `button`). It can be used to implement a *click outside to close* functionality.

```jsx
import { Backdrop, Overlay } from "reakit";

<Overlay.Container>
  {overlay => (
    <div>
      <Button as={Overlay.Show} {...overlay}>Show</Button>
      <Backdrop as={Overlay.Hide} {...overlay} />
      <Overlay {...overlay}>Click outside to dismiss overlay</Overlay>
    </div>
  )}
</Overlay.Container>
```
