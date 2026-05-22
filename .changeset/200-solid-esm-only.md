---
"@ariakit/solid": minor
---

Removed CommonJS builds

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
