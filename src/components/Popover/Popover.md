<!-- Description -->

Popover is an UI that shows itself briefly, then goes away.
Tooltips, error messages and graphical tutorials come to mind as examples.
The parent must have `position` set to something other than `static`, such as `relative`.
By default it renders as a `<div>`.

<!-- Minimal JSX to showcase component -->

```jsx
<InlineBlock relative backgroundColor="palevioletred" color="white" minWidth={400}>
  <Popover visible color="black">
    Pop!
  </Popover>
  Popover parent
</InlineBlock>
```

Rendered HTML.

```html
<div class="InlineBlock-jzkjxj ffjSwg Base-gxTqDr djbeTg" style="background-color: palevioletred; color: white; min-width: 400px;">
  <div class="Popover-jkHqAb hCOSbm Base-gxTqDr bCPnxv Hidden-kQwNaS hWPDZm Perpendicular-dUeEhm eCoAAo Box-cwadsP gAhprV" aria-hidden="false" role="group" style="color: black;">
    Pop!
  </div>
  Popover parent
</div>
```

Add a Popover.Arrow child to Popover to make it render an arrow.

```jsx
<InlineBlock relative backgroundColor="palevioletred" color="white" minWidth={400}>
  <Popover visible color="black">
    <Popover.Arrow />
    oh look! ⬆
  </Popover>
  Popover parent
</InlineBlock>
```

Popover.Container and Popover.toggle can be composed together to make a toggleable UI.

```jsx
const { Block, Popover } = require("reas");

<Popover.Container>
  {popover => (
    <InlineBlock relative>
      <Button as={Popover.Toggle} {...popover}>
        Click to pop
      </Button>
      <Popover {...popover} minWidth={150}>
        <Popover.Arrow />
        Click again to hide!
      </Popover>
    </InlineBlock>
  )}
</Popover.Container>;
```

Adding a Backdrop allows the Popover to hide if the user clicks outside.

```jsx
const { Block, Popover } = require("reas");

<Popover.Container>
  {popover => (
    <InlineBlock relative>
      <Backdrop background="transparent" as={Popover.Hide} {...popover} />
      <Button as={Popover.Toggle} {...popover}>
        Click to pop
      </Button>
      <Popover {...popover} minWidth={150}>
        <Popover.Arrow />
        Click anywhere to hide!
      </Popover>
    </InlineBlock>
  )}
</Popover.Container>;
```

A product tour using Popover

```jsx
const GoArrowLeft = require("react-icons/lib/go/arrow-left");
const GoArrowRight = require("react-icons/lib/go/arrow-right");
const {
  InlineBlock,
  Button,
  Group,
  Backdrop,
  Paragraph,
  Flex,
  Shadow
} = require("reas");

const Example = () => (
  <Popover.Container>
    {popover => (
      <Flex relative justifyContent="center">
        <Button as={Popover.Toggle} {...popover}>
          Start tour
        </Button>
        <Backdrop background="transparent" as={Popover.Hide} {...popover} />
        <Popover {...popover} minWidth={300}>
          <Popover.Arrow />
          <Paragraph>
            Introduce new users to your product by walking them through it step
            by step.
          </Paragraph>
          <Flex fontSize={14}>
            <Group>
              <Button disabled>
                <GoArrowLeft />Prev
              </Button>
              <Button>
                Next<GoArrowRight />
              </Button>
            </Group>
            <Button as={Popover.Hide} marginLeft="auto" {...popover}>
              End tour
            </Button>
          </Flex>
          <Shadow depth={4} />
        </Popover>
      </Flex>
    )}
  </Popover.Container>
);

<Example />;
```
