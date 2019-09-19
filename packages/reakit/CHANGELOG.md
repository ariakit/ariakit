# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.0.0-beta.7](https://github.com/reakit/reakit/compare/reakit@1.0.0-beta.6...reakit@1.0.0-beta.7) (2019-09-19)


### Bug Fixes

* Fix `Dialog` initial focus ([#433](https://github.com/reakit/reakit/issues/433)) ([a0916c7](https://github.com/reakit/reakit/commit/a0916c7))
* Fix `Dialog` with `tabIndex={0}` not being included in the tab order ([#426](https://github.com/reakit/reakit/issues/426)) ([bfb1d05](https://github.com/reakit/reakit/commit/bfb1d05))
* Fix `FormSubmitButton` ignoring `disabled` prop ([#439](https://github.com/reakit/reakit/issues/439)) ([bbfdfdd](https://github.com/reakit/reakit/commit/bbfdfdd)), closes [#437](https://github.com/reakit/reakit/issues/437)


### Features

* Accept multiple `DialogDisclosure`s for a single `Dialog` ([#427](https://github.com/reakit/reakit/issues/427)) ([0cb7432](https://github.com/reakit/reakit/commit/0cb7432))
* Add `MenuBar` component ([#436](https://github.com/reakit/reakit/issues/436)) ([3d13c33](https://github.com/reakit/reakit/commit/3d13c33))
* Export `PortalContext` ([#431](https://github.com/reakit/reakit/issues/431)) ([c5a780a](https://github.com/reakit/reakit/commit/c5a780a)), closes [#428](https://github.com/reakit/reakit/issues/428)


### BREAKING CHANGES

* `StaticMenu` has been replaced by `MenuBar`.

  **Before:**
  ```jsx
  import { useMenuState, StaticMenu } from "reakit/Menu";

  const menu = useMenuState();
  <StaticMenu {...menu} />;
  ```

  **After:**
  ```jsx
  import { useMenuBarState, MenuBar } from "reakit/Menu";

  const menuBar = useMenuBarState(); // useMenuState can be used here as well
  <MenuBar {...menuBar} />;
  ```





# [1.0.0-beta.6](https://github.com/reakit/reakit/compare/reakit@1.0.0-beta.5...reakit@1.0.0-beta.6) (2019-08-25)


### Bug Fixes

* Fix `Checkbox` `event.target.checked` value inside `onChange` event ([#419](https://github.com/reakit/reakit/issues/419)) ([75063fc](https://github.com/reakit/reakit/commit/75063fc)), closes [#393](https://github.com/reakit/reakit/issues/393)
* Fix `FormInput` as `textarea` caret position when focusing ([#420](https://github.com/reakit/reakit/issues/420)) ([d8e7af3](https://github.com/reakit/reakit/commit/d8e7af3)), closes [#418](https://github.com/reakit/reakit/issues/418)
* Fix `useRoverState` and its derivatives including all props in the return object ([987d16e](https://github.com/reakit/reakit/commit/987d16e))
* Remove erroneous `React.LiHTMLAttributes` type from `ToolbarItemHTMLProps` ([0cb6e66](https://github.com/reakit/reakit/commit/0cb6e66))


### Features

* **reakit-utils:** Move `tabbable` internal module to `reakit-utils` package ([b84acce](https://github.com/reakit/reakit/commit/b84acce))
* Add new `MenuArrow` component ([#422](https://github.com/reakit/reakit/issues/422)) ([731a376](https://github.com/reakit/reakit/commit/731a376))
* Add support for `HiddenDisclosure` to control multiple `Hidden` components ([#423](https://github.com/reakit/reakit/issues/423)) ([bdfbd74](https://github.com/reakit/reakit/commit/bdfbd74))
* Support nested `Tabbable` and `Rover` components ([#417](https://github.com/reakit/reakit/issues/417)) ([ee9623e](https://github.com/reakit/reakit/commit/ee9623e)), closes [#376](https://github.com/reakit/reakit/issues/376)





# [1.0.0-beta.5](https://github.com/reakit/reakit/compare/reakit@1.0.0-beta.4...reakit@1.0.0-beta.5) (2019-08-12)


### Bug Fixes

* Fix  typings ([29c4456](https://github.com/reakit/reakit/commit/29c4456))
* Fix `FormGroup` and `FormRadioGroup` not receiving focus when `Form` has been submited with errors ([59adc8b](https://github.com/reakit/reakit/commit/59adc8b))
* Fix `FormSubmitButton` not considering elements other than inputs as invalid fields ([c4f688a](https://github.com/reakit/reakit/commit/c4f688a))
* Fix `Hidden` not setting `unstable_animating` to `false` while visible ([#410](https://github.com/reakit/reakit/issues/410)) ([6d5827c](https://github.com/reakit/reakit/commit/6d5827c)), closes [#407](https://github.com/reakit/reakit/issues/407)
* Fix `Menu` preventing default behavior when pressing ASCII keys on elements other than `MenuItem` ([cacb978](https://github.com/reakit/reakit/commit/cacb978))
* Fix `Tooltip` error when `visible` is initially set to `true` ([#409](https://github.com/reakit/reakit/issues/409)) ([c132e56](https://github.com/reakit/reakit/commit/c132e56)), closes [#408](https://github.com/reakit/reakit/issues/408)
* Fix empty array values being filtered prematurely before `useFormState`'s `onValidate` ([6052829](https://github.com/reakit/reakit/commit/6052829))


### Features

* Support `onSubmit` and `onValidate` functions to be updated between renders in `useFormState` ([#411](https://github.com/reakit/reakit/issues/411)) ([f576db1](https://github.com/reakit/reakit/commit/f576db1)), closes [#400](https://github.com/reakit/reakit/issues/400)





# [1.0.0-beta.4](https://github.com/reakit/reakit/compare/reakit@1.0.0-beta.3...reakit@1.0.0-beta.4) (2019-06-27)


### Bug Fixes

* Always focus `Rover` when calling `rover.{move|first|last}()` ([#389](https://github.com/reakit/reakit/issues/389)) ([f346df4](https://github.com/reakit/reakit/commit/f346df4))
* Fix missing React Hooks deps ([b08b62c](https://github.com/reakit/reakit/commit/b08b62c))


### Features

* **website:** Hide state hook props from docs ([#390](https://github.com/reakit/reakit/issues/390)) ([fdac912](https://github.com/reakit/reakit/commit/fdac912))
* Add new `size` prop to `PopoverArrow` and `TooltipArrow` ([11a6df1](https://github.com/reakit/reakit/commit/11a6df1)), closes [#383](https://github.com/reakit/reakit/issues/383)





# [1.0.0-beta.3](https://github.com/reakit/reakit/compare/reakit@1.0.0-beta.2...reakit@1.0.0-beta.3) (2019-06-23)


### Bug Fixes

* Add missing deps to `usePopoverState` effect ([d44df81](https://github.com/reakit/reakit/commit/d44df81))
* Make `Menu` work properly with `unstable_animated` ([#386](https://github.com/reakit/reakit/issues/386)) ([b96c466](https://github.com/reakit/reakit/commit/b96c466))
* Remove false positive warning from `Dialog` ([#385](https://github.com/reakit/reakit/issues/385)) ([5334bd4](https://github.com/reakit/reakit/commit/5334bd4))


### Features

* Move helpers to separate package (reakit-utils, reakit-system) ([#380](https://github.com/reakit/reakit/issues/380)) ([354b874](https://github.com/reakit/reakit/commit/354b874))


### BREAKING CHANGES

* Utils aren't exported by `reakit` or `reakit/utils` anymore. Import them from the `reakit-utils` package instead.
* System utils aren't exported by `reakit` or `reakit/system` anymore. Import them from the `reakit-system` package instead.
* `Provider` isn't exported by `reakit/utils` or `reakit/utils/Provider` anymore. Import it from `reakit` or `reakit/Provider` instead.





# [1.0.0-beta.2](https://github.com/reakit/reakit/compare/reakit@1.0.0-beta.1...reakit@1.0.0-beta.2) (2019-06-01)


### Bug Fixes

* Fix `Checkbox` toggling twice on space bar key on Firefox ([#369](https://github.com/reakit/reakit/issues/369)) ([27e9b63](https://github.com/reakit/reakit/commit/27e9b63)), closes [#368](https://github.com/reakit/reakit/issues/368)
* Remove `async`/`await` so users don't need regenerator-runtime ([#365](https://github.com/reakit/reakit/issues/365)) ([9c6d41a](https://github.com/reakit/reakit/commit/9c6d41a))
* Stop adding `role="button"` on `Button` by default ([574e2a9](https://github.com/reakit/reakit/commit/574e2a9))


### Features

* Add `unstable_animated` option to `useHiddenState` and its derivatives ([#370](https://github.com/reakit/reakit/issues/370)) ([4ba7f61](https://github.com/reakit/reakit/commit/4ba7f61))
* Enable conditional render on `Hidden` components with render props ([#371](https://github.com/reakit/reakit/issues/371)) ([70322c2](https://github.com/reakit/reakit/commit/70322c2))
* Remove z-index and extra styles from `Dialog` and `DialogBackdrop` ([#372](https://github.com/reakit/reakit/issues/372)) ([5edd0d8](https://github.com/reakit/reakit/commit/5edd0d8)), closes [#366](https://github.com/reakit/reakit/issues/366)


### BREAKING CHANGES

* Removed extra styles from `Dialog` and `DialogBackdrop` and all their derivative components. Also removed default `z-index` from `Tooltip`. These styles have been moved to the `reakit-system-bootstrap` package. If you're not using this system package, you should apply the styles manually.

  **Before:**
  ```jsx
  <DialogBackdrop />
  <Dialog />
  <Popover />
  <Menu />
  <Tooltip />
  ```

  **After:**
  ```jsx
  <DialogBackdrop
    style={{
      position: "fixed",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      zIndex: 998
    }}
  />
  <Dialog style={{ zIndex: 999 }} />
  <Popover style={{ zIndex: 999 }} />
  <Menu style={{ zIndex: 999 }} />
  <Tooltip style={{ zIndex: 999 }} />
  ```





# [1.0.0-beta.1](https://github.com/reakit/reakit/compare/reakit@1.0.0-beta.0...reakit@1.0.0-beta.1) (2019-05-21)


### Bug Fixes

* Avoid infinite loop when using render props composition ([8256330](https://github.com/reakit/reakit/commit/8256330))
* Fix `Provider` not working without `unstable_system` prop ([37862fb](https://github.com/reakit/reakit/commit/37862fb))
* Stop flipping `orientation` on `Separator` ([52a0e63](https://github.com/reakit/reakit/commit/52a0e63))


### Features

* Set `display: none` on `Hidden` when its `visible` prop is set to `false` ([73d6cd2](https://github.com/reakit/reakit/commit/73d6cd2))


### BREAKING CHANGES

* `Separator` doesn't flip its `orientation` anymore. If you pass `orientation="vertical"` it'll render `aria-orientation="vertical"` now.





# [1.0.0-beta.0](https://github.com/reakit/reakit/compare/reakit@1.0.0-alpha.4...reakit@1.0.0-beta.0) (2019-05-13)


### Bug Fixes

* Fix `Tabbable` erroneously preventing `onMouseDown` on inputs ([10af438](https://github.com/reakit/reakit/commit/10af438))
* Fix nested `Dialogs` not closing when parent dialogs close ([84d1e16](https://github.com/reakit/reakit/commit/84d1e16))





# [1.0.0-alpha.4](https://github.com/reakit/reakit/compare/reakit@1.0.0-alpha.3...reakit@1.0.0-alpha.4) (2019-05-12)


### Bug Fixes

* Fix `Menu` not correctly moving with arrow keys ([3b55b85](https://github.com/reakit/reakit/commit/3b55b85))
* Fix `PopoverArrow` styles ([a90d71f](https://github.com/reakit/reakit/commit/a90d71f))
* Fix `Tabbable` not responding to `Enter` key ([24b54c3](https://github.com/reakit/reakit/commit/24b54c3))
* Fix arrow keys closing `Dialog` opened by `Menu` ([c3fdbcd](https://github.com/reakit/reakit/commit/c3fdbcd))
* Prevent buggy scroll on focus when showing Dialog ([e0a328b](https://github.com/reakit/reakit/commit/e0a328b))
* Remove the need of double click on `MenuItem` on mobile ([73b920e](https://github.com/reakit/reakit/commit/73b920e))
* Render `VisuallyHidden` as `span` instead of `div` since it could be placed in an inline element ([ac24c08](https://github.com/reakit/reakit/commit/ac24c08))


### Features

* Add `state` and `setState` props to `Checkbox` and `Radio` ([5902ab1](https://github.com/reakit/reakit/commit/5902ab1))
* Add `unstable_animated` prop to `Hidden` ([e0ff29f](https://github.com/reakit/reakit/commit/e0ff29f))
* Add `unstable_preventOverflow`, `unstable_boundariesElement` and `unstable_fixed` props to `usePopoverState` ([f0930e2](https://github.com/reakit/reakit/commit/f0930e2))
* Add experimental `unstable_orphan` prop to `Dialog` ([d0f6b52](https://github.com/reakit/reakit/commit/d0f6b52))
* Remove experimental `KeyBinder` in favor of internal `createOnKeyDown` util ([b0adfa8](https://github.com/reakit/reakit/commit/b0adfa8))
* Rename `mergeProps` util to `unstable_mergeProps` ([9be2e14](https://github.com/reakit/reakit/commit/9be2e14))
* Warn when some refs aren't passed to components ([92f035c](https://github.com/reakit/reakit/commit/92f035c))


### Performance Improvements

* Improve general performance by using `React.memo` on components ([91f0d54](https://github.com/reakit/reakit/commit/91f0d54))


### BREAKING CHANGES

* `mergeProps` util has been renamed to `unstable_mergeProps` and is not exported by the root package anymore. Instead, it should be imported from `reakit/utils/mergeProps`.
* `currentValue` and `setValue` have been replaced by `state` and `setState` on `Checkbox`, `Radio` and all their derivative components and related hooks.
* All the `ComponentProps` typings have been renamed to `ComponentHTMLProps`. `ComponentProps` is now the combination of `ComponentOptions` and `ComponentHTMLProps`.
* `placement` prop is now required on `MenuDisclosure`.
* `placement` prop is now required on `Menu`.





# [1.0.0-alpha.3](https://github.com/reakit/reakit/compare/reakit@1.0.0-alpha.2...reakit@1.0.0-alpha.3) (2019-04-25)


### Bug Fixes

* Fix `Checkbox` not reverting `indeterminate` state when `currentValue` changes ([2ee7455](https://github.com/reakit/reakit/commit/2ee7455))
* Fix `mouseOut` events triggering outside `Dialog`. ([d814ddf](https://github.com/reakit/reakit/commit/d814ddf))
* Fix arrow keys not working on `Menu` when cursor leaves it ([9f278ac](https://github.com/reakit/reakit/commit/9f278ac))
* Fix arrow keys on `MenuItem` incorrectly hiding `Menu` ([94bd9db](https://github.com/reakit/reakit/commit/94bd9db))
* Fix focusing `MenuItem` on mouse over outside an open `Dialog` ([aac7f3c](https://github.com/reakit/reakit/commit/aac7f3c))


### Features

* Add `VisuallyHidden` component ([7b1d826](https://github.com/reakit/reakit/commit/7b1d826))
* Add experimental `KeyBinder` component ([7eb739a](https://github.com/reakit/reakit/commit/7eb739a))
* Render `MenuGroup` as a `div` instead of `fieldset` ([5d4b476](https://github.com/reakit/reakit/commit/5d4b476))
* Return `unstable_wrap` method from props hooks ([f668ae4](https://github.com/reakit/reakit/commit/f668ae4))





# [1.0.0-alpha.2](https://github.com/reakit/reakit/compare/reakit@1.0.0-alpha.1...reakit@1.0.0-alpha.2) (2019-04-17)


### Bug Fixes

* `MenuDisclosure` should close the submenu when in menubar ([d481674](https://github.com/reakit/reakit/commit/d481674))
* Change system's `useProps` order in built-in components ([e679024](https://github.com/reakit/reakit/commit/e679024))
* Fix `DialogDisclosure` not closing `Dialog` on Safari when `hideOnClickOutside` is truthy ([37865cf](https://github.com/reakit/reakit/commit/37865cf))
* Fix `MenuDisclosure` race condition on focus/click ([8a37d31](https://github.com/reakit/reakit/commit/8a37d31))
* Make click/focus behavior cross-browser by automatically focusing `Tabbable` on mouse down ([54b618c](https://github.com/reakit/reakit/commit/54b618c))
* Restore `hasShownOnFocus` state in `MenuDisclosure` ([63228fd](https://github.com/reakit/reakit/commit/63228fd))


### Features

* Add `use` prefix automatically in `useProps`/`useOptions` ([167fda1](https://github.com/reakit/reakit/commit/167fda1))
* Expose `unstable_useSealedState` util ([1540eab](https://github.com/reakit/reakit/commit/1540eab))
* Remove `unstable_` prefix from `currentId` prop ([003d1ad](https://github.com/reakit/reakit/commit/003d1ad))
* Remove `unstable_` prefix from `focusable` prop ([965dcb7](https://github.com/reakit/reakit/commit/965dcb7))
* Remove `unstable_` prefix from `loop`, `move`, `next`, `previous`, `first`, `last` props ([501f822](https://github.com/reakit/reakit/commit/501f822))
* Remove `unstable_` prefix from `manual`, `selectedId`, `select` props ([c36413f](https://github.com/reakit/reakit/commit/c36413f))
* Remove `unstable_` prefix from `stops`, `register` and `unregister` props ([061cc55](https://github.com/reakit/reakit/commit/061cc55))
* Remove focus from `MenuItem` on mouse out ([fdd1bb8](https://github.com/reakit/reakit/commit/fdd1bb8))





# [1.0.0-alpha.1](https://github.com/reakit/reakit/compare/reakit@1.0.0-alpha.0...reakit@1.0.0-alpha.1) (2019-04-09)


### Bug Fixes

* Clicking on an element inside the disclosure should hide Dialog ([93072cb](https://github.com/reakit/reakit/commit/93072cb))


### Features

* Improve Dialog/Menu API ([cf7426f](https://github.com/reakit/reakit/commit/cf7426f))
* Remove `unstable_` prefix from many things ([ec434fc](https://github.com/reakit/reakit/commit/ec434fc))





# [1.0.0-alpha.0](https://github.com/reakit/reakit/compare/reakit@0.16.0-beta.2...reakit@1.0.0-alpha.0) (2019-04-02)

**Note:** Version bump only for package reakit
