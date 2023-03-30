# Dialog with details &amp; summary

<p data-description>
  Combining <a href="/components/dialog">Dialog</a> with the native <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details">details element</a> in React so users can interact with it before JavaScript finishes loading.
</p>

<div class="warning">

**Before you use this example**

This is not the best way to make modal dialogs accessible without JavaScript. Consider using [Dialog with React Router](/examples/dialog-react-router) instead.

</div>

Try it by hard-refreshing this page. Then click on the `Show modal` button below before JavaScript finishes loading.

<a href="./index.tsx" data-playground>Example</a>

## Styling

### Resetting the default styles

By default, browsers apply some default styles to the `details` element. We can reset them with the following CSS:

```css
.button {
  appearance: none;
}

.button::marker,
.button::-webkit-details-marker {
  display: none;
}
```

### Fixing the layout shift

Since we're changing between non-modal and [`modal`](/apis/dialog#modal) states and, therefore, between non-portal and [`portal`](/apis/dialog#portal) dialogs right after it's shown, there may be a layout shift if the browser has visible scrollbars.

To fix this, we can use the `--scrollbar-width` CSS variable:

```css
.dialog {
  margin-left: calc(var(--scrollbar-width, 0) * -0.5);
}
```

Learn more in [Styling](/guide/styling).
