# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="0.15.0"></a>
# [0.15.0](https://github.com/reakit/reakit/compare/reakit@0.14.6...reakit@0.15.0) (2018-09-13)


### Bug Fixes

* Fix PopoverArrow gutter on mobile ([eb4d22d](https://github.com/reakit/reakit/commit/eb4d22d))


### Code Refactoring

* Rename Base to Box ([#225](https://github.com/reakit/reakit/issues/225)) ([3be19d0](https://github.com/reakit/reakit/commit/3be19d0)), closes [#186](https://github.com/reakit/reakit/issues/186)


### Features

* Add `reakit-theme-default` package ([#188](https://github.com/reakit/reakit/issues/188)) ([f9f16ad](https://github.com/reakit/reakit/commit/f9f16ad)), closes [#154](https://github.com/reakit/reakit/issues/154)
* **typescript:** Add typescript support to Hidden ([#220](https://github.com/reakit/reakit/issues/220)) ([143eeb1](https://github.com/reakit/reakit/commit/143eeb1))
* **typescript:** Convert Provider to typescript ([#230](https://github.com/reakit/reakit/issues/230)) ([4ab6694](https://github.com/reakit/reakit/commit/4ab6694))
* **typescript:** Convert Table components into typescript ([#231](https://github.com/reakit/reakit/issues/231)) ([7ece839](https://github.com/reakit/reakit/commit/7ece839))


### BREAKING CHANGES

* `Hidden.Container` doesn't support overwriting its `actions` anymore.
* `Base` has been renamed to `Box`.

  Before:
  ```jsx
  import { Base } from "reakit";
  <Base />
  ```

  After:
  ```jsx
  import { Box } from "reakit";
  <Box />
  ```
* `Arrow`, `Box`, `Shadow` and `Fit` were removed.

  If you need their styles, look at the [source code before this commit](https://github.com/reakit/reakit/tree/100a833940b65284958988b888c0172ea5468d35/packages/reakit/src) and copy them.
* Almost all styles have been removed from components.

  If you need some basic styles, you should install `reakit-theme-default`. But, since they were rewritten, they may be slightly different from the old styles.

  To learn more, see [Theming](https://reakit.io/guide/theming).





<a name="0.14.6"></a>
## [0.14.6](https://github.com/reakit/reakit/compare/reakit@0.14.5...reakit@0.14.6) (2018-09-09)


### Bug Fixes

* Explicitly remove unsupported unmount prop on Popover ([5ed3acf](https://github.com/reakit/reakit/commit/5ed3acf))
* Hoist propTypes and defaultProps on enhanced components ([#218](https://github.com/reakit/reakit/issues/218)) ([b178d0e](https://github.com/reakit/reakit/commit/b178d0e))


### Features

* Add typescript support to Portal component ([#223](https://github.com/reakit/reakit/issues/223)) ([c18bba0](https://github.com/reakit/reakit/commit/c18bba0))





<a name="0.14.5"></a>
## [0.14.5](https://github.com/reakit/reakit/compare/reakit@0.14.4...reakit@0.14.5) (2018-08-24)


### Bug Fixes

* Dedupe classNames with identical styles ([#210](https://github.com/reakit/reakit/issues/210)) ([cbc3cb0](https://github.com/reakit/reakit/commit/cbc3cb0)), closes [#208](https://github.com/reakit/reakit/issues/208)
* Increase styled-components range version to avoid conflicts ([47480da](https://github.com/reakit/reakit/commit/47480da)), closes [#198](https://github.com/reakit/reakit/issues/198)





<a name="0.14.4"></a>
## [0.14.4](https://github.com/reakit/reakit/compare/reakit@0.14.3...reakit@0.14.4) (2018-08-23)


### Bug Fixes

* TypeScript definition errors ([#201](https://github.com/reakit/reakit/issues/201)) ([f16de0f](https://github.com/reakit/reakit/commit/f16de0f)), closes [#198](https://github.com/reakit/reakit/issues/198)


### Performance Improvements

* Replace `validAttr` by `@emotion/is-prop-valid` ([#200](https://github.com/reakit/reakit/issues/200)) ([4a708a0](https://github.com/reakit/reakit/commit/4a708a0)), closes [#173](https://github.com/reakit/reakit/issues/173)





<a name="0.14.3"></a>
## [0.14.3](https://github.com/reakit/reakit/compare/reakit@0.14.2...reakit@0.14.3) (2018-08-19)


### Features

* Add `shift` and `flip` props to `Popover` ([#196](https://github.com/reakit/reakit/issues/196)) ([9ee52ed](https://github.com/reakit/reakit/commit/9ee52ed))
* Add more TypeScript typings ([#193](https://github.com/reakit/reakit/issues/193)) ([b6c08fe](https://github.com/reakit/reakit/commit/b6c08fe))





<a name="0.14.2"></a>
## [0.14.2](https://github.com/reakit/reakit/compare/reakit@0.14.1...reakit@0.14.2) (2018-08-16)


### Bug Fixes

* `Arrow` and JS files typings not working ([#192](https://github.com/reakit/reakit/issues/192)) ([ce88103](https://github.com/reakit/reakit/commit/ce88103))





<a name="0.14.1"></a>
## [0.14.1](https://github.com/reakit/reakit/compare/v0.14.0...reakit@0.14.1) (2018-08-15)


### Features

* Accept `theme` prop on `Provider` ([#184](https://github.com/reakit/reakit/issues/184)) ([0327c1c](https://github.com/reakit/reakit/commit/0327c1c))
* Add TypeScript typings to `as`, `Base` and `Arrow` ([#146](https://github.com/reakit/reakit/issues/146)) ([6d8830a](https://github.com/reakit/reakit/commit/6d8830a)), closes [#142](https://github.com/reakit/reakit/issues/142)





<a name="0.14.0"></a>
# [0.14.0](https://github.com/reakit/reakit/compare/v0.13.2...v0.14.0) (2018-08-09)


### Features

* Add CardFit component ([#176](https://github.com/reakit/reakit/issues/176)) ([63ac954](https://github.com/reakit/reakit/commit/63ac954))
* Add Portal component ([#169](https://github.com/reakit/reakit/issues/169)) ([d6c16f7](https://github.com/reakit/reakit/commit/d6c16f7))
* Use div by default when none is passed to as ([b9053da](https://github.com/reakit/reakit/commit/b9053da))


### Performance Improvements

* Remove lodash and improved perfomance  ([#181](https://github.com/reakit/reakit/issues/181)) ([7296f69](https://github.com/reakit/reakit/commit/7296f69)), closes [#171](https://github.com/reakit/reakit/issues/171)


### BREAKING CHANGES

* `Card` styles have been changed. 

  Instead of making `img` elements fit the card's width, it now exposes a `Card.Fit` component that can be used to achieve the same behavior.

  Before:
  ```jsx
  <Card>
    <img />
  </Card>
  ```

  After:
  ```jsx
  <Card>
    <Card.Fit as="img" />
  </Card>
  ```
* When using `as` enhancer without passing any tag, it will use `div` instead of `span`.
* `Overlay` and `Sidebar` no longer use React portals by default. Now it should be combined with `Portal` component in order to achieve the same behavior.

  Before:

  ```jsx
  <Overlay />
  <Sidebar />
  ```

  After:

  ```jsx
  <Overlay as={Portal} />
  <Sidebar as={Portal} />
  ```



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

  If you were using some enhanced feature of Reakit components, like inline styles, you can use `<Base as="li">`:

  ```jsx
  <List>
    <Base as="li" marginTop={10}>Item</Base>
  </List>
  ```
