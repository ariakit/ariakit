# ariakit

## 2.0.0-next.44

### Patch Changes

- Fixed `Checkbox` with a string `value` prop used in combination with the `useCheckboxState` hook. ([#2223](https://github.com/ariakit/ariakit/pull/2223))

## 2.0.0-next.43

### Patch Changes

- Fixed infinite loop when rendering `<Popover portal>` with no tabbable elements inside. ([#2170](https://github.com/ariakit/ariakit/pull/2170))

## 2.0.0-next.42

### Patch Changes

- Extracted React specific utilities from the `ariakit-utils` package to the `ariakit-react-utils` package. ([#1819](https://github.com/ariakit/ariakit/pull/1819))

- Fixed type errors in TypeScript v4.8. ([#1885](https://github.com/ariakit/ariakit/pull/1885))

- **TypeScript**: Renamed types to have unique names matching their pattern. ([#2153](https://github.com/ariakit/ariakit/pull/2153))

- Updated dependencies: `ariakit-utils@0.17.0-next.27`, `ariakit-react-utils@0.17.0-next.27`.

## 2.0.0-next.41

### Minor Changes

- Improved `Combobox` with `autoSelect` behavior. ([#1821](https://github.com/ariakit/ariakit/pull/1821))

  Before, when `autoSelect` was enabled, the first item would be selected only on text insertion. That is, deleting or pasting text was ignored. Now, the first item is selected on any change to the input value, including programmatic changes.

- Updated the behavior of `autoComplete="inline"` and `autoComplete="both"` on `Combobox` so the completion string is only appended and highlighted when the caret is at the end of the input. ([#1823](https://github.com/ariakit/ariakit/pull/1823))

- Added `moveOnKeyPress` prop to `CompositeItem`. ([#1821](https://github.com/ariakit/ariakit/pull/1821))

- Added `moveOnKeyPress` prop to `Composite`. ([#1821](https://github.com/ariakit/ariakit/pull/1821))

### Patch Changes

- Fixed scroll jump on `Combobox` when pressing modifier keys. ([#1826](https://github.com/ariakit/ariakit/pull/1826))

## 2.0.0-next.40

### Minor Changes

- Activating `CompositeItem` elements rendered as links with <kbd>Cmd</kbd>/<kbd>Ctrl</kbd>+<kbd>Enter</kbd> now correctly opens the new tab in the background instead of bringing it to front. ([#1771](https://github.com/ariakit/ariakit/pull/1771))

* Added support for clicking on `CompositeItem` elements rendered as links with <kbd>Alt</kbd>+<kbd>Enter</kbd> to start a download. ([#1771](https://github.com/ariakit/ariakit/pull/1771))

- Improved `CompositeTypeahead` runtime performance. ([#1792](https://github.com/ariakit/ariakit/pull/1792))

* Added `displayName` to components in development. ([#1791](https://github.com/ariakit/ariakit/pull/1791))

### Patch Changes

- Fixed `Combobox` with `autoComplete="inline"` or `autoComplete="both"` not allowing text selection in some cases. ([#1773](https://github.com/ariakit/ariakit/pull/1773))

* Fixed `onFocusVisible` timing on the `Focusable` component so it waits for any logic in focus/keydown events to be performed before applying the `data-focus-visible` attribute. ([#1774](https://github.com/ariakit/ariakit/pull/1774))

- Fixed stale validity state on `FormField`. ([#1778](https://github.com/ariakit/ariakit/pull/1778))

* Fixed nested `Menu` prematurely hiding when moving the mouse to it on Safari. ([#1764](https://github.com/ariakit/ariakit/pull/1764))

- Fixed `Popover` blurred pixels when trying to fit viewport. ([#1793](https://github.com/ariakit/ariakit/pull/1793))

* Fixed `portalRef` prop type on `Portal` not accepting mutable refs with initial value set to `null`.

- Fixed `Select` not getting focus when some browser extensions (like 1password) automatically moves focus to the next form element. ([#1777](https://github.com/ariakit/ariakit/pull/1777))

- Updated dependencies: `ariakit-utils@0.17.0-next.26`.

## 2.0.0-next.39

### Minor Changes

- Improved support for `CompositeItem` rendered as a link. This includes `ComboboxItem`, `MenuItem`, and `SelectItem` components. ([#1736](https://github.com/ariakit/ariakit/pull/1736))

  Now clicking on `<a>` items with a mouse or keyboard while pressing `metaKey` (macOS) or `ctrlKey` (PC) opens the link in a new tab as expected. Popovers won't close and `Select`/`Combobox` values won't change when clicking with those modifiers.

* The `role` attribute on `MenuButton`, when inside another menu, is now based on the popover role instead of being always `menuitem`. ([#1728](https://github.com/ariakit/ariakit/pull/1728))

### Patch Changes

- Fixed `Collection` items order when adding items from start. ([#1748](https://github.com/ariakit/ariakit/pull/1748))

* Fixed `Combobox` not calling the `onKeyDown` prop when pressing printable keys. ([#1739](https://github.com/ariakit/ariakit/pull/1739))

- Fixed `Hovercard` prematurely hiding when moving mouse to it when the card is positioned diagonally to the anchor. ([#1742](https://github.com/ariakit/ariakit/pull/1742))

* Fixed `aria-labelledby` attribute on `Menu` not pointing to the correct element when using `MenuHeading`. ([#1737](https://github.com/ariakit/ariakit/pull/1737))

- Fixed `Tab` with `defaultSelectedId` on React 17. ([#1724](https://github.com/ariakit/ariakit/pull/1724))

- Updated dependencies: `ariakit-utils@0.17.0-next.25`.

## 2.0.0-next.38

### Minor Changes

- Updated the `backdrop` prop type on `Dialog` so it accepts elements with a legacy `ref` prop type. ([#1703](https://github.com/ariakit/ariakit/pull/1703))

* The logic behind animations on `Disclosure` and derived components (`Dialog`, `Menu`, `Popover`, etc.) has been refactored and is more reliable. ([#1699](https://github.com/ariakit/ariakit/pull/1699))

## 2.0.0-next.37

### Minor Changes

- Improved `focus` and `blur` events on `Composite` components. ([#1691](https://github.com/ariakit/ariakit/pull/1691))

* The `Dialog` component doesn't modify the scroll behavior when auto focusing elements on show/hide anymore. ([#1687](https://github.com/ariakit/ariakit/pull/1687))

### Patch Changes

- Fixed `autoSelect` behavior Combobox loses focus. ([#1679](https://github.com/ariakit/ariakit/pull/1679))

* Fixed `ComboboxPopover` hiding when the `ComboboxCancel` component gets focused. ([#1677](https://github.com/ariakit/ariakit/pull/1677))

- Fixed double focus on `CompositeItem` when combining multiple `Composite` components. ([#1689](https://github.com/ariakit/ariakit/pull/1689))

* Fixed `Hovercard` not hiding after scroll. ([#1680](https://github.com/ariakit/ariakit/pull/1680))

- Fixed `Popover` and `Tooltip` initial placement when inside an element with `position: relative`. ([#1676](https://github.com/ariakit/ariakit/pull/1676))

* Fixed the order that blur events are fired on `Portal` with `preserveTabOrder` set to `true`. ([#1681](https://github.com/ariakit/ariakit/pull/1681))

* Updated dependencies: `ariakit-utils@0.17.0-next.24`.

## 2.0.0-next.36

### Minor Changes

- The `name` prop is now always passed down when using `FormField` with custom components. ([#1646](https://github.com/ariakit/ariakit/pull/1646))

### Patch Changes

- Updated dependency `@floating-ui/dom` to v1. ([#1644](https://github.com/ariakit/ariakit/pull/1644))

## 2.0.0-next.35

### Patch Changes

- Fixed `Menu` not receiving focus when it was re-opened by clicking twice on its `MenuButton`. ([#1629](https://github.com/ariakit/ariakit/pull/1629))

## 2.0.0-next.34

### Minor Changes

- Added `placement` prop to `PopoverDisclosureArrow` component. ([#1618](https://github.com/ariakit/ariakit/pull/1618))

### Patch Changes

- Stopped rendering `Menu` as `role="menubar"` on Safari. Now it's `role="menu"` on all browsers. ([#1619](https://github.com/ariakit/ariakit/pull/1619))

* Fixed `Tooltip` position. ([#1622](https://github.com/ariakit/ariakit/pull/1622))

## 2.0.0-next.33

### Minor Changes

- Removed the `modal` prop from `ComboboxPopover` as it wasn't working and doesn't really make sense. If you want to render the combobox popover in a portal, use the `portal` prop instead. ([#1582](https://github.com/ariakit/ariakit/pull/1582))

* Changed the scroll behavior when focusing on `CompositeItem` elements using arrow keys. ([#1584](https://github.com/ariakit/ariakit/pull/1584))

- The `autoFocusOnShow` and `autoFocusOnHide` props on `Dialog` now support a function value. ([#1599](https://github.com/ariakit/ariakit/pull/1599))

### Patch Changes

- Fixed smooth scrolling when auto focusing `Dialog` elements on Firefox. ([#1599](https://github.com/ariakit/ariakit/pull/1599))

* Fixed an issue where `ariakit-utils` was directly accessing React v18 APIs via a _namespace_ import (`import * as React from 'react'`) and Webpack was raising an error. Changed access to string concatenation so that Webpack is unable to infer that these APIs _may_ not be in the imported package. ([#1560](https://github.com/ariakit/ariakit/pull/1560))

- Fixed screen reader announcing untouched `FormField` elements as invalid. ([#1588](https://github.com/ariakit/ariakit/pull/1588))

* Fixed `PopoverArrow` styling flash when `Popover` is flipped. ([#1593](https://github.com/ariakit/ariakit/pull/1593))

- Fixed scroll jump issue on `Popover` with `portal` prop. ([#1592](https://github.com/ariakit/ariakit/pull/1592))

* Fixed `SelectPopover` not receiving focus when clicking on `Select` on Firefox/macOS. ([#1585](https://github.com/ariakit/ariakit/pull/1585))

- Fixed `SelectPopover` with `modal` prop automatically hiding right after clicking on the `Select` element. ([#1590](https://github.com/ariakit/ariakit/pull/1590))

* Fixed `SelectPopover` props when `composite` is set to `false`. ([#1581](https://github.com/ariakit/ariakit/pull/1581))

- Fixed unintended page scroll when pressing <kbd>Space</kbd> on the `Select` component. ([#1579](https://github.com/ariakit/ariakit/pull/1579))

- Updated dependencies: `ariakit-utils@0.17.0-next.23`.

## 2.0.0-next.32

### Major Changes

- The `defaultVisible`, `visible`, and `setVisible` properties on `useDisclosureState` and derived state hooks have been renamed to `defaultOpen`, `open`, and `setOpen`, respectively. ([#1426](https://github.com/ariakit/ariakit/issues/1426), [#1521](https://github.com/ariakit/ariakit/pull/1521))

  **Before**:

  ```js
  const dialog = useDialogState({ defaultVisible, visible, setVisible });
  dialog.visible;
  dialog.setVisible;
  ```

  **After**:

  ```js
  const dialog = useDialogState({ defaultOpen, open, setOpen });
  dialog.open;
  dialog.setOpen;
  ```

### Minor Changes

- Improved disclosure detection on `Dialog`. ([#1422](https://github.com/ariakit/ariakit/pull/1422))

* Made it easier to programmatically open `Menu` components using `menu.show()`. ([#1573](https://github.com/ariakit/ariakit/pull/1573))

### Patch Changes

- Fixed `Dialog` not auto-detecting the disclosure when animating. ([#1422](https://github.com/ariakit/ariakit/pull/1422))

* Fixed cases where an animated `Dialog` wouldn't change its `animating` state and therefore not move focus. ([#1422](https://github.com/ariakit/ariakit/pull/1422))

- Fixed behavior when transitioning between sibling `Dialog` components. ([#1422](https://github.com/ariakit/ariakit/pull/1422))

* Fixed initial focus on animated `Select`. ([#1570](https://github.com/ariakit/ariakit/pull/1570))

- Fixed `SelectPopover` not focusing on the base element when there's no selected item. ([#1557](https://github.com/ariakit/ariakit/pull/1557))

## 2.0.0-next.31

### Minor Changes

- Added `FocusTrapRegion` component. ([#1469](https://github.com/ariakit/ariakit/pull/1469))

### Patch Changes

- Fixed an issue where `ariakit-utils` was importing React v18 APIs via named imports. As Webpack/CRA sees that these APIs do not exist on React v17, it would raise an error when an app used React v17. ([#1542](https://github.com/ariakit/ariakit/pull/1542))

* Fixed `Hovercard` incorrectly setting `autoFocusOnShow` to `false` on strict mode. ([#1534](https://github.com/ariakit/ariakit/pull/1534))

- Fixed `MenuBar` initial focus on strict mode. ([#1534](https://github.com/ariakit/ariakit/pull/1534))

* Fixed `Popover` initial position. ([#1535](https://github.com/ariakit/ariakit/pull/1535))

- Fixed `Select` initial focus on strict mode. ([#1532](https://github.com/ariakit/ariakit/pull/1532))

- Updated dependencies: `ariakit-utils@0.17.0-next.22`.

## 2.0.0-next.30

### Patch Changes

- Updated dependencies: `ariakit-utils@0.17.0-next.21`.

## 2.0.0-next.29

### Patch Changes

- Fixed `data-focus-visible` behavior when using the `focusOnHover` prop on composite items. ([#1433](https://github.com/ariakit/ariakit/pull/1433))

* Fixed `preventBodyScroll` behavior on `Dialog`. ([#1421](https://github.com/ariakit/ariakit/pull/1421))

- Fixed `Select` with `modal` prop not opening on click. ([#1427](https://github.com/ariakit/ariakit/pull/1427))

- Updated dependencies: `ariakit-utils@0.17.0-next.20`.

## 2.0.0-next.28

### Minor Changes

- The `hidden` prop passed to `Dialog` is now inherited by the internal `DialogBackdrop` component. ([#1387](https://github.com/ariakit/ariakit/pull/1387))

  Before, if we wanted to pass `hidden={false}` to both the dialog and the backdrop components, we would have to do this (still works):

  ```jsx
  <Dialog hidden={false} backdropProps={{ hidden: false }} />
  ```

  Now, the `backdropProps` is not necessary anymore:

  ```jsx
  <Dialog hidden={false} />
  ```

### Patch Changes

- Fixed `ComboboxPopover` being shown on right clicks on the combobox input. ([#1371](https://github.com/ariakit/ariakit/pull/1371))

* Fixed `Command` component not being clicked when using the keyboard on Firefox when it's rendered as a `summary` element. ([#1392](https://github.com/ariakit/ariakit/pull/1392))

- Fixed `Dialog` and derived dialog components not hiding when dragging elements outside it. ([#1378](https://github.com/ariakit/ariakit/pull/1378))

* Fixed `SelectPopover` being shown on right clicks on the select button. ([#1371](https://github.com/ariakit/ariakit/pull/1371))

* Updated dependencies: `ariakit-utils@0.17.0-next.19`.

## 2.0.0-next.27

### Minor Changes

- The `flip` prop on `usePopoverState` and derived hooks now supports a `string` of fallback placements. ([#1337](https://github.com/ariakit/ariakit/pull/1337))

  See the [`popover-flip`](https://ariakit.org/examples/popover-flip) example.

## 2.0.0-next.26

### Minor Changes

- Event handlers returned by Ariakit components are now always stable references. ([#1326](https://github.com/ariakit/ariakit/pull/1326))

### Patch Changes

- Fixed infinite loop on `Portal` when used within `React.Suspense`. ([#1327](https://github.com/ariakit/ariakit/pull/1327))

* Updated dependency `@floating-ui/dom` to `v0.5.0`. ([#1333](https://github.com/ariakit/ariakit/pull/1333))

* Updated dependencies: `ariakit-utils@0.17.0-next.18`.

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
