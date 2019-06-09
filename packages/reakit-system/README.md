# reakit-system

<a href="https://npmjs.org/package/reakit-system"><img alt="NPM version" src="https://img.shields.io/npm/v/reakit-system.svg?style=flat-square" /></a>

> **This is experimental** and may have breaking changes in minor versions.

## Installation

npm:
```sh
npm i reakit-system
```

Yarn:
```sh
yarn add reakit-system
```

## Usage

```jsx
import { useBox } from "reakit/Box";
import { createHook } from "reakit-system";

const useA = createHook({ name: "A", compose: useBox });
```

## License

MIT © [Diego Haz](https://github.com/diegohaz)
