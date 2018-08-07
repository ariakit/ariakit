`ToolbarContent` is a wrapper for your [Toolbar](/components/toolbar) items. It helps you to align and space your elements correctly within the toolbar.

```jsx
<Toolbar>
  <Toolbar.Content>Start</Toolbar.Content>
  <Toolbar.Content area="center">Center</Toolbar.Content>
  <Toolbar.Content area="end">End</Toolbar.Content>
</Toolbar>
```

When using `area="center"`, the elements inside it will be centralized no matter the size of the end elements. That's true until it touches one of them:

```jsx
<Toolbar>
  <Toolbar.Content background="white" width={500}>
    Start
  </Toolbar.Content>
  <Toolbar.Content background="white" area="center">
    Center
  </Toolbar.Content>
  <Toolbar.Content background="white" area="end">
    End
  </Toolbar.Content>
</Toolbar>
```