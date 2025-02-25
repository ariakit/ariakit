<h1 align="center">Ariakit</h1>

<p align="center">
  Toolkit for building accessible web apps with <a href="https://www.solidjs.com">Solid</a>.
  <br>
  <a href="https://solid.ariakit.org"><strong>Explore website »</strong></a>
</p>

<br>

<div align="center">
  <a href="https://npmjs.org/package/@ariakit/solid">
    <img alt="NPM version" src="https://img.shields.io/npm/v/@ariakit/solid.svg?logo=npm&color=007acc" />
  </a>
  <a href="https://github.com/ariakit/ariakit/releases">
    <img alt="GitHub Release Date" src="https://img.shields.io/github/release-date/ariakit/ariakit?logo=github&color=007acc">
  </a>
  <a href="https://github.com/ariakit/ariakit/discussions">
    <img alt="GitHub Discussions" src="https://img.shields.io/github/discussions/ariakit/ariakit?logo=github&color=007acc">
  </a>
  <br>
  <a href="https://npmjs.org/package/@ariakit/solid">
    <img alt="NPM downloads" src="https://img.shields.io/npm/dm/@ariakit/solid.svg?logo=npm&style=social">
  </a>
  &nbsp;
  <a href="https://github.com/ariakit/ariakit/stargazers">
    <img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/ariakit/ariakit?style=social">
  </a>
  &nbsp;
  <a href="https://bsky.app/profile/ariakit.org">
    <img alt="Follow Ariakit on Bluesky" src="https://img.shields.io/badge/Bluesky-0285FF?logo=bluesky&logoColor=fff">
  </a>
  &nbsp;
  <a href="https://discord.gg/WyHvnXsvMs">
    <img alt="Join the Ariakit Discord server" src="https://img.shields.io/badge/Discord-%235865F2.svg?&logo=discord&logoColor=white">
  </a>
</div>

<br>

## Installation

npm:

```
npm i @ariakit/solid
```

pnpm:

```
pnpm add @ariakit/solid
```

Yarn:

```
yarn add @ariakit/solid
```

## Usage

  <!-- TODO: make sure the example is accurate once these components are implemented -->

```jsx
import { createSignal } from "solid-js";
import { render } from "solid-js/web";
import { Button, Dialog, DialogHeading } from "@ariakit/solid";

function App() {
  const [open, setOpen] = createSignal(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open dialog</Button>
      <Dialog open={open()} onClose={() => setOpen(false)}>
        <DialogHeading>Ariakit</DialogHeading>
        <p>Welcome to Ariakit!</p>
      </Dialog>
    </>
  );
}

render(() => <App />, document.getElementById("root")!);
```

## Core Team

- [Diego Haz](https://bsky.app/profile/haz.dev)
- [Ben Rodri](https://bsky.app/profile/ben.ariakit.org)
- [Dani Guardiola](https://bsky.app/profile/dio.la)

## Attribution

Browser testing provided by
<a href="https://www.browserstack.com" target="_blank"><img src="https://user-images.githubusercontent.com/15015324/45184727-368fbf80-b1fe-11e8-8827-08dbc80b0fb1.png" height="80" align="center"></a>

## Contributing

Follow the instructions on the [contributing guide](https://github.com/ariakit/ariakit/blob/main/contributing.md).
