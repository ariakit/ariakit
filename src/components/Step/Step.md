```jsx
const { InlineBlock, Button, Group, Popover, Flex, Paragraph } = require('reas');

const PopoverStep = props => (
  <InlineBlock relative>
    <Button as={[Group.Item, Step.Toggle]} {...props}>{props.step}</Button>
    <Step {...props}>
      <Popover visible minWidth={300}>
        <Popover.Arrow />
        <Paragraph>{props.step}</Paragraph>
        <Flex fontSize={14}>
          <Group>
            <Button as={Step.Previous} {...props}>← Prev</Button>
            <Button as={Step.Next} {...props}>Next →</Button>
          </Group>
          <Button as={Step.Hide} marginLeft="auto" {...props}>End tour</Button>
        </Flex>
      </Popover>
    </Step>
  </InlineBlock>
);

const Steps = () => (
  <Step.Container>
    {step => (
      <Group>
        <PopoverStep step="Step 1" {...step} />
        <PopoverStep step="Step 2" {...step} />
        <PopoverStep step="Step 3" {...step} />
      </Group>
    )}
  </Step.Container>
);

<Steps />
```
