# @ariakit/solid-store

**Important:** This package is an internal dependency of Ariakit and does not follow semantic versioning, meaning breaking changes may occur in patch and minor versions. You probably want to use [`@ariakit/react`](https://npmjs.org/package/@ariakit/react) instead.

Solid-facing entrypoint for Ariakit store primitives. This package currently re-exports the framework-agnostic store helpers from `@ariakit/store`.

```sh
npm i @ariakit/solid-store
```

Import store helpers from the package root:

```ts
import { createStore } from "@ariakit/solid-store";
```

This package is ESM-only and exposes a single public entrypoint. Ariakit development tooling can resolve source files through the `ariakit-source` export condition.
