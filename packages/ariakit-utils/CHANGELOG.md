# ariakit-utils

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
