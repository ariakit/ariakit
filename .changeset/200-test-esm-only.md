---
"@ariakit/test": minor
---

Removed CommonJS builds

**BREAKING** if your code loads `@ariakit/test` with CommonJS `require()`.

`@ariakit/test` now publishes ESM-only exports.

Before:

```js
const test = require("@ariakit/test");
```

After:

```js
import * as test from "@ariakit/test";
```
