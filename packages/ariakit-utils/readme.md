# @ariakit/utils

**Important:** This package is an internal dependency of Ariakit and does not follow semantic versioning, meaning breaking changes may occur in patch and minor versions. You probably want to use [`@ariakit/react`](https://npmjs.org/package/@ariakit/react) instead.

Shared framework-agnostic utilities used by Ariakit packages.

```sh
npm i @ariakit/utils
```

Import helpers from the package root:

```ts
import { invariant } from "@ariakit/utils";
```

This package is ESM-only and exposes a single public entrypoint. Ariakit development tooling can resolve source files through the `ariakit-source` export condition.
