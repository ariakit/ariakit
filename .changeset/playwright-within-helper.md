---
"@ariakit/test": patch
---

Added support for scoping nested Playwright queries with `within` in [`@ariakit/test`](https://ariakit.org), so queries like `q.within.dialog("Filters").option("Open")` can be written without manually creating a new query object.
