---
"@ariakit/react-core": minor
"@ariakit/react": minor
"@ariakit/core": minor
"@ariakit/test": minor
---

Updated package names to include the `@ariakit` scope, providing a more distinct and specific namespace for our packages.

Additionally, we've made a change to the versioning system, moving from `v2.0.0-beta.x` to `v0.x.x`. This alteration means that although the library is still in beta, we can release breaking changes in minor versions without disrupting projects that don't set exact versions in their `package.json`.

```diff
- npm i ariakit
+ npm i @ariakit/react
```
