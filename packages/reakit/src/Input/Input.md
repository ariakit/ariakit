By default renders as an `<input>` of `type="text"`.

```jsx
<Input />
```

A `select`:

```jsx
<Input use="select">
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

`use="textarea"`:
```jsx
<Input use="textarea" />
```
