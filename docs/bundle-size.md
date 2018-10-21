You can use Reakit completely or only some of its modules according to your needs. Either way, your final bundle will include only the parts you're using.

## Tree shaking

If you're using modern tooling, such as [webpack](https://webpack.js.org/), [create-react-app](https://github.com/facebook/create-react-app) and similars, you already have tree shaking set up.

> Tree shaking or dead code elimination means that unused modules will not be included in the bundle during the build process.
>
> [Learn more](https://medium.com/@netxm/what-is-tree-shaking-de7c6be5cadd)

In the below example, only [use](use.md), [Button](../packages/reakit/src/Button/Button.md), [Popover](../packages/reakit/src/Popover/Popover.md) and their dependencies will be included in your final bundle:

```js static
import { use, Button, Popover } from "reakit";
```

## Separate files

Reakit also exposes separate files for each module. If you can't do tree shaking and/or are building an open source library based on Reakit, you should import files directly:

```js static
import use from "reakit/use";
import Button from "reakit/Button";
import Popover from "reakit/Popover";
```

If the app consuming your library doesn't support tree shaking, only the files you imported will be included in the user's bundle.

It's also safe to combine both methods:

```js static
import { Button } from "reakit";
import Button2 from "reakit/Button";

console.log(Button === Button2); // true
```
