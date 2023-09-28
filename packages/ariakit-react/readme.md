<h1 align="center">Ariakit</h1>

<p align="center">
  Toolkit for building accessible web apps with <a href="https://reactjs.org">React</a>.
  <br>
  <a href="https://ariakit.org"><strong>Explore website »</strong></a>
</p>

<br>

<div align="center">
  <a href="https://npmjs.org/package/@ariakit/react">
    <img alt="NPM version" src="https://img.shields.io/npm/v/@ariakit/react.svg?logo=npm&color=007acc" />
  </a>
  <a href="https://github.com/ariakit/ariakit/releases">
    <img alt="GitHub Release Date" src="https://img.shields.io/github/release-date/ariakit/ariakit?logo=github&color=007acc">
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

## Installation

npm:

```
npm i @ariakit/react
```

pnpm:

```
pnpm add @ariakit/react
```

Yarn:

```
yarn add @ariakit/react
```

## Usage

```jsx
import { createRoot } from "react-dom/client";
import * as Ariakit from "@ariakit/react";

function App() {
  const dialog = Ariakit.useDialogStore();
  return (
    <>
      <Ariakit.Button onClick={dialog.toggle}>Open dialog</Ariakit.Button>
      <Ariakit.Dialog store={dialog}>
        <Ariakit.DialogHeading>Welcome</Ariakit.DialogHeading>
        <Ariakit.DialogDescription>
          Welcome to Ariakit!
        </Ariakit.DialogDescription>
      </Ariakit.Dialog>
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
```

## Attribution

Browser testing provided by
<a href="https://www.browserstack.com" target="_blank"><img src="https://user-images.githubusercontent.com/15015324/45184727-368fbf80-b1fe-11e8-8827-08dbc80b0fb1.png" height="80" align="center"></a>

## Contributing

Follow the instructions on the [contributing guide](https://github.com/ariakit/ariakit/blob/main/contributing.md).
