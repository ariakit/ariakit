<!-- Description -->

Navigation is Base with `width: 100%`.
By default it renders as a `<nav>`.

<!-- Minimal JSX to showcase component -->

```jsx
<Navigation>
  <Link href="#list">List</Link>
  <Link href="#paragraph">Paragraph</Link>
</Navigation>
```

Rendered HTML.

```html
<nav class="Base-gxTqDr bCPnxv Navigation-fHjuVb iXnWmC">
  <a class="Base-gxTqDr bCPnxv Link-DKeTA kdtdgQ" href="#list">List</a>
  <a class="Base-gxTqDr bCPnxv Link-DKeTA kdtdgQ" href="#paragraph">Paragraph</a>
</nav>
```

<!-- Cool styling example -->

Basic styling via props.

```jsx
<Navigation borderBottom="1px solid black" background="#efefef" padding="1em" textAlign="center">
  <Link href="#list" padding="1em">List</Link>
  <Link href="#paragraph" padding="1em">Paragraph</Link>
</Navigation>
```

