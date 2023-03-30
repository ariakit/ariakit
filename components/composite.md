# Composite

<p data-description>
  Provide a single tab stop on the page and navigate through the focusable descendants with arrow keys. This abstract component is based on the <a href="https://w3c.github.io/aria/#composite">WAI-ARIA Composite Role</a>.
</p>

## Installation

```sh
npm install ariakit
```

Learn more in [Getting started](/guide/getting-started).

## API

<pre data-api>
<a href="/apis/composite-store">useCompositeStore</a>()

&lt;<a href="/apis/composite">Composite</a>&gt;
  &lt;<a href="/apis/composite-group">CompositeGroup</a>&gt;
    &lt;<a href="/apis/composite-group-label">CompositeGroupLabel</a> /&gt;
    &lt;<a href="/apis/composite-row">CompositeRow</a>&gt;
      &lt;<a href="/apis/composite-container">CompositeContainer</a> /&gt;
      &lt;<a href="/apis/composite-hover">CompositeHover</a> /&gt;
      &lt;<a href="/apis/composite-input">CompositeInput</a> /&gt;
      &lt;<a href="/apis/composite-item">CompositeItem</a> /&gt;
      &lt;<a href="/apis/composite-separator">CompositeSeparator</a> /&gt;
    &lt;/CompositeRow&gt;
  &lt;/CompositeGroup&gt;
&lt;/Composite&gt;
&lt;<a href="/apis/composite-typeahead">CompositeTypeahead</a> /&gt;
</pre>
