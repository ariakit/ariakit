```jsx
import { Block, Tabs } from "reakit";

<Tabs.Container>
  {tabs => (
    <Block>
      <Tabs>
        <Tabs.Tab tab="first" {...tabs}>First</Tabs.Tab>
        <Tabs.Tab tab="second" {...tabs}>Second</Tabs.Tab>
      </Tabs>
      <Tabs.Panel tab="first" isCurrent={tabs.isCurrent}>
        First
      </Tabs.Panel>
      <Tabs.Panel tab="second" isCurrent={tabs.isCurrent}>
        Second
      </Tabs.Panel>
    </Block>
  )}
</Tabs.Container>
```
