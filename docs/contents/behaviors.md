Finally, we have behaviors, which are basically components that apply event handlers and/or accessibility attributes into your component. Together with containers, they will help you to control the state of your application without needing to touch state logic.

Let's take the [`Hidden`](#hidden) example, but now using a behavior component to toggle its state:

```jsx { "showCode": true }
const { Block, Button, Hidden } = require('reas');

const Example = () => (
  <Hidden.Container>
    {hidden => (
      <Block>
        <Button as={Hidden.Toggle} {...hidden}>Toggle</Button>
        <Hidden destroy {...hidden}>Hidden</Hidden>
      </Block>
    )}
  </Hidden.Container>
);

<Example />
```

[`Step`](#step) is another example of a component which takes advantage from containers and behaviors:
```jsx { "showCode": true }
const { Block, Group, Button, Step } = require('reas');

const Example = () => (
  <Step.Container initialState={{ current: 0 }}>
    {step => (
      <Block>
        <Group>
          <Button as={Step.Previous} {...step}>Previous</Button>
          <Button as={Step.Next} {...step}>Next</Button>
        </Group>
        <Step step="first" {...step}>First</Step>
        <Step step="second" {...step}>Second</Step>
        <Step step="third" {...step}>Third</Step>
      </Block>
    )}
  </Step.Container>
);

<Example />
```
