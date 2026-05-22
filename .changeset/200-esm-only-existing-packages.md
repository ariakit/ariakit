---
"@ariakit/solid": minor
"@ariakit/test": minor
---

Removed CommonJS builds from these packages. They now publish ESM-only exports with the `ariakit-source` condition.

**BREAKING** if your code loads these packages with CommonJS `require()`.

Before:

```js
const Ariakit = require("@ariakit/solid");
const test = require("@ariakit/test");
```

After:

```js
import * as Ariakit from "@ariakit/solid";
import * as test from "@ariakit/test";
```
