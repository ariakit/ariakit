Code works in two modes, for inline code and pre-formatted code blocks. Use the `block` prop to change between modes.

```jsx
<Code>Code by itself will be inline</Code>
```

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
