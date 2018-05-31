<!-- Description -->

Inline is Base with `display: inline-block`.
By default it renders as a `<div>`.

<!-- Minimal JSX to showcase component -->

```jsx
<div>
  <InlineBlock
    width="100px"
    height="100px"
    backgroundColor="rgb(219, 112, 147)"
  />
  <InlineBlock
    width="100px"
    height="100px"
    backgroundColor="rgb(219, 112, 198)"
  />
  <InlineBlock
    width="100px"
    height="100px"
    backgroundColor="rgb(205, 112, 219)"
  />
</div>
```

Rendered HTML.

```html
<div>
  <div class="InlineBlock-jzkjxj ffjSwg Base-gxTqDr bCPnxv" style="width: 100px; height: 100px; background-color: rgb(219, 112, 147);">
  </div>
  <div class="InlineBlock-jzkjxj ffjSwg Base-gxTqDr bCPnxv" style="width: 100px; height: 100px; background-color: rgb(219, 112, 198);">
  </div>
  <div class="InlineBlock-jzkjxj ffjSwg Base-gxTqDr bCPnxv" style="width: 100px; height: 100px; background-color: rgb(205, 112, 219);">
  </div>
</div>
```

<!-- Cool styling example -->

Basic styling via props.

```jsx
<div>
  <InlineBlock fontSize="3em" border="1px solid palevioletred">
    ⭐️
  </InlineBlock>
  <InlineBlock fontSize="3em" border="1px solid palevioletred">
    💫
  </InlineBlock>
  <InlineBlock fontSize="3em" border="1px solid palevioletred">
    🌙
  </InlineBlock>
</div>
```
