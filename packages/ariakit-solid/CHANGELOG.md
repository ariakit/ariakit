# @ariakit/solid

## 0.2.5

- Updated dependencies: `@ariakit/solid-components@0.1.5`

## 0.2.4

- Fixed [`Group`](https://ariakit.com/reference/group) to ignore its internal [`GroupLabel`](https://ariakit.com/reference/group-label) reference when `aria-label` is passed.
- Updated dependencies: `@ariakit/solid-components@0.1.4`

## 0.2.3

- Updated [`VisuallyHidden`](https://ariakit.com/reference/visually-hidden) to hide content with the modern `clip-path: inset(50%)` technique instead of the deprecated `clip` property. The same technique now applies to the other elements Ariakit hides visually, such as the [`Select`](https://ariakit.com/reference/select) value mirror and the [`Dialog`](https://ariakit.com/reference/dialog) dismiss button.
- Updated dependencies: `@ariakit/solid-components@0.1.3`

## 0.2.2

- Fixed runtime `process.env.NODE_ENV` checks in published package output, including test-only behavior and development warnings.
- Updated dependencies: `@ariakit/solid-components@0.1.2`

## 0.2.1

- Release artifacts now include npm trusted publishing provenance.
- Updated dependencies: `@ariakit/solid-components@0.1.1`

## 0.2.0

### Removed CommonJS builds

**BREAKING** if your code loads `@ariakit/solid` with CommonJS `require()`.

`@ariakit/solid` now publishes ESM-only exports.

Before:

```js
const Ariakit = require("@ariakit/solid");
```

After:

```js
import * as Ariakit from "@ariakit/solid";
```

### Other updates

- Updated dependencies: `@ariakit/solid-components@0.1.0`

## 0.1.6

- Updated dependencies: `@ariakit/solid-core@0.1.6`

## 0.1.5

- Updated dependencies: `@ariakit/solid-core@0.1.5`

## 0.1.4

- Updated dependencies: `@ariakit/solid-core@0.1.4`

## 0.1.3

- Updated packages to target ES2018 (previously ES2017).
- Updated dependencies: `@ariakit/solid-core@0.1.3`

## 0.1.2

- Updated dependencies: `@ariakit/solid-core@0.1.2`

## 0.1.1

- Updated dependencies: `@ariakit/solid-core@0.1.1`

## 0.1.0

- Initial release.
- Updated dependencies: `@ariakit/solid-core@0.1.0`
