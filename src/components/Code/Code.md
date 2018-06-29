<!-- Description -->

Code works in two modes, for inline code and pre-formatted code blocks.
Use the `block` prop to change between modes.

<!-- Minimal JSX to showcase component -->

```jsx
<Code>Code by itself will be inline</Code>
```

Rendered HTML.

```html
<code class="Base-gxTqDr bCPnxv Code-gIZKDq exlYBz">Inline code by itself</code>
```

Inline Code inside a Paragraph.

```jsx
const { Paragraph } = require("reas");
<Paragraph>
  <Code>let foo = "bar"</Code> will define foo as a block-scoped variable.
</Paragraph>;
```

<!-- while(not done) { Prop explanation, examples } -->

Code in block mode.

```jsx
<Code block>
  {`//for example:
let foo = 99

if (true) {
  let foo = 2
  //logs "2"
  console.log(foo)
}

//logs "99"
console.log(foo)
`}
</Code>
```

<!-- Cool styling example -->

Basic styling via props.

```jsx
<Code
  block
  color="rgb(18.5%, 90.5%, 15.4%)"
  backgroundColor="rgb(7.6%, 22.5%, 21.7%)"
>
  {`//es6 sample syntax

const foo = () => bar.map(b => b.toUpperCase())
  `}
</Code>
```
