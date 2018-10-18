```jsx
import { Block, Tabs } from "reakit";

<Tabs.Container>
  {({ previous, hasPrevious, ...tabs }) => (
    <Block>
      <Tabs>
        <Tabs.Tab tab="1" {...tabs}>First</Tabs.Tab>
        <Tabs.Tab tab="2" {...tabs}>Second</Tabs.Tab>
      </Tabs>
      <Tabs.Panel tab="1" {...tabs}>First</Tabs.Panel>
      <Tabs.Panel tab="2" {...tabs}>Second</Tabs.Panel>
      <Tabs.Previous
        previous={previous}
        hasPrevious={hasPrevious}
      >
        Previous
      </Tabs.Previous>
    </Block>
  )}
</Tabs.Container>
```
