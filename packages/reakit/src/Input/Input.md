By default renders as an `<input>` of `type="text"`.

```jsx
<Input />
```

A `select`:

```jsx
<Input as="select">
  <option>Hi</option>
  <option>Hello</option>
</Input>
```

`type="checkbox"`:

```jsx
<label>
  <Input type="checkbox" /> Choose any
</label>
```

`type="radio"`:
```jsx
<label>
  <Input type="radio" /> Choose one
</label>
```

`as="textarea"`:
```jsx
<Input as="textarea" />
```
