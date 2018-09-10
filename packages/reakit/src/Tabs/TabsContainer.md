Here's a destructured version of the example you saw on [Tabs](Tabs.md):

```jsx
import { Block, Group, Button } from "reakit";

<Tabs.Container>
  {({
    register,
    unregister,
    isCurrent,
    show,
    next,
    previous
  }) => (
    <Block>
      <Tabs>
        <Tabs.Tab
          tab="first"
          register={register}
          unregister={unregister}
          isCurrent={isCurrent}
          show={show}
          next={next}
          previous={previous}
        >
          First
        </Tabs.Tab>
        <Tabs.Tab
          tab="second"
          register={register}
          unregister={unregister}
          isCurrent={isCurrent}
          show={show}
          next={next}
          previous={previous}
        >
          Second
        </Tabs.Tab>
      </Tabs>
      <Tabs.Panel tab="first" isCurrent={isCurrent}>First</Tabs.Panel>
      <Tabs.Panel tab="second" isCurrent={isCurrent}>Second</Tabs.Panel>
    </Block>
  )}
</Tabs.Container>
```
