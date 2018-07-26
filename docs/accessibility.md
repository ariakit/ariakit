All ReaKit components are [WAI-ARIA](https://en.wikipedia.org/wiki/WAI-ARIA) compliant by default. This means that you don't need to worry about adding `role` and `aria-*` props to components unless you're using them for different purposes.

Besides adding props, it also implements accessible interactions, such as navigating between tabs through arrow keys:

```jsx
import { Block, Tabs } from "reakit";

<Tabs.Container>
  {tabs => (
    <Block>
      <Tabs>
        <Tabs.Tab {...tabs} tab="tab1">Tab 1</Tabs.Tab>
        <Tabs.Tab {...tabs} tab="tab2">Tab 2</Tabs.Tab>
        <Tabs.Tab {...tabs} tab="tab3">Tab 3</Tabs.Tab>
      </Tabs>
      <Tabs.Panel {...tabs} tab="tab1">Tab 1</Tabs.Panel>
      <Tabs.Panel {...tabs} tab="tab2">Tab 2</Tabs.Panel>
      <Tabs.Panel {...tabs} tab="tab3">Tab 3</Tabs.Panel>
    </Block>
  )}
</Tabs.Container>
```

> If you find some accessibility issue or something that could be improved regarding accessibility, don't hesitate to [open an issue](https://github.com/reakit/reakit/issues/new) or [send a PR](https://github.com/reakit/reakit/compare).