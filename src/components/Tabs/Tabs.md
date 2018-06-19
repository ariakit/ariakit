```jsx
const { Block } = require('reakit');

const Example = () => (
  <Tabs.Container>
    {tabs => (
      <Block>
        <Tabs>
          <Tabs.Tab tab="first" {...tabs}>First</Tabs.Tab>
          <Tabs.Tab tab="second" {...tabs}>Second</Tabs.Tab>
          <Tabs.Tab tab="third" {...tabs}>Third</Tabs.Tab>
        </Tabs>
        <Tabs.Panel tab="first" {...tabs}>First</Tabs.Panel>
        <Tabs.Panel tab="second" {...tabs}>Second</Tabs.Panel>
        <Tabs.Panel tab="third" {...tabs}>Third</Tabs.Panel>
      </Block>
    )}
  </Tabs.Container>
);

<Example />
```
