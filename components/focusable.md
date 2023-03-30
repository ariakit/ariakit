# Focusable

<p data-description>
  Click or press <kbd>Tab</kbd> to move focus to any React element using this abstract component that normalizes the focus behavior across browsers.
</p>

## Installation

```sh
npm install ariakit
```

Learn more in [Getting started](/guide/getting-started).

## API

<pre data-api>
&lt;<a href="/apis/focusable">Focusable</a> /&gt;
</pre>

## Styling

### Styling the focus-visible state

You can style the focus-visible state of `Focusable` elements using the `data-focus-visible` attribute. This is similar to the [:focus-visible pseudo-class](https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-visible), but it also supports [composite widgets](/components/composite) with [`virtualFocus`](/apis/composite-state#virtualfocus):

```css
.focusable[data-focus-visible] {
  outline: 2px solid red;
}
```

Alternatively, you can use the [`onFocusVisible`](/apis/focusable#onfocusvisible) prop to handle the state in JavaScript.

Learn more in [Styling](/guide/styling).
