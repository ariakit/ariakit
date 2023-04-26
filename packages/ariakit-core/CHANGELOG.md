# @ariakit/core

## 0.1.3

### Patch Changes

- Added support for native radio buttons within forms, that work with roving tabindex, to all `focus` utilities. ([#2313](https://github.com/ariakit/ariakit/pull/2313))

- Updated validate and submit callbacks on `Form` so they always run in a consistent order. ([#2319](https://github.com/ariakit/ariakit/pull/2319))

- Marked internal store functions as deprecated/experimental. ([#2316](https://github.com/ariakit/ariakit/pull/2316))

## 0.1.2

### Patch Changes

- Added `isFalsyBooleanCallback` method.

## 0.1.1

### Patch Changes

- Added missing `defaultValue` prop back to `useRadioStore`. ([#2265](https://github.com/ariakit/ariakit/pull/2265))

## 0.1.0

### Minor Changes

- Updated package names to include the `@ariakit` scope, providing a more distinct and specific namespace for our packages.

  Additionally, we've made a change to the versioning system, moving from `v2.0.0-beta.x` to `v0.x.x`. This alteration means that although the library is still in beta, we can release breaking changes in minor versions without disrupting projects that don't set exact versions in their `package.json`.

  ```diff
  - npm i ariakit
  + npm i @ariakit/react
  ```

### Patch Changes

- Packages are now ESM by default (commonjs modules are still available with the `.cjs` extension).
