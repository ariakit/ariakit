# @ariakit/solid-store

Solid-facing entrypoint for Ariakit store primitives. This package currently re-exports the framework-agnostic store helpers from `@ariakit/store`.

```sh
npm i @ariakit/solid-store
```

Import store helpers from the package root:

```ts
import { createStore } from "@ariakit/solid-store";
```

This package is ESM-only and exposes a single public entrypoint. Ariakit development tooling can resolve source files through the `ariakit-source` export condition.
