  <!-- Description -->

The Backdrop is a hidden component that sits behind some other component and handles clicks (like a button). It can be used to implement a **_"click outside to close"_** functionality. Normally, Backdrops are transparent.

Backdrop by itself does nothing and renders as an uninteresting hidden `div`. Use it inside a `Hidden.Container`, with prop `as={Hidden.Hide}` on the Backdrop, and the component that triggers the Backdrop, e.g. a button, with prop `as={Hidden.Show}`. When clicked, the button will show the Backdrop (and do anything else it was programmed to do.)

Below, the Button shows an opaque Backdrop when clicked.

  <!-- Minimal JSX to showcase component -->

```jsx
const { Button, Hidden, Backdrop } = require("reas");

<Hidden.Container>
  {props => (
    <div>
      <Button as={Hidden.Show} {...props}>
        Show visible Backdrop
      </Button>
      <Backdrop as={Hidden.Hide} {...props} />
    </div>
  )}
</Hidden.Container>;
```

Rendered HTML

```html static
<div>
  <button class="Button-kDSBcD eMpnqe Box-cwadsP gAhprV Base-gxTqDr bCPnxv" role="button" tabindex="0">
    Show visible Backdrop
  </button>
  <button class="Backdrop-epcaqy haJeUx Hidden-kQwNaS kWLiGv Base-gxTqDr bCPnxv" aria-hidden="true" role="button" tabindex="-1" hidden=""></button>
</div>
```

  <!-- while(not done) { Prop explanation, examples } -->

Transparent Backdrop behind a colored box.

```jsx
const { Button, Hidden, Backdrop, Block } = require("reas");

<Hidden.Container>
  {props => (
    <div>
      <Button as={Hidden.Show} {...props}>
        Show box (with Backdrop)
      </Button>
      <Backdrop as={Hidden.Hide} {...props} backgroundColor="transparent">
        <Block relative width='20vmin' height='20vmin' left="50%" backgroundColor="pink"/>
      </Backdrop>
    </div>
  )}
</Hidden.Container>;
```

It is possible to wrap the Backdrop in another component to restrict its effect to a certain area of the UI.

```jsx
const { Block, Button, Flex, Hidden } = require("reas");

const Example = () => (
  <Hidden.Container>
    {backdrop => (
      <Block>
        <Button as={Hidden.Show} {...backdrop}>
          Show
        </Button>
        <Flex height={100} relative>
          <Backdrop absolute as={Hidden.Hide} {...backdrop}>
            Click me to hide
          </Backdrop>
        </Flex>
      </Block>
    )}
  </Hidden.Container>
);

<Example />;
```

  <!-- Cool styling example -->
