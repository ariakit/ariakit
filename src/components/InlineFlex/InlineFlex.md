<!-- Description -->

InlineFlex is Base with `display: inline-flex`.
By default it renders as a `<div>`.

<!-- Minimal JSX to showcase component -->

```jsx
<InlineFlex justifyContent="space-evenly" width="100%">
  <Block width="100px" height="100px" backgroundColor="rgb(219, 112, 147)" />
  <Block width="100px" height="100px" backgroundColor="rgb(219, 112, 198)" />
  <Block width="100px" height="100px" backgroundColor="rgb(205, 112, 219)" />
</InlineFlex>
```

Rendered HTML.

```html
<div class="InlineFlex-jGfABd kTZJoc Flex-kFpfAw hwskqf Base-gxTqDr bCPnxv" style="justify-content: space-evenly; width: 100%;">
  <div class="Block-euiAZJ tSBxN Base-gxTqDr bCPnxv" style="width: 100px; height: 100px; background-color: rgb(219, 112, 147);">
  </div>
  <div class="Block-euiAZJ tSBxN Base-gxTqDr bCPnxv" style="width: 100px; height: 100px; background-color: rgb(219, 112, 198);">
  </div>
  <div class="Block-euiAZJ tSBxN Base-gxTqDr bCPnxv" style="width: 100px; height: 100px; background-color: rgb(205, 112, 219);">
  </div>
</div>
```

<!-- Cool styling example -->

Basic styling via props.

```jsx
<div>
  <InlineFlex fontSize="3em">
    <Inline border="1px solid palevioletred">Normal</Inline>
    <Inline border="1px solid palevioletred">⭐️</Inline>
    <Inline border="1px solid palevioletred">💫</Inline>
    <Inline border="1px solid palevioletred">🌙</Inline>
  </InlineFlex>
  <InlineFlex fontSize="3em" flexDirection="row-reverse">
    <Inline border="1px solid palevioletred">Revers</Inline>
    <Inline border="1px solid palevioletred">⭐️</Inline>
    <Inline border="1px solid palevioletred">💫</Inline>
    <Inline border="1px solid palevioletred">🌙</Inline>
  </InlineFlex>
</div>
```
