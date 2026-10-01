# @ariakit/solid-utils

**Important:** This package is an internal dependency of Ariakit and does not follow semantic versioning, meaning breaking changes may occur in patch and minor versions.

Shared Solid utilities used by Ariakit Solid packages.

## Contents

- [Installation](#installation)
- [API reference](#api-reference)

## Installation

```sh
npm i @ariakit/solid-utils
```

## Development status

The implementation on `solid-reboot` is being rebuilt from scratch for Solid 2. This package contains the initial rendering system; component hooks and prop composition are still being developed. Follow [Ariakit Solid #7687](https://github.com/ariakit/ariakit/issues/7687) for progress.

<!-- ariakit-docs:start -->

## API reference

- [`createElement`](#createelement)
- [`HTMLProps`](#htmlprops)
- [`RenderProp`](#renderprop)
- [`WrapElement`](#wrapelement)
- [`Options`](#options)
- [`Props`](#props)

### `createElement`

```ts
function createElement<T extends ValidComponent>(
  Type: T,
  props: Props<T>,
): import("@solidjs/web").JSX.Element;
```

Renders an element with live props, an optional render callback, and a lazy wrapper. Unlike React elements, Solid JSX has already been instantiated; element substitution therefore uses a callback in this initial contract.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

### `HTMLProps`

```ts
type HTMLProps<T extends ValidComponent> = ComponentProps<T> & {
  [key: `data-${string}`]: unknown;
};
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

### `RenderProp`

```ts
type RenderProp<T extends ValidComponent> = (
  props: HTMLProps<T>,
) => JSX.Element;
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

### `WrapElement`

```ts
type WrapElement = (element: () => JSX.Element) => JSX.Element;
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

### `Options`

```ts
interface Options<T extends ValidComponent> {
  render?: RenderProp<T>;
  wrapElement?: WrapElement;
}
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

### `Props`

```ts
type Props<T extends ValidComponent> = HTMLProps<T> & Options<T>;
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

<!-- ariakit-docs:end -->
