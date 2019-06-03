# reakit-utils

<a href="https://npmjs.org/package/reakit-utils"><img alt="NPM version" src="https://img.shields.io/npm/v/reakit-utils.svg?style=flat-square" /></a>

> **This is experimental** and may have breaking changes in minor versions.

## Installation

npm:
```sh
npm i reakit-utils
```

Yarn:
```sh
yarn add reakit-utils
```

## Usage

```jsx
import { useBox } from "reakit/Box";
import { createHook } from "reakit-utils";

const useA = createHook({ name: "A", compose: useBox });
```

## License

MIT © [Diego Haz](https://github.com/diegohaz)
