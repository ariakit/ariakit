`Toolbar` is [Base](/components/primitives/base) with `display: block`. By default it renders as a `<div>`.

```jsx
<Toolbar>
  <Toolbar.Start>
    <Toolbar.Item as={Button}>Button 1</Toolbar.Item>
    <Toolbar.Item as={Button}>Button 1</Toolbar.Item>
  </Toolbar.Start>
  <Toolbar.Center>
    <Toolbar.Item as={Button}>Button 1</Toolbar.Item>
  </Toolbar.Center>
  <Toolbar.End>
    <Toolbar.Item as={Button}>Button 1</Toolbar.Item>
  </Toolbar.End>
</Toolbar>
```
