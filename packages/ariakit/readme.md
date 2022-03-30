<h1 align="center">Ariakit</h1>

<p align="center">
  Toolkit for building <a href="https://ariakit.org/guide/accessibility">accessible</a> web apps with <a href="https://reactjs.org">React</a>.
  <br>
  <a href="https://ariakit.org"><strong>Explore website »</strong></a>
</p>

<br>

<p align="center">
  <a href="https://npmjs.org/package/ariakit"><img alt="NPM version" src="https://img.shields.io/npm/v/ariakit.svg" /></a>
  <a href="https://npmjs.org/package/ariakit"><img alt="NPM downloads" src="https://img.shields.io/npm/dm/ariakit.svg"></a>
  <a href="https://github.com/ariakit/ariakit/actions"><img alt="Build Status" src="https://github.com/ariakit/ariakit/workflows/ci/badge.svg?event=push&branch=main" /></a>
  <a href="https://codecov.io/gh/ariakit/ariakit"><img src="https://codecov.io/gh/ariakit/ariakit/branch/main/graph/badge.svg" /></a><br>
  <a href="https://opencollective.com/ariakit"><img alt="Sponsors" src="https://opencollective.com/ariakit/sponsor/badge.svg?label=sponsors" /></a>
  <a href="https://opencollective.com/ariakit"><img alt="Backers" src="https://opencollective.com/ariakit/backer/badge.svg?label=backers" /></a>
  <a href="https://twitter.com/ariakitjs">
    <img alt="Follow Ariakit on Twitter" src="https://img.shields.io/twitter/follow/ariakitjs.svg"></a>
</p>

> If you're looking for v1, check out [v1](https://github.com/ariakit/ariakit/tree/v1) branch.

## Installation

npm:

```
npm i ariakit
```

Yarn:

```
yarn add ariakit
```

## Usage

```jsx
import { createRoot } from "react-dom/client";
import {
  Button,
  Dialog,
  DialogHeading,
  DialogDescription,
  useDialogState,
} from "ariakit";

function App() {
  const dialog = useDialogState();
  return (
    <>
      <Button onClick={dialog.toggle}>Open dialog</Button>
      <Dialog state={dialog}>
        <DialogHeading>Welcome</DialogHeading>
        <DialogDescription>Welcome to Reakit!</DialogDescription>
      </Dialog>
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
```
