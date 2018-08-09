You should use `ToolbarFocusable` on elements within your [Toolbar](/components/toolbar) that you want to add to the focus sequence.

```jsx
<Toolbar>
  <Toolbar.Content whiteSpace="nowrap">
    <Toolbar.Focusable>I'm focusable</Toolbar.Focusable>
    <div>I'm not</div>
    <Toolbar.Focusable>Use arrow keys</Toolbar.Focusable>
  </Toolbar.Content>
</Toolbar>
```