<!-- Description -->

Button is extremely useful and versatile. It is built from Box with sane default styles to expect from a button.

<!-- Minimal JSX to showcase component -->

```jsx
<Button>Ok</Button>
```

Rendered HTML.

```html
<div class="Button-kDSBcD eMpnqe Box-cwadsP gAhprV Base-gxTqDr bCPnxv" role="button" tabindex="0">Ok</div>
```

<!-- while(not done) { Prop explanation, examples } -->

Use `disabled` prop to make a non-interactive button.

```jsx
<Button disabled>Button</Button>
```

Here we use `as="a"` to render the Button as an `<a>`, and give it an `href` pointing to this site.
__*Clicking will open a tab!*__

```jsx
<Button as="a" href="https://reas.js.org" target="_Blank">
  Go to Website
</Button>
```

An example of integrating `react-icons` into `reas`.

```jsx
const FaBeer = require("react-icons/lib/fa/beer");

<Button>
  <FaBeer />Beer
</Button>;
```

Here the `as` is set to `select`, making an `<option>` pop up.

```jsx
<Button as="select">
  <option>Select</option>
</Button>
```

How to use `reas`'s Shadow with Button.

```jsx
const { Shadow } = require("reas");

<Button>
  Button <Shadow />
</Button>;
```
