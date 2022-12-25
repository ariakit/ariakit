# ariakit-utils

## 0.17.0-next.27

### Minor Changes

- Extracted React specific utilities from the `ariakit-utils` package to the `ariakit-react-utils` package. ([#1819](https://github.com/ariakit/ariakit/pull/1819))

## 0.17.0-next.26

### Patch Changes

- Fixed `portalRef` prop type on `Portal` not accepting mutable refs with initial value set to `null`.

* Added `isDownloading` function. ([#1771](https://github.com/ariakit/ariakit/pull/1771))

## 0.17.0-next.25

### Patch Changes

- Added `getPopupItemRole` function. ([#1728](https://github.com/ariakit/ariakit/pull/1728))

* Added `isOpeningInNewTab` function. ([#1736](https://github.com/ariakit/ariakit/pull/1736))

## 0.17.0-next.24

### Patch Changes

- Added `fireFocusEvent` function. ([#1691](https://github.com/ariakit/ariakit/pull/1691))

* Added `useIsMouseMoving` function. ([#1680](https://github.com/ariakit/ariakit/pull/1680))

## 0.17.0-next.23

### Minor Changes

- Removed `ensureFocus` function. ([#1599](https://github.com/ariakit/ariakit/pull/1599))

### Patch Changes

- Fixed an issue where `ariakit-utils` was directly accessing React v18 APIs via a _namespace_ import (`import * as React from 'react'`) and Webpack was raising an error. Changed access to string concatenation so that Webpack is unable to infer that these APIs _may_ not be in the imported package. ([#1560](https://github.com/ariakit/ariakit/pull/1560))

* Added `focusIntoView` function. ([#1599](https://github.com/ariakit/ariakit/pull/1599))

- Added `usePortalRef` hook. ([#1592](https://github.com/ariakit/ariakit/pull/1592))

## 0.17.0-next.22

### Minor Changes

- **types**: `BooleanOrCallback` now requires a generic parameter input. ([#1534](https://github.com/ariakit/ariakit/pull/1534))

### Patch Changes

- Fixed an issue where `ariakit-utils` was importing React v18 APIs via named imports. As Webpack/CRA sees that these APIs do not exist on React v17, it would raise an error when an app used React v17. ([#1542](https://github.com/ariakit/ariakit/pull/1542))

* Fixed `useUpdateEffect` and `useUpdateLayoutEffect` on strict mode. ([#1534](https://github.com/ariakit/ariakit/pull/1534))

## 0.17.0-next.21

### Patch Changes

- Fixed `useEvent` hook timing. ([#1481](https://github.com/ariakit/ariakit/pull/1481))

## 0.17.0-next.20

### Patch Changes

- Fixed `addGlobalEventListener` when `window.frames` is undefined. ([#1404](https://github.com/ariakit/ariakit/pull/1404))

## 0.17.0-next.19

### Patch Changes

- Adjusted the return type of `useStoreProvider` to be more accurate. ([#1367](https://github.com/ariakit/ariakit/pull/1367))

## 0.17.0-next.18

### Minor Changes

- `useBooleanEventCallback` has been renamed to `useBooleanEvent`. ([#1323](https://github.com/ariakit/ariakit/pull/1323))

* `useEventCallback` has been renamed to `useEvent`. ([#1323](https://github.com/ariakit/ariakit/pull/1323), [#1332](https://github.com/ariakit/ariakit/pull/1332))

## 0.17.0-next.17

### Patch Changes

- Stopped shipping the `src` folder with the npm package to reduce the size of the package. ([#1272](https://github.com/ariakit/ariakit/pull/1272))

## 0.17.0-next.16

### Minor Changes

- Dropped support for React 16. ([#1225](https://github.com/ariakit/ariakit/pull/1225))

  The package may still work with React 16.8, but we're not testing the codebase against this version anymore. Upgrade to React 17 or higher to guarantee that your app works with Ariakit.

- Renamed `useLazyRef` function to `useLazyValue`.

- Added `usePreviousValue` function to `ariakit-utils/hooks`. ([#1219](https://github.com/ariakit/ariakit/pull/1219))

## 0.17.0-next.15

### Minor Changes

- Published packages with the `next` tag. ([#1213](https://github.com/ariakit/ariakit/pull/1213))
