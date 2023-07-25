# Getting started

<p data-description>
  Ariakit is an open source library that provides lower-level <a href="https://reactjs.org">React</a> components and hooks for building accessible web apps, design systems, and component libraries.
</p>

## Installation

1. First, make sure you have `react` and `react-dom` installed. Ariakit works with React v17 and above.

2. Then, install Ariakit using your package manager of choice:

    ```sh
    npm install @ariakit/react
    ```

    ```sh
    yarn add @ariakit/react
    ```

    ```sh
    pnpm add @ariakit/react
    ```

## Usage

Ariakit exports a set of [unstyled](/guide/styling) React components and hooks that you can use to build accessible web apps. For example, you can use the [Button](/components/button) component to create a button:

<a href="../../examples/button/index.tsx" data-playground type="compact">Example</a>

## CDN

You can also use Ariakit directly in the browser via a CDN. This method is only for development purposes and is not recommended for production.

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>Ariakit</title>
  </head>
  <body>
    <div id="root"></div>
    <!-- Babel -->
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <!-- Usage -->
    <script type="text/babel" data-type="module">
      import * as React from "https://esm.sh/react";
      import { createRoot } from "https://esm.sh/react-dom";
      import { Button } from "https://esm.sh/@ariakit/react";

      function App() {
        return <Button>Button</Button>;
      }

      createRoot(document.getElementById("root")).render(<App />);
    </script>
  </body>
</html>
```


## Next steps

Continue reading our [Guide](/guide) to learn more about Ariakit:

<div data-cards>

- [](/guide/styling)
- [](/guide/composition)

</div>

Check out our [Components](/components), [Examples](/examples), and [API Reference](/reference) pages for more information.
