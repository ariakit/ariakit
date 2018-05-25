  <!-- Description -->

The Backdrop is a hidden component that is shown when something happens. Backdrop by itself does nothing and renders as an uninteresting hidden div. It is meant to be used inside a `Hidden.Container`, with prop `as={Hidden.Hide}` on the Backdrop, and some other component with prop `as={Hidden.Show}`.


Below, the Link shows the Backdrop when clicked.

  <!-- Minimal JSX to showcase component -->

```jsx
<Hidden.Container>
  {backdropProps => (
    <div>
      <Link as={Hidden.Show} {...backdropProps}>
        Clicking this will show a fullscreen Backdrop
      </Link>
      <Backdrop as={Hidden.Hide} {...backdropProps}>
        {"CLICK ME TO HIDE ME"}
      </Backdrop>
    </div>
  )}
</Hidden.Container>
```

  <!-- Rendered HTML of above -->

  <!-- while(not done) { Prop explanation, examples } -->

  <!-- Cool styling example -->

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
