# Command

<p data-description>
  Click with a mouse or keyboard to trigger an action. This abstract component is based on the <a href="https://w3c.github.io/aria/#command">WAI-ARIA Command Role</a>.
</p>

<a href="../examples/command/index.tsx" data-playground>Example</a>

## Installation

```sh
npm i @ariakit/react
```

Learn more in [Getting started](/guide/getting-started).

## API

<pre data-api>
&lt;<a href="/apis/command">Command</a> /&gt;
</pre>

## Command vs. Button

In short, if you need a semantic button element, you should use the [Button](/components/button) component.

The `Button` component uses `Command` underneath and inherits all its features, but `Button` automatically adds the `role="button"` attribute when necessary (for example, when [rendering a non-native button](/examples/button-as-div)).

If you need a clickable element with a different semantic role (e.g., `menuitem`), and you're not using the specific Ariakit component (e.g., [`MenuItem`](/apis/menu-item)), you can use `Command`.
