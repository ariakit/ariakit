# @ariakit/react-core

## 0.1.8

### Patch Changes

- Fixed `DialogBackdrop` not including the `data-backdrop` attribute in the initial render, causing a flash of unstyled content when the dialog is initially open. ([#2369](https://github.com/ariakit/ariakit/pull/2369))

- Fixed `Dialog` calling `hideOnInteractOutside` twice when clicking on the backdrop. ([#2369](https://github.com/ariakit/ariakit/pull/2369))

- The built-in `DialogBackdrop` component is no longer focusable. ([#2369](https://github.com/ariakit/ariakit/pull/2369))

- Call `autoFocusOnHide` and `autoFocusOnShow` with a `null` argument when there's no element to focus or the element is not focusable. This allows users to specify a fallback element to focus on hide or show. ([#2369](https://github.com/ariakit/ariakit/pull/2369))

## 0.1.7

### Patch Changes

- Fixed `Menu` focusing on the first menu item rather than the menu container when opened with a mouse click. ([#2339](https://github.com/ariakit/ariakit/pull/2339))

- Added `getPersistentElements` prop to `Dialog` to better support third-party elements that are already in the DOM by the time the dialog is opened. ([#2339](https://github.com/ariakit/ariakit/pull/2339))

- Added support on `Dialog` for nested/parallel dialogs, such as portalled dialogs created by third-party libraries and extensions. ([#2339](https://github.com/ariakit/ariakit/pull/2339))

- Fixed nested `Dialog` closing when dragging from the nested dialog to the parent dialog. ([#2339](https://github.com/ariakit/ariakit/pull/2339))

- Fixed build target. ([#2355](https://github.com/ariakit/ariakit/pull/2355))

- Updated JSDocs.

- Updated dependencies: `@ariakit/core@0.1.5`.

## 0.1.6

### Patch Changes

- Added `FocusableContainer` component to control whether `Focusable` components inside it can be auto focused when they have the `autoFocus` prop. ([#2322](https://github.com/ariakit/ariakit/pull/2322))

- Fixed `Select` component causing a scroll jump when it's dynamically rendered in a portal. ([#2322](https://github.com/ariakit/ariakit/pull/2322))

- Fixed a bug where passing controlled props to a component store wouldn't always call the state setter with an updated value. ([#2328](https://github.com/ariakit/ariakit/pull/2328))

- Fixed `Menu` not respecting `hidden={false}`. ([#2328](https://github.com/ariakit/ariakit/pull/2328))

- Updated JSDocs.

- Updated dependencies: `@ariakit/core@0.1.4`.

## 0.1.5

### Patch Changes

- Fixed `FormRadio` error when not explicitly providing the composite store. ([#2313](https://github.com/ariakit/ariakit/pull/2313))

- Fixed invariant error messages on `Menu` components. ([#2318](https://github.com/ariakit/ariakit/pull/2318))

- Updated validate and submit callbacks on `Form` so they always run in a consistent order. ([#2319](https://github.com/ariakit/ariakit/pull/2319))

- Fixed nested `Dialog` components when they are conditionally mounted. ([#2310](https://github.com/ariakit/ariakit/pull/2310))

- Updated dependencies: `@ariakit/core@0.1.3`.

## 0.1.4

### Patch Changes

- Added support for the `inert` attribute on the `Dialog` component. If the browser supports `inert`, modal dialogs will now use it rather than focus trap regions. ([#2301](https://github.com/ariakit/ariakit/pull/2301))

- Fixed nested modal `Dialog` also closing the parent dialog when clicking outside. ([#2300](https://github.com/ariakit/ariakit/pull/2300))

- Fixed modal `Dialog` eventually losing focus to `document.body`. ([#2300](https://github.com/ariakit/ariakit/pull/2300))

- Fixed `Combobox` with `autoSelect` and `autoComplete` set to `both` or `inline` where the completion string would lose its selected state. ([#2308](https://github.com/ariakit/ariakit/pull/2308))

- Fixed `Combobox` not processing composition text (like chinese characters or accents). ([#2308](https://github.com/ariakit/ariakit/pull/2308))

## 0.1.3

### Patch Changes

- Fixed `Dialog` not returning focus when closed when rendered with `React.lazy`. ([#2290](https://github.com/ariakit/ariakit/pull/2290))

- Fixed `Hovercard` being shown on touch/tap on mobile devices. ([#2291](https://github.com/ariakit/ariakit/pull/2291))

- Fixed `Hovercard` not properly cleaning up the timeout to hide the card when
  unmounted. ([#2289](https://github.com/ariakit/ariakit/pull/2289))

- Updated dependencies: `@ariakit/core@0.1.2`.

## 0.1.2

### Patch Changes

- Added missing `defaultValue` prop back to `useRadioStore`. ([#2265](https://github.com/ariakit/ariakit/pull/2265))

- Updated dependencies: `@ariakit/core@0.1.1`.

## 0.1.1

### Patch Changes

- Removed extra `console.log` from `Hovercard`.

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
