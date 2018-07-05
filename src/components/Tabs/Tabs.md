`Tabs` renders as a `<ul>` for one or more [TabsTab](/components/tabs/tabstab)s inside, which render as `<li>`s. To be accessible, once focused, the arrow keys can be used to change tabs.

```jsx
import { Block } from "reakit";

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
