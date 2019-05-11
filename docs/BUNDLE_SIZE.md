---
path: /docs/bundle-size/
redirect_from:
  - /guide/bundle-size/
---

# Bundle size

You can use Reakit completely or only some of its modules according to your needs. Either way, your final bundle will include only the parts you're using. The whole library, including all dependencies, has around `20 kB` gzipped (check on [Bundlephobia](https://bundlephobia.com/result?p=reakit)). Each component has an average size of `1 kB`.

<carbon-ad></carbon-ad>

## Tree shaking

If you're using modern tooling, such as [webpack](https://webpack.js.org/), [create-react-app](https://github.com/facebook/create-react-app) and similars, you already have tree shaking set up.

> Tree shaking or dead code elimination means that unused modules will not be included in the bundle during the build process.
>
> [Learn more](https://medium.com/@netxm/what-is-tree-shaking-de7c6be5cadd)

In the below example, only [Button](/docs/button/), [Popover](/docs/popover/) and their dependencies will be included in your final bundle:

```js static
import { Button, Popover } from "reakit";
```

## Separate files

Reakit also exposes separate files for each module. If you can't do tree shaking and/or are building an open source library based on Reakit, you should import files directly:

```js
import { Button } from "reakit/Button";
import { Popover } from "reakit/Popover";
```

If the app consuming your library doesn't support tree shaking, only the files you imported will be included in the user's bundle.

It's also safe to combine both methods:

```jsx
import { Button } from "reakit";
import { Button as Button2 } from "reakit/Button";

function Example() {
  return Button === Button2 ? "They are the same" : "They are different";
}
```
