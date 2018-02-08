```jsx
const GoArrowLeft = require('react-icons/lib/go/arrow-left');
const GoArrowRight = require('react-icons/lib/go/arrow-right');
const {
  InlineBlock,
  Button,
  Group,
  Backdrop,
  Paragraph,
  Flex,
  Inline,
  Shadow,
  withPopoverState,
} = require('reas');

const enhance = withPopoverState();

const Example = enhance(({ popover }) => (
  <InlineBlock relative>
    <Button as={Popover.Toggle} {...popover}>Click me</Button>
    <Backdrop background="transparent" as={Popover.Hide} {...popover} />
    <Popover {...popover} minWidth={300}>
      <Popover.Arrow />
      <Paragraph>
        Introduce new users to your product by walking them through it step by step.
      </Paragraph>
      <Flex fontSize={14}>
        <Group>
          <Button disabled><GoArrowLeft /><Inline marginLeft={4}>Prev</Inline></Button>
          <Button><Inline marginRight={4}>Next</Inline><GoArrowRight /></Button>
        </Group>
        <Button as={Popover.Hide} marginLeft="auto" {...popover}>End tour</Button>
      </Flex>
      <Shadow depth={4} />
    </Popover>
  </InlineBlock>
));

<Example />
```
