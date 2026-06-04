---
"@ariakit/test": patch
---

Removed the Testing Library dependency

`@ariakit/test` now ships its own implementations of the DOM query (`q`/`query`), event (`dispatch`), `waitFor`, and `render` utilities it previously imported from Testing Library. Installing `@ariakit/test` no longer pulls in `@testing-library/dom`, and `@testing-library/react` is no longer a peer dependency. `react-dom` is now an optional peer dependency, used by the `@ariakit/test/react` entry point.

The public API is unchanged and behavior is preserved for the components and queries these utilities target. If your tests import `@testing-library/dom` or `@testing-library/react` directly, add them to your own dependencies, as they're no longer installed through `@ariakit/test`.
