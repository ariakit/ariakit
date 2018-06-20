<!-- Description -->

Navigation is Base with `width: 100%`.
By default it renders as a `<nav>`.

<!-- Minimal JSX to showcase component -->

```jsx
<Navigation>
  <Link href="#">Home</Link>
  <Link href="#">Home 1</Link>
</Navigation>
```

Rendered HTML.

```html
<nav class="Base-gxTqDr bCPnxv Navigation-fHjuVb iXnWmC">
  <a class="Base-gxTqDr bCPnxv Link-DKeTA kdtdgQ" href="#">Home</a>
  <a class="Base-gxTqDr bCPnxv Link-DKeTA kdtdgQ" href="google.com">Google</a>
</nav>
```

<!-- while(not done) { Prop explanation, examples } -->

Basic styling via props.

```jsx
<Navigation borderBottom="1px solid black" background="#efefef" padding="1em">
  <Link href="#" padding="1em">Home</Link>
  <Link href="#" padding="1em">Home 1</Link>
</Navigation>
```

<!-- Cool styling example -->
