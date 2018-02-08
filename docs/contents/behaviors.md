Finally, we have behaviors, which are basically components that apply event handlers and/or accessibility attributes into your component. Together with state enhancers, they will help you to control the state of your application without needing to touch state logic.

Let's take the [`Hidden`](#hidden) example, but now using a behavior component to toggle its state:

```jsx { "showCode": true }
const { Block, Button, Hidden, withHiddenState } = require('reas');

const enhance = withHiddenState();
const Example = enhance(({ hidden }) => (
  <Block>
    <Button as={Hidden.Toggle} {...hidden}>Toggle</Button>
    <Hidden destroy {...hidden}>Hidden</Hidden>
  </Block>
));

<Example />
```

[`Step`](#step) is another example of a component which takes advantage from state enhancers and behaviors. Let's take a look:
```jsx { "showCode": true }
const { Block, Group, Button, Step, withStepState } = require('reas');

const enhance = withStepState({ current: 0 });
const Example = enhance(({ step }) => (
  <Block>
    <Group>
      <Button as={Step.Previous} {...step}>Previous</Button>
      <Button as={Step.Next} {...step}>Next</Button>
    </Group>
    <Step step="first" {...step}>First</Step>
    <Step step="second" {...step}>Second</Step>
    <Step step="third" {...step}>Third</Step>
  </Block>
));

<Example />
```
