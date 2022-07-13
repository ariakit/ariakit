# ariakit-test

## 0.17.0-next.27

### Patch Changes

- Updated dependencies: `ariakit-utils@0.17.0-next.23`.

## 0.17.0-next.26

### Patch Changes

- Fixed error when importing `ariakit-test` in a Node.js environment.

## 0.17.0-next.25

### Minor Changes

- Components passed to the `render` function are now wrapped with `React.StrictMode`. ([#1534](https://github.com/ariakit/ariakit/pull/1534))

### Patch Changes

- Updated dependencies: `ariakit-utils@0.17.0-next.22`.

## 0.17.0-next.24

### Patch Changes

- Fixed error regarding accessing `isBrowser` before initialization. ([#1488](https://github.com/ariakit/ariakit/pull/1488))

- Updated dependencies: `ariakit-utils@0.17.0-next.21`.

## 0.17.0-next.23

### Patch Changes

- Fixed `hover` not waiting for queued microtasks. ([#1433](https://github.com/ariakit/ariakit/pull/1433))

- Updated dependencies: `ariakit-utils@0.17.0-next.20`.

## 0.17.0-next.22

### Patch Changes

- Added new `mouseDown` and `mouseUp` functions. ([#1379](https://github.com/ariakit/ariakit/pull/1379))

* Added new `select` util to `ariakit-test`. ([#1386](https://github.com/ariakit/ariakit/pull/1386))

* Updated dependencies: `ariakit-utils@0.17.0-next.19`.

## 0.17.0-next.21

### Patch Changes

- Updated dependencies: `ariakit-utils@0.17.0-next.18`.

## 0.17.0-next.20

### Minor Changes

- The `ariakit-test-utils` package has been renamed to `ariakit-test`. ([#1296](https://github.com/ariakit/ariakit/pull/1296))

## 0.17.0-next.19

### Minor Changes

- `press`ing `ArrowUp`, `ArrowRight`, `ArrowDown` and `ArrowLeft` on text fields now changes the selection/caret position.

- `press`ing printable characters on text fields now uses `type` underneath, which means they are typed in the input.

### Patch Changes

- Stopped shipping the `src` folder with the npm package to reduce the size of the package. ([#1272](https://github.com/ariakit/ariakit/pull/1272))

- Updated dependencies: `ariakit-utils@0.17.0-next.17`.

## 0.17.0-next.18

### Minor Changes

- Dropped support for React 16. ([#1225](https://github.com/ariakit/ariakit/pull/1225))

  The package may still work with React 16.8, but we're not testing the codebase against this version anymore. Upgrade to React 17 or higher to guarantee that your app works with Ariakit.

### Patch Changes

- Exposed `ariakit-test/mock-get-client-rects` module. ([#1227](https://github.com/ariakit/ariakit/pull/1227))

- Updated dependencies: `ariakit-utils@0.17.0-next.16`.

## 0.17.0-next.17

### Minor Changes

- Published packages with the `next` tag. ([#1213](https://github.com/ariakit/ariakit/pull/1213))

### Patch Changes

- Updated dependencies: `ariakit-utils@0.17.0-next.15`.
