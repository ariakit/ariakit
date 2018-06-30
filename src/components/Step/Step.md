<!-- Description -->

Step is composed from Hidden as an interactive UI with one or more steps to complete.
It works great with Popover but can be used with other elements.
The sub components that make up the user experience are:

* Step.Container
* Step.Toggle
* Step.Hide
* Step.Previous
* Step.Next

The following custom event props take functions:

* onEnter
* onExit

They fire when the step is entered or departed, respectively.

The parent should have position set to something other than static, such as relative.
By default Step renders as a `<div>`.

<!-- Minimal JSX to showcase component -->

```jsx
const { InlineBlock, Button, Popover } = require("reakit");

const BasicStep = props => (
  <InlineBlock relative marginLeft="1em">
    <Button as={Step.Toggle} {...props}>
      Toggle {props.step}
    </Button>
    <Step {...props}>
      <Popover visible minWidth={40}>
        <Popover.Arrow />
        <Button as={Step.Previous} {...props}>
          Previous
        </Button>
        <Button as={Step.Next} {...props}>
          Next
        </Button>
        <Button as={Step.Hide} marginLeft="auto" {...props}>
          Hide {props.step}
        </Button>
      </Popover>
    </Step>
  </InlineBlock>
);

const Steps = () => (
  <Step.Container>
    {step => (
      <Group>
        <BasicStep step="1" {...step} />
        <BasicStep step="2" {...step} />
        <BasicStep step="3" {...step} />
      </Group>
    )}
  </Step.Container>
);

<Steps paddingLeft={200} />;
```

Rendered HTML.

```html
<div class="Group-gLBQNJ gJsDPt Base-gxTqDr dXMyxz" role="group">
  <div class="InlineBlock-jzkjxj hFgqTb Base-gxTqDr bkRrdN" style="margin-left: 1em;">
    <button class="Button-kDSBcD eKEElF Box-cwadsP fBQxeS Base-gxTqDr dXMyxz StepToggle-hXakCX eMjcJh" role="button" tabindex="0">Toggle 1</button>
  </div>
  <div class="InlineBlock-jzkjxj hFgqTb Base-gxTqDr bkRrdN" style="margin-left: 1em;">
    <button class="Button-kDSBcD eKEElF Box-cwadsP fBQxeS Base-gxTqDr dXMyxz StepToggle-hXakCX eMjcJh" role="button" tabindex="0">Toggle 2</button>
  </div>
  <div class="InlineBlock-jzkjxj hFgqTb Base-gxTqDr bkRrdN" style="margin-left: 1em;">
    <button class="Button-kDSBcD eKEElF Box-cwadsP fBQxeS Base-gxTqDr dXMyxz StepToggle-hXakCX eMjcJh" role="button" tabindex="0">Toggle 3</button>
  </div>
</div>
```

A simple product tour with Step.

```jsx
const {
  InlineBlock,
  Button,
  Group,
  Popover,
  Flex,
  Backdrop,
  Paragraph
} = require("reakit");

const PopoverStep = props => (
  <InlineBlock relative>
    <Button as={[Group.Item, Step.Toggle]} {...props}>
      {props.step}
    </Button>
    <Step {...props}>
      <Backdrop visible as={Step.Hide} {...props} />
      <Popover visible minWidth={300}>
        <Popover.Arrow />
        <Paragraph>{props.step}</Paragraph>
        <Paragraph>{props.description}</Paragraph>
        <Flex fontSize={14}>
          <Group>
            <Button as={Step.Previous} {...props}>
              ← Prev
            </Button>
            <Button as={Step.Next} {...props}>
              Next →
            </Button>
          </Group>
          <Button as={Step.Hide} marginLeft="auto" {...props}>
            End tour
          </Button>
        </Flex>
      </Popover>
    </Step>
  </InlineBlock>
);

const Steps = () => (
  <Step.Container>
    {step => (
      <Group>
        <PopoverStep
          step="1: Navigation"
          {...step}
          description="This is where you change views."
        />
        <PopoverStep
          step="2: Create"
          {...step}
          description="This is the main function of the app."
        />
        <PopoverStep
          step="3: Options"
          {...step}
          description="Anything else you may need is here."
        />
      </Group>
    )}
  </Step.Container>
);

<Steps />;
```
