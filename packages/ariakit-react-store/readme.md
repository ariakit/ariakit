# @ariakit/react-store

**Important:** This package is an internal dependency of Ariakit and does not follow semantic versioning, meaning breaking changes may occur in patch and minor versions. You probably want to use [`@ariakit/react`](https://npmjs.org/package/@ariakit/react) instead.

React bindings for Ariakit store primitives.

```sh
npm i @ariakit/react-store
```

Import store hooks from the package root:

```ts
import { useStoreState } from "@ariakit/react-store";
```

This package is ESM-only and exposes a single public entrypoint. Ariakit development tooling can resolve source files through the `ariakit-source` export condition.
