# Disclosure

<p data-description>
  Click on a button to <a href="/apis/disclosure-store#show"><code>show</code></a> (expand, open) or <a href="/apis/disclosure-store#hide"><code>hide</code></a> (collapse, close) a content element in React. This component is based on the <a href="https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/">WAI-ARIA Disclosure Pattern</a>.
</p>

<a href="../examples/disclosure/index.tsx" data-playground>Example</a>

## Installation

```sh
npm i @ariakit/react
```

Learn more on the [Getting started](/guide/getting-started) guide.

## API

<pre data-api>
<a href="/apis/disclosure-store">useDisclosureStore</a>()

&lt;<a href="/apis/disclosure">Disclosure</a> /&gt;
&lt;<a href="/apis/disclosure-content">DisclosureContent</a> /&gt;
</pre>

## Styling

### Styling the expanded state

You can use the `aria-expanded` attribute to style the expanded state:

```css
.disclosure[aria-expanded="true"] {
  color: red;
}
```

Learn more on the [Styling](/guide/styling) guide.
