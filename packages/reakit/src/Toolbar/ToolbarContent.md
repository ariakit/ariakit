`ToolbarContent` is a wrapper for your [Toolbar](Toolbar.md) items. It helps you to align and space your elements correctly within the toolbar.

```jsx
<Toolbar>
  <Toolbar.Content>Start</Toolbar.Content>
  <Toolbar.Content align="center">Center</Toolbar.Content>
  <Toolbar.Content align="end">End</Toolbar.Content>
</Toolbar>
```

When using `align="center"`, the elements inside it will be centralized no matter the size of the end elements. That's true until it touches one of them:

```jsx
<Toolbar overflow="auto">
  <Toolbar.Content background="white" width={500}>
    Start
  </Toolbar.Content>
  <Toolbar.Content background="white" align="center">
    Center
  </Toolbar.Content>
  <Toolbar.Content background="white" align="end">
    End
  </Toolbar.Content>
</Toolbar>
```