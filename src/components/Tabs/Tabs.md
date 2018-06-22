<!-- Description -->
Tabs renders as a `<ul>` for one or more Tabs inside, which render as `<li>`s.
Both components are flexboxes with basic styles.
Once focused, the arrow keys can be used to change tabs.
Tabs comes with the following sub components:

- Tabs.Container
- Tabs.Panel
- Tabs.Tab

<!-- Minimal JSX to showcase component -->

```jsx
const { Block } = require('reas');

const Example = () => (
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
);

<Example />
```

Rendered HTML.

```html
<div class="Block-euiAZJ kNNudN Base-gxTqDr dXMyxz">
  <ul class="Tabs-eRQPIA dXMyxz hdSJFV Base-gxTqDr" role="tablist">
    <li class="TabsTab-iMzwUt gkuTYb active Step-etwyWf eEIHfr Hidden-kQwNaS jpREDp Base-gxTqDr dXMyxz" id="firstTab" aria-selected="true"
      aria-controls="firstPanel" tabindex="0" role="tab">First</li>
    <li class="TabsTab-iMzwUt gkuTYb Step-etwyWf eEIHfr Hidden-kQwNaS jpREDp Base-gxTqDr dXMyxz" id="secondTab"
      aria-selected="false" aria-controls="secondPanel" tabindex="-1" role="tab">Second</li>
  </ul>
  <div class="TabsPanel-fszTCK cWiVXO Hidden-kQwNaS jpREDp Base-gxTqDr dXMyxz" id="firstPanel" aria-labelledby="firstTab"
    role="tabpanel">First</div>
</div>
```

Basic styling via props.

```jsx
const { Block } = require('reas');

const Example = () => (
  <Tabs.Container>
    {tabs => (
      <Block>
        <Tabs>
          <Tabs.Tab borderRadius={4} backgroundColor="#e8abab" tab="red" {...tabs}>Red</Tabs.Tab>
          <Tabs.Tab borderRadius={4} backgroundColor="#b1e8ac" tab="green" {...tabs}>Green</Tabs.Tab>
          <Tabs.Tab borderRadius={4} backgroundColor="#acb6e8" tab="blue" {...tabs}>Blue</Tabs.Tab>
        </Tabs>
        <Tabs.Panel height={140} tab="red" backgroundColor="#e8abab" {...tabs}>Red tab contents go here</Tabs.Panel>
        <Tabs.Panel height={140} tab="green" backgroundColor="#b1e8ac" {...tabs}>Green tab contents go here</Tabs.Panel>
        <Tabs.Panel height={140} tab="blue" backgroundColor="#acb6e8" {...tabs}>Blue tab contents go here</Tabs.Panel>
      </Block>
    )}
  </Tabs.Container>
);

<Example />
```
