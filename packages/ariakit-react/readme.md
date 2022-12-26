<h1 align="center">Ariakit</h1>

<p align="center">
  Toolkit for building <a href="https://ariakit.org/guide/accessibility">accessible</a> web apps with <a href="https://reactjs.org">React</a>.
  <br>
  <a href="https://ariakit.org"><strong>Explore website »</strong></a>
</p>

<br>

<div align="center">
  <a href="https://npmjs.org/package/@ariakit/react">
    <img alt="NPM version" src="https://img.shields.io/npm/v/@ariakit/react.svg?logo=npm&color=007acc" />
  </a>
  <a href="https://github.com/ariakit/ariakit/releases">
    <img alt="GitHub (Pre-)Release Date" src="https://img.shields.io/github/release-date-pre/ariakit/ariakit?logo=github&color=007acc">
  </a>
  <a href="https://github.com/ariakit/ariakit/discussions">
    <img alt="GitHub Discussions" src="https://img.shields.io/github/discussions/ariakit/ariakit?logo=github&color=007acc">
  </a>
  <br>
  <a href="https://npmjs.org/package/@ariakit/react">
    <img alt="NPM downloads" src="https://img.shields.io/npm/dm/@ariakit/react.svg?logo=npm&style=social">
  </a>
  &nbsp;
  <a href="https://github.com/ariakit/ariakit/stargazers">
    <img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/ariakit/ariakit?style=social">
  </a>
  &nbsp;
  <a href="https://twitter.com/ariakitjs">
    <img alt="Follow Ariakit on Twitter" src="https://img.shields.io/twitter/follow/ariakitjs.svg">
  </a>
</div>

<br>

---

<p align="center">
  This is the Ariakit (v2) branch (<a href="https://gist.github.com/diegohaz/bc07491aee61a5f2469574b38c5c1aa0">What is Ariakit?</a>), which is still in alpha.
  <br>
  If you're looking for Reakit (v1), check out the <a href="https://github.com/ariakit/ariakit/tree/v1">v1</a> branch.
</p>

---

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
  useDialogStore,
} from "@ariakit/react";

function App() {
  const dialog = useDialogStore();
  return (
    <>
      <Button onClick={dialog.toggle}>Open dialog</Button>
      <Dialog store={dialog}>
        <DialogHeading>Welcome</DialogHeading>
        <DialogDescription>Welcome to Reakit!</DialogDescription>
      </Dialog>
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
```

## Contributing

See [[v2] Examples](https://github.com/ariakit/ariakit/issues/939) and follow the instructions on the [contributing guide](https://github.com/ariakit/ariakit/blob/main/contributing.md).
