# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.0.0-rc.0](https://github.com/reakit/reakit/compare/reakit@1.0.0-beta.16...reakit@1.0.0-rc.0) (2020-03-30)


### Bug Fixes

* Fix `Tabbable` dispatching `click` twice when it's composed by another `Tabbable` ([#553](https://github.com/reakit/reakit/issues/553)) ([d231120](https://github.com/reakit/reakit/commit/d23112071b983b35e9262dded9df5dd6e84cb6ce))


### Features

* Add `Clickable` component ([#596](https://github.com/reakit/reakit/issues/596)) ([6a9fca9](https://github.com/reakit/reakit/commit/6a9fca9f20f1e93eb93776577607d5577d6f5870))
* Add `DisclosureContent` component ([#554](https://github.com/reakit/reakit/issues/554)) ([fd93b08](https://github.com/reakit/reakit/commit/fd93b08046ac89c5995e926a09f9e60464c83ce7))
* Automatically check `Radio` on focus ([#599](https://github.com/reakit/reakit/issues/599)) ([6edc689](https://github.com/reakit/reakit/commit/6edc68980de142686bdbdceecc8769e2a6265001))
* Remove `Provider` from `reakit/utils/Provider` ([134f7eb](https://github.com/reakit/reakit/commit/134f7ebc55838882f5e8dbd19473fb7417135116))
* Select the first `Tab` by default and don't require `stopId` prop ([#597](https://github.com/reakit/reakit/issues/597)) ([528b016](https://github.com/reakit/reakit/commit/528b016304f381b171cdc96598201deb54fb53c8))
* Support `rtl` on `Toolbar` ([#601](https://github.com/reakit/reakit/issues/601)) ([2811071](https://github.com/reakit/reakit/commit/281107130fac84bf37489f51e77f7c68e0e1b4f2))


### BREAKING CHANGES

* The first `Tab` is now selected by default. There's no need to pass `selectedId` to `useTabState` anymore.

  If you're already using `selectedId` to select a tab in the initial render, you don't need to change anything as this still works. But, if you want to render tabs with none selected, you should now pass `null` to `selectedId`:

  ```js
  // if you're already using selectedId, there's no need to change anything
  const tab = useTabState({ selectedId: "tab-1" });
  ```

  ```diff
  // when there's no tab selected by default, you now need to explicitly specify it
  - const tab = useTabState();
  + const tab = useTabState({ selectedId: null });
  ```
* **Most users will not be affected by this**, but `stops`, `register` and `unregister` on the returned object of state hooks have been renamed to `items`, `registerItem` and `unregisterItem`, respectively.

  ```diff
  const tab = useTabState();
  - tab.stops.map(...);
  + tab.items.map(...);
  - tab.register(...);
  + tab.registerItem(...);
  - tab.unregister(...);
  + tab.unregisterItem(...);
  ```
* `Tabbable` doesn't trigger a click on the element when pressing <kbd>Enter</kbd> and <kbd>Space</kbd> anymore. If you need that feature, use `Clickable` instead.

  **Before:**
  ```jsx
  import { Tabbable } from "reakit/Tabbable";
  <Tabbable />
  ```
  **After:**
  ```jsx
  import { Clickable } from "reakit/Clickable";
  // Tabbable is not going away, it just doesn't represent a clickable element
  // anymore
  <Clickable />
  ```
* Importing `Provider` from `reakit/utils` is not supported anymore. It should be imported from `reakit/Provider` or `reakit`.
* `DisclosureRegion` has been renamed to `DisclosureContent`.





# [1.0.0-beta.16](https://github.com/reakit/reakit/compare/reakit@1.0.0-beta.15...reakit@1.0.0-beta.16) (2020-02-10)


### Bug Fixes

* Check for classList existence before use ([#540](https://github.com/reakit/reakit/issues/540)) ([92a5fa1](https://github.com/reakit/reakit/commit/92a5fa1fd30e876eb8c25f3bbed48fbd7b8e15fb)), closes [#537](https://github.com/reakit/reakit/issues/537)
* Fix `transitionEnd` capturing children transitions ([#548](https://github.com/reakit/reakit/issues/548)) ([4cf1eaa](https://github.com/reakit/reakit/commit/4cf1eaad204a787be70f9db31b25e18972723ea2)), closes [#531](https://github.com/reakit/reakit/issues/531)
* Fix inconsistent `Tooltip` behavior on disabled `Tabbable` ([#552](https://github.com/reakit/reakit/issues/552)) ([d507772](https://github.com/reakit/reakit/commit/d507772ed470770f5db322ab68eced3b3259d8f0)), closes [#471](https://github.com/reakit/reakit/issues/471)
* Fix portaled components without dimensions in the first render ([#547](https://github.com/reakit/reakit/issues/547)) ([8783aec](https://github.com/reakit/reakit/commit/8783aec08f68be6e432bc39be85f2824ef8ca64e)), closes [#532](https://github.com/reakit/reakit/issues/532)
* Remove confusing `rover.unregister()` warning ([#549](https://github.com/reakit/reakit/issues/549)) ([2a72e35](https://github.com/reakit/reakit/commit/2a72e350c4134a55c77b0f2a19fea8a15af4e3bd)), closes [#488](https://github.com/reakit/reakit/issues/488)


### Features

* Add `Disclosure` module and deprecate `Hidden` ([#541](https://github.com/reakit/reakit/issues/541)) ([4397ab0](https://github.com/reakit/reakit/commit/4397ab0ea70e78ed187d6f463a5941f72907afb0))
* Add `MenuButton` and deprecate `MenuDisclosure` ([#544](https://github.com/reakit/reakit/issues/544)) ([f5fa914](https://github.com/reakit/reakit/commit/f5fa914b6e73f0f8fc5636a25aa5ebe2d421dcf8))
* Upgrade to popper.js v2 ([#545](https://github.com/reakit/reakit/issues/545)) ([55f7c21](https://github.com/reakit/reakit/commit/55f7c21b6651efc7ee18e45c17bf7be3ef5d39d2))


### BREAKING CHANGES

* The internal `popper.js` dependency has been upgraded to `v2`. The stable `Popover` API remains the same. But, while this change has been tested with the most common use cases, there may be some edge cases where `Popover` and `Menu` (which uses `Popover` underneath) may behave differently.





# [1.0.0-beta.15](https://github.com/reakit/reakit/compare/reakit@1.0.0-beta.14...reakit@1.0.0-beta.15) (2020-02-05)


### Bug Fixes

* Fix parent `Dialog` closing when clicking on nested `DialogBackdrop` ([#530](https://github.com/reakit/reakit/issues/530)) ([e8bc3be](https://github.com/reakit/reakit/commit/e8bc3be)), closes [#529](https://github.com/reakit/reakit/issues/529)
* Fix warning on deprecated `Provider` import ([1cd9421](https://github.com/reakit/reakit/commit/1cd9421))
* Prevent clicks when pressing Enter/Space with meta key on non-native `Tabbable` ([#534](https://github.com/reakit/reakit/issues/534)) ([7f0c8cf](https://github.com/reakit/reakit/commit/7f0c8cf))
* Stop converting `File` objects into plain objects when submitting `Form` ([5899d8d](https://github.com/reakit/reakit/commit/5899d8d)), closes [#415](https://github.com/reakit/reakit/issues/415)


### Features

* Add `modal` state to `useDialogState` ([#535](https://github.com/reakit/reakit/issues/535)) ([f3953ad](https://github.com/reakit/reakit/commit/f3953ad)), closes [#404](https://github.com/reakit/reakit/issues/404)
* Add `unstable_offset` option to `usePopoverState` ([#527](https://github.com/reakit/reakit/issues/527)) ([301fbca](https://github.com/reakit/reakit/commit/301fbca)), closes [#511](https://github.com/reakit/reakit/issues/511)
* Render nested `Dialog` on a portal outside of its parent `Dialog` ([#533](https://github.com/reakit/reakit/issues/533)) ([9f0a5cc](https://github.com/reakit/reakit/commit/9f0a5cc))
* Replace `unstable_wrap` by `wrapElement` ([#538](https://github.com/reakit/reakit/issues/538)) ([17a12fb](https://github.com/reakit/reakit/commit/17a12fb))
* **reakit-utils:** Add `getActiveElement` method ([a252fcd](https://github.com/reakit/reakit/commit/a252fcd))


### BREAKING CHANGES

* This should affect a very small number of people: the way nested modal `Dialog`s are rendered has been changed. To avoid styling issues, nested dialogs are rendered outside of the parent `Dialog` (but still inside the parent `Portal`).





# [1.0.0-beta.14](https://github.com/reakit/reakit/compare/reakit@1.0.0-beta.13...reakit@1.0.0-beta.14) (2019-12-18)


### Bug Fixes

* Fix `Dialog` closing when clicking inside it and dragging outside ([#510](https://github.com/reakit/reakit/issues/510)) ([7d580e6](https://github.com/reakit/reakit/commit/7d580e6)), closes [#506](https://github.com/reakit/reakit/issues/506)
* Fix `Portal` with `null` context on client ([#514](https://github.com/reakit/reakit/issues/514)) ([619adfd](https://github.com/reakit/reakit/commit/619adfd)), closes [#513](https://github.com/reakit/reakit/issues/513)
* Fix components not rendering `id` prop ([#520](https://github.com/reakit/reakit/issues/520)) ([866db9d](https://github.com/reakit/reakit/commit/866db9d)), closes [#518](https://github.com/reakit/reakit/issues/518)


### Features

* Add `unstable_inner` option to `usePopoverState` ([#517](https://github.com/reakit/reakit/issues/517)) ([d5e1e8f](https://github.com/reakit/reakit/commit/d5e1e8f)), closes [#516](https://github.com/reakit/reakit/issues/516)





# [1.0.0-beta.13](https://github.com/reakit/reakit/compare/reakit@1.0.0-beta.12...reakit@1.0.0-beta.13) (2019-11-22)


### Bug Fixes

* Fix `form.reset()` not reverting array fields to initial state ([#503](https://github.com/reakit/reakit/issues/503)) ([43ca6a8](https://github.com/reakit/reakit/commit/43ca6a8)), closes [#502](https://github.com/reakit/reakit/issues/502)
* Prevent an unnecessary re-render on `Button` ([e39842d](https://github.com/reakit/reakit/commit/e39842d))
* Standardize precedence when `options` and `htmlProps` conflict ([#501](https://github.com/reakit/reakit/issues/501)) ([5b8e02f](https://github.com/reakit/reakit/commit/5b8e02f))
* Stop ignoring `checked` and `value` props passed as html props to `useCheckbox` ([#500](https://github.com/reakit/reakit/issues/500)) ([c8cb0bb](https://github.com/reakit/reakit/commit/c8cb0bb)), closes [#465](https://github.com/reakit/reakit/issues/465)
* Stop persisting `onChange` event on `Checkbox` ([#499](https://github.com/reakit/reakit/issues/499)) ([fd4a694](https://github.com/reakit/reakit/commit/fd4a694)), closes [#498](https://github.com/reakit/reakit/issues/498)


### BREAKING CHANGES

* When passing a custom `onChange` prop to `Checkbox`, `event.target.checked` will no longer return a different value than when using the native `<input type="checkbox">` element.

  **Before:**
  ```jsx
  <Checkbox onChange={event => setChecked(!event.target.checked)} />;
  ```
  **After:**
  ```jsx
  <Checkbox onChange={event => setChecked(event.target.checked)} />;
  ```





# [1.0.0-beta.12](https://github.com/reakit/reakit/compare/reakit@1.0.0-beta.11...reakit@1.0.0-beta.12) (2019-11-14)


### Features

* **reakit-system:** Replace `useCompose` by `useComposeOptions` on `createHook` ([#493](https://github.com/reakit/reakit/issues/493)) ([50fd7df](https://github.com/reakit/reakit/commit/50fd7df))
* Add `baseId` option to `useHiddenState` and derivative hooks ([837aa58](https://github.com/reakit/reakit/commit/837aa58))
* Add `baseId` option to `useRoverState` and derivative hooks ([#494](https://github.com/reakit/reakit/issues/494)) ([42e9dd0](https://github.com/reakit/reakit/commit/42e9dd0))
* Add experimental `Id` module ([#492](https://github.com/reakit/reakit/issues/492)) ([5d87e99](https://github.com/reakit/reakit/commit/5d87e99))





# [1.0.0-beta.11](https://github.com/reakit/reakit/compare/reakit@1.0.0-beta.10...reakit@1.0.0-beta.11) (2019-11-08)


### Bug Fixes

* Fix `Tabbable` preventing click after enabling it ([#481](https://github.com/reakit/reakit/issues/481)) ([6b58a34](https://github.com/reakit/reakit/commit/6b58a34)), closes [#480](https://github.com/reakit/reakit/issues/480)
* Fix `Tabbable` preventing space and enter keys on `FormInput` ([3f49d6b](https://github.com/reakit/reakit/commit/3f49d6b))





# [1.0.0-beta.10](https://github.com/reakit/reakit/compare/reakit@1.0.0-beta.9...reakit@1.0.0-beta.10) (2019-11-02)


### Bug Fixes

* Fix `MenuItemCheckbox` and `MenuItemRadio` not working ([#473](https://github.com/reakit/reakit/issues/473)) ([11b7bfa](https://github.com/reakit/reakit/commit/11b7bfa)), closes [#472](https://github.com/reakit/reakit/issues/472)
* Fix `Rover` trying to focus itself again when it receives focus ([#476](https://github.com/reakit/reakit/issues/476)) ([b27194e](https://github.com/reakit/reakit/commit/b27194e))
* Fix `Tabbable` focus behavior on Mac Safari/Firefox ([#458](https://github.com/reakit/reakit/issues/458)) ([8306241](https://github.com/reakit/reakit/commit/8306241))
* Stop adding `type="button"` on `Button` by default ([#474](https://github.com/reakit/reakit/issues/474)) ([82b7279](https://github.com/reakit/reakit/commit/82b7279))





# [1.0.0-beta.9](https://github.com/reakit/reakit/compare/reakit@1.0.0-beta.8...reakit@1.0.0-beta.9) (2019-10-12)


### Bug Fixes

* Add a `useIsomorphicEffect` hook to allow proper SSR rendering ([#461](https://github.com/reakit/reakit/issues/461)) ([47434b2](https://github.com/reakit/reakit/commit/47434b2)), closes [#438](https://github.com/reakit/reakit/issues/438)
* Fix `PopoverArrow` ignoring `size` prop ([#455](https://github.com/reakit/reakit/issues/455)) ([5f51e39](https://github.com/reakit/reakit/commit/5f51e39)), closes [#454](https://github.com/reakit/reakit/issues/454)
* Fix nested `Dialog`s not working with VoiceOver ([#457](https://github.com/reakit/reakit/issues/457)) ([208bcb6](https://github.com/reakit/reakit/commit/208bcb6))
* Make `Menu` run without menu state props ([#459](https://github.com/reakit/reakit/issues/459)) ([5992362](https://github.com/reakit/reakit/commit/5992362))
* Prevent scrollbar flickering when opening `Dialog` ([#450](https://github.com/reakit/reakit/issues/450)) ([d84fd10](https://github.com/reakit/reakit/commit/d84fd10)), closes [#449](https://github.com/reakit/reakit/issues/449)


### Features

* Expose `unstable_update()` to update the popover positioning ([#463](https://github.com/reakit/reakit/issues/463)) ([eb4a8e5](https://github.com/reakit/reakit/commit/eb4a8e5))





# [1.0.0-beta.8](https://github.com/reakit/reakit/compare/reakit@1.0.0-beta.7...reakit@1.0.0-beta.8) (2019-09-25)


### Bug Fixes

* Fix `MenuItem` ignoring `ref` prop ([19119ca](https://github.com/reakit/reakit/commit/19119ca))
* Fix focus not going onto `MenuDisclosure` after closing a `Menu` opened with down arrow ([01f83ba](https://github.com/reakit/reakit/commit/01f83ba))
* Replace IE11 incompatible DOM features ([#443](https://github.com/reakit/reakit/issues/443)) ([8837557](https://github.com/reakit/reakit/commit/8837557)), closes [#360](https://github.com/reakit/reakit/issues/360)


### Features

* Add `gutter` option to `usePopoverState` ([#442](https://github.com/reakit/reakit/issues/442)) ([5e9bc21](https://github.com/reakit/reakit/commit/5e9bc21))
* Add experimental `unstable_portal` prop to `Tooltip` ([#440](https://github.com/reakit/reakit/issues/440)) ([1b2d5dd](https://github.com/reakit/reakit/commit/1b2d5dd))
* Add experimental `unstable_scheduleUpdate` function to `usePopoverState` return (still undocumented) ([b40a4da](https://github.com/reakit/reakit/commit/b40a4da))





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
