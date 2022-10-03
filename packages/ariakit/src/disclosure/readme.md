# Disclosure

<p data-description>
  Click on a button to <a href="/api-reference/disclosure-state#show"><code>show</code></a> (expand, open) or <a href="/api-reference/disclosure-state#hide"><code>hide</code></a> (collapse, close) a content element in React. This component is based on the <a href="https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/">WAI-ARIA Disclosure Pattern</a>.
</p>

<a href="./__examples__/disclosure/index.tsx" data-playground>Example</a>

## Installation

```sh
npm install ariakit
```

Learn more in [Getting started](/guide/getting-started).

## API

<pre data-api>
<a href="/api-reference/disclosure-state">useDisclosureState</a>()

&lt;<a href="/api-reference/disclosure">Disclosure</a> /&gt;
&lt;<a href="/api-reference/disclosure-content">DisclosureContent</a> /&gt;
</pre>

## Styling

### Styling the expanded state

You can use the `aria-expanded` attribute to style the expanded state:

```css
.disclosure[aria-expanded="true"] {
  color: red;
}
```

Learn more in [Styling](/guide/styling).
