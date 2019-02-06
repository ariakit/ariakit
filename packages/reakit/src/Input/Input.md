By default renders as an `<input>` of `type="text"`.

```jsx
import { Input } from "reakit";

<Input />
```

A `select`:

```jsx
import { Input } from "reakit";

<Input use="select">
  <option>Hi</option>
  <option>Hello</option>
</Input>
```

`type="checkbox"`:

```jsx
import { Input } from "reakit";

<label>
  <Input type="checkbox" /> Choose any
</label>
```

`type="radio"`:
```jsx
import { Input } from "reakit";

<label>
  <Input type="radio" /> Choose one
</label>
```

`use="textarea"`:
```jsx
import { Input } from "reakit";

<Input as="textarea" />
```
