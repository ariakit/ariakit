<!-- Description -->

Grid is Base with `display: grid`.
It pairs with the Grid.Item component.
Both take props to set several grid-\* related properties.

<!-- Minimal JSX to showcase component -->

```jsx
<Grid columns="repeat(2, 1fr)" autoRows="auto" gap="3vw">
  <Grid.Item>
    Non proident duis cupidatat veniam ea. Lorem esse ullamco do velit voluptate
    anim eiusmod pariatur aute ullamco est. Magna incididunt elit dolor quis
  </Grid.Item>
  <Grid.Item>
    Culpa aliquip ex sunt duis. Nulla magna reprehenderit fugiat in proident
    officia laboris reprehenderit proident est pariatur eiusmod.
  </Grid.Item>
  <Grid.Item>
    Commodo magna aliqua reprehenderit amet ex dolor sunt enim aliquip. Nulla
  </Grid.Item>
</Grid>
```

Rendered HTML.

```html
<div class="Grid-iUdnzb cEjmRL Base-gxTqDr bCPnxv" style="gap: 3vw;">
  <div class="GridItem-jOwSCy iPBTRS Base-gxTqDr bCPnxv">
    Non proident duis cupidatat veniam ea. Lorem esse ullamco do velit voluptate anim eiusmod pariatur aute ullamco est. Magna
    incididunt elit dolor quis.
  </div>
  <div class="GridItem-jOwSCy iPBTRS Base-gxTqDr bCPnxv">
    Culpa aliquip ex sunt duis. Nulla magna reprehenderit fugiat in proident officia laboris reprehenderit proident est pariatur
    eiusmod.
  </div>
  <div class="GridItem-jOwSCy iPBTRS Base-gxTqDr bCPnxv">
    Commodo magna aliqua reprehenderit amet ex dolor sunt enim aliquip. Nulla.
  </div>
</div>
```

<!-- Cool styling example -->

Basic styling via props.

```jsx
<Grid columns="1fr 1fr 15vmin" autoRows="minmax(50px, auto)" gap="3vw">
  <Grid.Item>
    Consequat ut pariatur nostrud qui laborum tempor adipisicing sit cillum.
    aute in pariatur. Veniam laboris ipsum velit laboris consectetur in
    exercitation excepteur adipisicing mollit.
  </Grid.Item>
  <Grid.Item backgroundColor="palevioletred" />
  <Grid.Item backgroundColor="palevioletred" />
  <Grid.Item backgroundColor="palevioletred" />
  <Grid.Item>
    Culpa adipisicing duis ut exercitation eiusmod sunt. Consectetur fugiat amet
    non irure occaecat in labore aute eiusmod exercitation non in ex. Deserunt
    commodo voluptate cupidatat cupidatat ea nisi laborum quis.
  </Grid.Item>
  <Grid.Item
    backgroundColor="palevioletred"
    fontSize="3em"
    area="2/1/2/5"
    textAlign="center"
  >
    CSS Grid
  </Grid.Item>
  <Grid.Item backgroundColor="palevioletred" />
  <Grid.Item backgroundColor="palevioletred" />
  <Grid.Item backgroundColor="palevioletred" />
  <Grid.Item area="1/2/1/3" backgroundColor="palevioletred">
    Veniam laboris ipsum velit.
  </Grid.Item>
</Grid>
```
