<!-- Description -->

Inline is Base with `display: inline`.
By default it renders as a `<span>`.

<!-- Minimal JSX to showcase component -->

```jsx
<div>
  <Inline>We are </Inline>
  <Inline>inline </Inline>
  <Inline>elements.</Inline>
</div>
```

Rendered HTML.

```html
<div>
  <span class="Inline-dhDjwC cQwXYv Base-gxTqDr bCPnxv">
    We are
  </span>
  <span class="Inline-dhDjwC cQwXYv Base-gxTqDr bCPnxv">
    not
  </span>
  <span class="Inline-dhDjwC cQwXYv Base-gxTqDr bCPnxv">
    blocks
  </span>
</div>
```

<!-- Cool styling example -->

Basic styling via props with another Inline as child.

```jsx
<Inline>
  Could you <Inline fontStyle="italic">please</Inline> give us your thoughts on
  this library?
</Inline>
```
