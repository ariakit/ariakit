<a name="0.13.2"></a>
## [0.13.2](https://github.com/reakit/reakit/compare/v0.13.1...v0.13.2) (2018-08-08)


### Bug Fixes

* **Overlay:** DOM warning when wrapper haven't mounted yet ([#177](https://github.com/reakit/reakit/issues/177)) ([5f0e6ae](https://github.com/reakit/reakit/commit/5f0e6ae)), closes [#178](https://github.com/reakit/reakit/issues/178)


### Features

* Add Avatar component ([#175](https://github.com/reakit/reakit/issues/175)) ([66fb427](https://github.com/reakit/reakit/commit/66fb427))
* Add hideOnClickOutside prop to Hidden ([#167](https://github.com/reakit/reakit/issues/167)) ([39d8f6a](https://github.com/reakit/reakit/commit/39d8f6a)), closes [#160](https://github.com/reakit/reakit/issues/160)
* Add Toolbar component ([#174](https://github.com/reakit/reakit/issues/174)) ([b86cf0d](https://github.com/reakit/reakit/commit/b86cf0d))



<a name="0.13.1"></a>
## [0.13.1](https://github.com/reakit/reakit/compare/v0.13.0...v0.13.1) (2018-08-05)


### Bug Fixes

* Let theme override default styles on Table ([ab74f7c](https://github.com/reakit/reakit/commit/ab74f7c))


### Features

* Build a separate entry point for each public file ([#168](https://github.com/reakit/reakit/issues/168)) ([31bd3f6](https://github.com/reakit/reakit/commit/31bd3f6)), closes [#106](https://github.com/reakit/reakit/issues/106)



<a name="0.13.0"></a>
# [0.13.0](https://github.com/reakit/reakit/compare/v0.12.1...v0.13.0) (2018-08-03)


### Features

* Update Popover and Tooltip to use popper.js ([#163](https://github.com/reakit/reakit/issues/163)) ([d6ac36e](https://github.com/reakit/reakit/commit/d6ac36e)), closes [#130](https://github.com/reakit/reakit/issues/130) [#100](https://github.com/reakit/reakit/issues/100)


### Performance Improvements

* Remove List.Item and Table.* ([#158](https://github.com/reakit/reakit/issues/158)) ([08f4c97](https://github.com/reakit/reakit/commit/08f4c97))


### BREAKING CHANGES

* `Hidden` styles have been changed. Now it has a `transform` property by default.

  This affects all the other components that use `Hidden`: `Backdrop`, `Overlay`, `Sidebar`, `Popover`, `Tooltip`, `Step` and `TabsPanel`.
* `Perpendicular` has been removed. `Popover` and `Tooltip` use [popper.js](https://github.com/FezVrasta/popper.js) instead. 

  It affects also `PopoverArrow` and `TooltipArrow`, which don't accept `Perpendicular` props anymore.
* `pos` prop on `Popover` and `Tooltip` has been replaced by `placement` prop, which accepts all the `pos` values plus `-start` and `-end` versions.

  Before:
  ```jsx
  <Popover pos="top" align="start" />
  ```

  After:
  ```jsx
  <Popover placement="top-start" />
  ```
* `PopoverArrow` and `TooltipArrow` don't accept `pos` anymore. Their position and angle are now automatically set according to `Popover` and `Tooltip` `placement` prop.

  Before:
  ```jsx
  <Popover pos="top">
    <Popover.Arrow pos="bottom" />
  </Popover>
  ```

  After:
  ```jsx
  <Popover placement="top">
    <Popover.Arrow />
  </Popover>
  ```
* `popoverId` state on `PopoverContainer` is now set on `componentDidMount` instead of on initial state. 

  This means that it'll be `undefined` on the first render, but will have a consistent behavior when using [`context`](https://github.com/diegohaz/constate#context) prop.
* `Tooltip` styles have been changed. Now it has a slightly larger `font-size` and opaque `background-color`.
* `ListItem` and `Table` children components have been removed. You can replace them by their respective html tags (like `li`, `tr`, `th` etc.):

  ```jsx
  <List>
    <li>Item 1</li>
    <li>Item 2</li>
  </List>
  ```

  If you were using some enhanced feature of ReaKit components, like inline styles, you can use `<Base as="li">`:

  ```jsx
  <List>
    <Base as="li" marginTop={10}>Item</Base>
  </List>
  ```



<a name="0.12.1"></a>
## [0.12.1](https://github.com/reakit/reakit/compare/v0.12.0...v0.12.1) (2018-07-30)


### Bug Fixes

* **Perpendicular:** Also consider alignOffset when align is center ([3ffcd9d](https://github.com/reakit/reakit/commit/3ffcd9d))
* Only applies a default alignOffset to PopoverArrow and TooltipArrow when align is not center ([37a9d5c](https://github.com/reakit/reakit/commit/37a9d5c))


### Features

* **Table:** Add Table.Wrapper component ([#156](https://github.com/reakit/reakit/issues/156)) ([ae4f92a](https://github.com/reakit/reakit/commit/ae4f92a))



<a name="0.12.0"></a>
# [0.12.0](https://github.com/reakit/reakit/compare/v0.11.2...v0.12.0) (2018-07-18)


### Features

* **Hidden:** Add transition props ([#147](https://github.com/reakit/reakit/issues/147)) ([db8a801](https://github.com/reakit/reakit/commit/db8a801))
* **Hidden:** Replace destroy prop by unmount ([#145](https://github.com/reakit/reakit/issues/145)) ([07308ba](https://github.com/reakit/reakit/commit/07308ba))
* **Perpendicular:** Add alignOffset prop ([#150](https://github.com/reakit/reakit/issues/150)) ([e1823d6](https://github.com/reakit/reakit/commit/e1823d6))
* **Perpendicular:** Add angle prop ([#149](https://github.com/reakit/reakit/issues/149)) ([4ce1a64](https://github.com/reakit/reakit/commit/4ce1a64))
* Make prop-types a dependency ([#151](https://github.com/reakit/reakit/issues/151)) ([a31efd9](https://github.com/reakit/reakit/commit/a31efd9))
* **TableCell:** Replace header prop by as="th" ([#152](https://github.com/reakit/reakit/issues/152)) ([9e1a37c](https://github.com/reakit/reakit/commit/9e1a37c))


### BREAKING CHANGES

* **TableCell:** `header` prop was removed in favor of `<TableCell as="th" />`.
* **Perpendicular:** The default value of the `gutter` prop on `Perpendicular` has been changed to `0`.
* **Perpendicular:** `PopoverArrow` and `TooltipArrow`, when their `align` prop is either `start` or `end` have a `0.5rem` offset.
* **Perpendicular:** Replaced `reverse` by `angle` prop on `Perpendicular`.
* **Hidden:** `styleProp` was removed from `Hidden`. Now, it changes the `display` property unless you pass an `animated` prop or one of the transition props (`fade`, `expand` and/or `slide`).
* **Hidden:** `PopoverArrow` is slightly smaller and has `border: 0`. It's more like a fix.
* **Hidden:** `onEnter` and `onExit` was removed from `Step`. They'll be replaced in the future (if people come up with use cases) by `onShow` and `onHide` on the `Hidden` component.
* **Hidden:** `Step` now requires `isCurrent` prop instead of `current` and `indexOf`. If you're already passing the entire state `{...step}` as props, you don't need to change anything.
* **Hidden:** `Hidden`'s `destroy` prop was replaced by `unmount`.



<a name="0.11.2"></a>
## [0.11.2](https://github.com/reakit/reakit/compare/v0.11.1...v0.11.2) (2018-07-18)


### Bug Fixes

* **Table:** Use theme.Table ([a4bed90](https://github.com/reakit/reakit/commit/a4bed90))
* **TabsPanel:** Make it possible to pass visible to TabsPanel ([#144](https://github.com/reakit/reakit/issues/144)) ([54a8f9a](https://github.com/reakit/reakit/commit/54a8f9a))




