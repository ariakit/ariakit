# @ariakit/test

## 0.1.11

### Patch Changes

- Added `.cjs` and `.js` extensions to paths in proxy package.json files to support bundlers that can't automaically resolve them. ([#2487](https://github.com/ariakit/ariakit/pull/2487))

- Updated dependencies: `@ariakit/core@0.2.3`.

## 0.1.10

### Patch Changes

- Fixed several actions not considering hidden elements before dispatching events, which was causing a freeze in JSDOM. ([#2462](https://github.com/ariakit/ariakit/pull/2462))

## 0.1.9

### Patch Changes

- Updated dependencies: `@ariakit/core@0.2.2`.

## 0.1.8

### Patch Changes

- Updated dependencies: `@ariakit/core@0.2.1`.

## 0.1.7

### Patch Changes

- Updated dependencies: `@ariakit/core@0.2.0`.

## 0.1.6

### Patch Changes

- Fixed build target. ([#2355](https://github.com/ariakit/ariakit/pull/2355))

- Fixed `mock-get-client-rects` module marking elements not connected to the DOM as visible. ([#2339](https://github.com/ariakit/ariakit/pull/2339))

- Updated dependencies: `@ariakit/core@0.1.5`.

## 0.1.5

### Patch Changes

- Updated dependencies: `@ariakit/core@0.1.4`.

## 0.1.4

### Patch Changes

- Updated dependencies: `@ariakit/core@0.1.3`.

## 0.1.3

### Patch Changes

- Added support for elements becoming inaccessible between `mousedown` and `mouseup` events on the `click` function. ([#2300](https://github.com/ariakit/ariakit/pull/2300))

- Added support for composition text on `type`. ([#2308](https://github.com/ariakit/ariakit/pull/2308))

## 0.1.2

### Patch Changes

- Updated dependencies: `@ariakit/core@0.1.2`.

## 0.1.1

### Patch Changes

- Updated dependencies: `@ariakit/core@0.1.1`.

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

- Updated dependencies: `@ariakit/core@0.1.0`.
