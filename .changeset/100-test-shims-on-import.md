---
"@ariakit/test": minor
---

Applied the browser shims for the whole test environment

**BREAKING** if you import helpers from individual subpaths such as `@ariakit/test/click`.

`@ariakit/test` now exposes only the `@ariakit/test`, `@ariakit/test/react`, and `@ariakit/test/playwright` entry points; the individual helper subpaths have been removed. Import the helpers from the root `@ariakit/test` instead.

Before:

```ts
import { click } from "@ariakit/test/click";
```

After:

```ts
import { click } from "@ariakit/test";
```

`@ariakit/test` installs browser shims (most importantly a `getClientRects` visibility shim that jsdom lacks). They were only active while a simulated interaction ran, but component code reads layout and focusability between interactions too — for example a dialog's auto-focus picks the first tabbable element with `getFirstTabbableIn`, which depends on `getClientRects`. When such a read ran outside an interaction (e.g. when asserting with `expect.poll`), it hit jsdom's empty layout and misbehaved. The shims now apply for the whole test environment, and are applied automatically when importing `@ariakit/test` or `@ariakit/test/react`.
