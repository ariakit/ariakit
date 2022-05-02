# ariakit

## 2.0.0-next.25

### Patch Changes

- Fixed `SelectLabelProps` type to default to `div` instead of `label`. ([#1281](https://github.com/ariakit/ariakit/pull/1281))

## 2.0.0-next.24

### Patch Changes

- Fixed focus flash when `Combobox` has `autoSelect` set to `true`.

- Fixed `Dialog` not closing when pressing <kbd>Esc</kbd> when the `ref` prop is lazily evaluated.

- Fixed `Dialog` not correctly preventing body scroll on iOS. ([#1271](https://github.com/ariakit/ariakit/pull/1271))

- Fixed `Hovercard` not disabling pointer events outside while the mouse is moving torwards the card when the `ref` prop is lazily evaluated.

- Fixed `Menu` initial focus when all the menu items are re-mounted. ([#1260](https://github.com/ariakit/ariakit/pull/1260))

- Stopped shipping the `src` folder with the npm package to reduce the size of the package. ([#1272](https://github.com/ariakit/ariakit/pull/1272))

- `--popover-available-width`, `--popover-available-height`, and `--popover-anchor-width` are now defined as integer values instead of floats.

- Fixed the `data-focus-visible` attribute flash on `Select` after clicking on it. ([#1262](https://github.com/ariakit/ariakit/pull/1262))

- Updated dependencies: `ariakit-utils@0.17.0-next.17`.

## 2.0.0-next.23

### Major Changes

- Dropped support for React 16. ([#1225](https://github.com/ariakit/ariakit/pull/1225))

  The package may still work with React 16.8, but we're not testing the codebase against this version anymore. Upgrade to React 17 or higher to guarantee that your app works with Ariakit.

- Dropped support for `auto`, `auto-start` and `auto-end` placements on `usePopoverState` and derived state hooks. ([#1229](https://github.com/ariakit/ariakit/pull/1229))

- Replaced `defaultAnchorRect`, `anchorRect` and `setAnchorRect` props on `usePopoverState` by a single `getAnchorRect` prop. ([#1252](https://github.com/ariakit/ariakit/pull/1252))

  Before:

  ```js
  const popover = usePopoverState();

  // inside an effect or event handler
  popover.setAnchorRect({ x: 10, y: 10 });
  ```

  After:

  ```js
  const popover = usePopoverState({ getAnchorRect: () => ({ x: 10, y: 10 }) });
  ```

- The `padding` prop has been renamed to `overflowPadding` on `usePopoverState` and derived state hooks. ([#1229](https://github.com/ariakit/ariakit/pull/1229))

  ```diff
    const popover = usePopoverState({
  -   padding: 4,
  +   overflowPadding: 4,
    });
  ```

- The `shift` and `gutter` props on `usePopoverState` and derived state hooks don't support string values anymore. Now only numbers are supported. ([#1229](https://github.com/ariakit/ariakit/pull/1229))

- The `preventOverflow` prop has been renamed to `slide` on `usePopoverState` and derived state hooks. ([#1229](https://github.com/ariakit/ariakit/pull/1229))

  ```diff
    const popover = usePopoverState({
  -   preventOverflow: false,
  +   slide: false,
    });
  ```

### Minor Changes

- The `setValueOnClick` prop from `ComboboxItem` now also supports a function that receives the click event and returns a boolean value.

- Added `setValueOnChange` prop to `Combobox`.

- Added `setValueOnClick` prop to `Combobox`.

- Added `fitViewport` prop to `usePopoverState` and derived state hooks. ([#1229](https://github.com/ariakit/ariakit/pull/1229))

- Added `overlap` prop to `usePopoverState` and derived state hooks. ([#1229](https://github.com/ariakit/ariakit/pull/1229))

### Patch Changes

- Fixed `Combobox` with `autoSelect` and `autoComplete="both"` props setting an incorrect value when there are no matches. ([#1219](https://github.com/ariakit/ariakit/pull/1219))

- Fixed `useDisclosureState` reading from a mutating ref on the render phase. ([#1224](https://github.com/ariakit/ariakit/pull/1224))

- Fixed extra re-renders on `FormField`, `FormInput`, `FormCheckbox` and `FormError` components when they have been touched.

- Fixed a bug where quickly hovering over nested `Hovercard` components right after they were mounted would cause the parent and the nested `Hovercard` to hide. ([#1229](https://github.com/ariakit/ariakit/pull/1229))

- Fixed how the "transit polygon" is shaped on `Hovercard` to make it easier to hover over adjacent elements. ([#1240](https://github.com/ariakit/ariakit/pull/1240))

- Fixed types for `@types/react` v18. ([#1222](https://github.com/ariakit/ariakit/pull/1222))

- Updated dependencies: `ariakit-utils@0.17.0-next.16`.

## 2.0.0-next.22

### Minor Changes

- Published packages with the `next` tag. ([#1213](https://github.com/ariakit/ariakit/pull/1213))

### Patch Changes

- Updated dependencies: `ariakit-utils@0.17.0-next.15`.
