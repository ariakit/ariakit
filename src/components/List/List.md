<!-- Description -->

List renders by default as an `<ul>` tag with `list-style` unset.

<!-- Minimal JSX to showcase component -->
```jsx
<List>
  <List.Item>Item 1</List.Item>
  <List.Item>Item 2</List.Item>
  <List.Item>Item 3</List.Item>
  <List.Item>Item 4</List.Item>
</List>
```

Rendered HTML.

```html
<ul class="Base-gxTqDr bCPnxv List-htqUMz cwWRSG" role="list">
  <li class="Base-gxTqDr bCPnxv ListItem-llUgLb gEULxf" role="listitem">
    Item 1
  </li>
  <li class="Base-gxTqDr bCPnxv ListItem-llUgLb gEULxf" role="listitem">
    Item 2
  </li>
  <li class="Base-gxTqDr bCPnxv ListItem-llUgLb gEULxf" role="listitem">
    Item 3
  </li>
  <li class="Base-gxTqDr bCPnxv ListItem-llUgLb gEULxf" role="listitem">
    Item 4
  </li>
</ul>
```

Basic styling via props.

```jsx
<List listStyle="kannada inside" color="purple">
  <List.Item>Echelon</List.Item>
  <List.Item>Muliebrity</List.Item>
  <List.Item>Sacrosanct</List.Item>
  <List.Item>Petard</List.Item>
</List>
```
