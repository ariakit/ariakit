<h1 align="center">Ariakit</h1>

<p align="center">
  Toolkit for building <a href="https://ariakit.org/guide/accessibility">accessible</a> web apps with <a href="https://reactjs.org">React</a>.
  <br>
  <a href="https://ariakit.org"><strong>Explore website »</strong></a>
</p>

<br>

<p align="center">
  <a href="https://npmjs.org/package/ariakit">
    <img alt="NPM version" src="https://img.shields.io/npm/v/ariakit.svg?logo=npm&color=007acc" />
  </a>
  <a href="https://github.com/ariakit/ariakit/releases">
    <img alt="GitHub (Pre-)Release Date" src="https://img.shields.io/github/release-date-pre/ariakit/ariakit?logo=github&color=007acc">
  </a>
  <a href="https://github.com/ariakit/ariakit/discussions">
    <img alt="GitHub Discussions" src="https://img.shields.io/github/discussions/ariakit/ariakit?logo=github&color=007acc">
  </a>
  <br>
  <a href="https://npmjs.org/package/ariakit">
    <img alt="NPM downloads" src="https://img.shields.io/npm/dm/ariakit.svg?logo=npm&style=social">
  </a>
  &nbsp;
  <a href="https://github.com/ariakit/ariakit/stargazers">
    <img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/ariakit/ariakit?style=social">
  </a>
  &nbsp;
  <a href="https://twitter.com/ariakitjs">
    <img alt="Follow Ariakit on Twitter" src="https://img.shields.io/twitter/follow/ariakitjs.svg">
  </a>
</p>

> **Note**: This is the Ariakit (v2) branch <sup>[<a href="https://gist.github.com/diegohaz/bc07491aee61a5f2469574b38c5c1aa0">What is Ariakit?</a>]</sup>, which is still in alpha.
>
> If you're looking for Reakit (v1), check out the [v1](https://github.com/ariakit/ariakit/tree/v1) branch.

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
