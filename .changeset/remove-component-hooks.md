---
"@ariakit/react": minor
---

We've made changes to the package structure, and component hooks such as `useButton` and `useCheckbox` are no longer exported from `@ariakit/react`. Instead, you can import them from `@ariakit/react-core`:

```diff
- import { useButton } from "@ariakit/react";
+ import { useButton } from "@ariakit/react-core/button/button";
```

By doing so, we can reduce the API surface of the `@ariakit/react` package and move towards a stable release. It's important to note that `@ariakit/react-core` does not follow semver conventions, and breaking changes may be introduced in minor and patch versions.
