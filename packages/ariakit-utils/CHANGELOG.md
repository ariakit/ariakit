# ariakit-utils

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
