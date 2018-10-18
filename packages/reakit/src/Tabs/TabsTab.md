```jsx
import { Block, Tabs } from "reakit";

<Tabs.Container>
  {tabs => (
    <Block>
      <Tabs>
        <Tabs.Tab tab="first" {...tabs}>First</Tabs.Tab>
        <Tabs.Tab tab="second" {...tabs}>Second</Tabs.Tab>
      </Tabs>
      <Tabs.Panel tab="first" {...tabs}>First</Tabs.Panel>
      <Tabs.Panel tab="second" {...tabs}>Second</Tabs.Panel>
    </Block>
  )}
</Tabs.Container>
```
