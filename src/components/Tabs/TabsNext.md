```jsx
import { Block } from "reakit";

<Tabs.Container>
  {({ next, hasNext, ...tabs }) => (
    <Block>
      <Tabs>
        <Tabs.Tab tab="1" {...tabs}>First</Tabs.Tab>
        <Tabs.Tab tab="2" {...tabs}>Second</Tabs.Tab>
      </Tabs>
      <Tabs.Panel tab="1" {...tabs}>First</Tabs.Panel>
      <Tabs.Panel tab="2" {...tabs}>Second</Tabs.Panel>
      <Tabs.Next next={next} hasNext={hasNext}>Next</Tabs.Next>
    </Block>
  )}
</Tabs.Container>
```
