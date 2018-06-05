<!-- Description -->

Label renders by default as a `<label>` tag with `display: inline-block`.

<!-- Minimal JSX to showcase component -->

```jsx
const { Input } = require("reas");

<Label>
  Try it<Input />
</Label>;
```

Rendered HTML.

```html
<label class="Base-gxTqDr bCPnxv Label-bxMjsr cAGeQq">
  Try it
  <input class="Base-gxTqDr bCPnxv Input-hxTtdt edhqsy Box-cwadsP gAhprV" type="text">
</label>
```

With `type="checkbox"` on the Input.

```jsx
const { Input } = require("reas");

<Label>
  <Input type="checkbox" /> Option 1
</Label>;
```

With `type="radio"` on the Input.

```jsx
const { Input } = require("reas");

<Label>
  <Input type="radio" /> Choice 1
</Label>;
```

Basic styling via props.

```jsx
<Label backgroundColor="#f0f0f0" fontStyle="italic">
  <Input type="checkbox"/> Checko
</Label>;
```
