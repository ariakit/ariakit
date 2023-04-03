# Getting started

<p data-description>
  Ariakit is an open source library that provides lower-level <a href="https://reactjs.org">React</a> components and hooks for building accessible web apps, design systems, and component libraries.
</p>

## Installation

First, make sure you have `react` and `react-dom` installed. Ariakit works with React 17 and above.

```sh
npm i react react-dom
```

Then, install Ariakit:

```sh
npm i @ariakit/react
```

## Usage

<div class="note">

[Play with Ariakit on CodeSandbox](https://codesandbox.io/s/m4n32vjkoj)

</div>

Ariakit exports a set of [unstyled](/guide/styling) React components and hooks that you can use to build accessible web apps. For example, you can use the [Button](/components/button) component to create a button:

<a href="../examples/button/index.tsx" data-playground type="compact">Example</a>

## CDN

<div class="note">

[Play with Ariakit on JSBin](https://jsbin.com/tolamacagu/edit?html,output)

</div>

You can also use Ariakit directly in the browser via a CDN. This method is only for development purposes and is not recommended for production.

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>Reakit</title>
  </head>
  <body>
    <div id="root"></div>
    <!-- Babel -->
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <!-- Ariakit peer dependencies -->
    <script src="https://unpkg.com/react/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom/umd/react-dom.development.js"></script>
    <!-- Ariakit UMD package -->
    <script src="https://unpkg.com/ariakit"></script>
    <!-- Usage -->
    <script type="text/babel">
      const { Button } = Ariakit;

      function App() {
        return <Button>Button</Button>;
      }

      ReactDOM.createRoot(document.getElementById("root")).render(<App />);
    </script>
  </body>
</html>
```
