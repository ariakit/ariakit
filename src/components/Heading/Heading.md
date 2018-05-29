<!-- Description -->

A component to be used for all heading weights.
By default renders as an `<h1>` element.
Use, e.g. `as={h2}`, to render as another heading element.

<!-- Minimal JSX to showcase component -->

```jsx
<React.Fragment>
  <Heading>Heading level 1</Heading>
  <Heading as="h2">Heading level 2</Heading>
  <Heading as="h3">Heading level 3</Heading>
  <Heading as="h4">Heading level 4</Heading>
  <Heading as="h5">Heading level 5</Heading>
  <Heading as="h6">Heading level 6</Heading>
</React.Fragment>
```

Rendered HTML.

```html
<div>
  <h1 class="Heading-gqIVUu eUhbkE fgNjay Base-gxTqDr bCPnxv">
    Heading level 1
  </h1>
  <h2 class="Heading-gqIVUu cuFjQQ Base-gxTqDr bCPnxv">
    Heading level 2
  </h2>
  <h3 class="Heading-gqIVUu giAEss Base-gxTqDr bCPnxv">
    Heading level 3
  </h3>
  <h4 class="Heading-gqIVUu jyxxj Base-gxTqDr bCPnxv">
    Heading level 4
  </h4>
  <h5 class="Heading-gqIVUu jGdSCX Base-gxTqDr bCPnxv">
    Heading level 5
  </h5>
  <h6 class="Heading-gqIVUu llqdou Base-gxTqDr bCPnxv">
    Heading level 6
  </h6>
</div>
```

<!-- Cool styling example -->

Basic styling via props.

```jsx
<React.Fragment>
  <Heading color="rgb(86%, 43.9%, 67%)" textTransform="uppercase">
    Heading level 1
  </Heading>
  <Heading color="rgb(86%, 43.9%, 76.2%)" as="h2" textTransform="uppercase">
    Heading level 2
  </Heading>
  <Heading color="rgb(86%, 43.9%, 85%)" as="h3">
    Heading level 3
  </Heading>
  <Heading color="rgb(86%, 47%, 94%)" as="h4" fontWeight="inherit">
    Heading level 4
  </Heading>
  <Heading color="rgb(75.2%, 47%, 94%)" as="h5" fontWeight="inherit">
    Heading level 5
  </Heading>
  <Heading color="rgb(65%, 47%, 94%)" as="h6" fontWeight="inherit">
    Heading level 6
  </Heading>
</React.Fragment>
```
