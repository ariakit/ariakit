<!-- Description -->

Input is built from Box with minimal default styles to support the many possible uses an input has.
By default renders as an `<input>` of `type="text"`.

<!-- Minimal JSX to showcase component -->

```jsx
<Input />
```

Rendered HTML.

```html
<input class="Input-hxTtdt edhqsy Box-cwadsP gAhprV Base-gxTqDr bCPnxv" type="text">
```

`placeholder` prop.

```jsx
<Input placeholder="What is your favorite movie?" />
```

`disabled` prop.

```jsx
<Input disabled placeholder="Unavailable" />
```

`as="select"` with `<option>` children.

```jsx
<Input as="select">
  <option>Hi</option>
  <option>Hello</option>
  <option>Olá</option>
</Input>
```

`type="checkbox"` prop.

```jsx
<label>
  <Input type="checkbox" /> Choose any
</label>
```

`type="radio"` prop.
```jsx
<label>
  <Input type="radio" /> Choose one
</label>
```

`as="textarea"` prop.
```jsx
<Input as="textarea" />
```
Basic styling via props.

```jsx
<Input
  backgroundColor="palevioletred"
  color="white"
  placeholder="How many roses?"
/>
```
