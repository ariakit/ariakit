```jsx
const GoArrowLeft = require('react-icons/lib/go/arrow-left');
const GoArrowRight = require('react-icons/lib/go/arrow-right');
const { InlineBlock, Button, Group, Backdrop, Paragraph, Flex, Shadow } = require('reas');

const Example = () => (
  <Popover.State>
    {popover => (
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
              <Button disabled><GoArrowLeft />Prev</Button>
              <Button>Next<GoArrowRight /></Button>
            </Group>
            <Button as={Popover.Hide} marginLeft="auto" {...popover}>End tour</Button>
          </Flex>
          <Shadow depth={4} />
        </Popover>
      </InlineBlock>
    )}
  </Popover.State>
);

<Example />
```
