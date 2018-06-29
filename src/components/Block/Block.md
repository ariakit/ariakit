<!-- Description -->

Block is Base with `display: block`.
By default it renders as a `<div>`.

<!-- Minimal JSX to showcase component -->

```jsx
<div>
  <Block
    width="100px"
    height="100px"
    backgroundColor="rgb(219, 112, 147)"
  />
  <Block
    width="100px"
    height="100px"
    backgroundColor="rgb(219, 112, 198)"
  />
  <Block
    width="100px"
    height="100px"
    backgroundColor="rgb(205, 112, 219)"
  />
</div>
```

Rendered HTML.

```html
<div>
  <div class="Block-jzkjxj ffjSwg Base-gxTqDr bCPnxv" style="width: 100px; height: 100px; background-color: rgb(219, 112, 147);">
  </div>
  <div class="Block-jzkjxj ffjSwg Base-gxTqDr bCPnxv" style="width: 100px; height: 100px; background-color: rgb(219, 112, 198);">
  </div>
  <div class="Block-jzkjxj ffjSwg Base-gxTqDr bCPnxv" style="width: 100px; height: 100px; background-color: rgb(205, 112, 219);">
  </div>
</div>
```

<!-- while(not done) { Prop explanation, examples } -->

Basic styling via props.

```jsx
<Block border="2px dashed black" color="brown" textAlign="center">
  Blocky
</Block>
```

<!-- Cool styling example -->
