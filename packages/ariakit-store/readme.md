# @ariakit/store

**Important:** This package is experimental and does not follow semantic versioning, meaning breaking changes may occur in patch and minor versions.

Framework-agnostic store primitives used by Ariakit packages.

```sh
npm i @ariakit/store
```

Import store helpers from the package root:

```ts
import { createStore } from "@ariakit/store";
```

This package is ESM-only and exposes a single public entrypoint. Ariakit development tooling can resolve source files through the `ariakit-source` export condition.
