# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.12.2](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/compare/reakit-playground@0.12.1...reakit-playground@0.12.2) (2020-05-14)

**Note:** Version bump only for package reakit-playground





## [0.12.1](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/compare/reakit-playground@0.12.0...reakit-playground@0.12.1) (2020-05-13)

**Note:** Version bump only for package reakit-playground





# [0.12.0](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/compare/reakit-playground@0.11.0...reakit-playground@0.12.0) (2020-05-12)


### Features

* Remove deprecated `Hidden` module ([7a1cb99](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/commit/7a1cb99b96d11900c16aade43fa154eb3b54d635))


### BREAKING CHANGES

* The **deprecated** `Hidden` module has been removed. Use `Disclosure` instead.

  **Before:**
  ```jsx
  import { useHiddenState, Hidden, HiddenDisclosure } from "reakit/Hidden";
  const hidden = useHiddenState();
  <HiddenDisclosure {...hidden}>Disclosure</HiddenDisclosure>
  <Hidden {...hidden}>Hidden</Hidden>
  ```

  **After:**
  ```jsx
  import {
    useDisclosureState,
    DisclosureContent,
    Disclosure,
  } from "reakit/Disclosure";
  const disclosure = useDisclosureState();
  <Disclosure {...disclosure}>Disclosure</Disclosure>
  <DisclosureContent {...disclosure}>Content</DisclosureContent>
  ```





# [0.11.0](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/compare/reakit-playground@0.10.0...reakit-playground@0.11.0) (2020-04-29)


### Features

* **reakit-utils:** Add `shallowEqual` util ([c3e7a71](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/commit/c3e7a717b182f1e0f9c734d2bc058787f091ce82))





# [0.10.0](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/compare/reakit-playground@0.9.0...reakit-playground@0.10.0) (2020-04-20)


### Bug Fixes

* Fix `Composite` on IE11 ([#609](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/issues/609)) ([555b931](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/commit/555b931de003a81a635ed1d980d67f9c62fb91e0))


### Features

* Remove experimental `IdGroup` component ([1c73f02](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/commit/1c73f021f78bca6a0c46c99b192d8ff11b124f4d))
* Replace `unstable_animated` by `animated` with improvements on the API ([#616](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/issues/616)) ([16f843f](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/commit/16f843f8dc4b97a552d629bd41cf20107e307a77)), closes [#528](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/issues/528)


### BREAKING CHANGES

* **This should affect only people who were using the `unstable_animated` API**: `DisclosureContent` and its derivative components don't add `hidden` class anymore. You should now use `[data-enter]` and `[data-leave]` selectors. For more details, see [Animating](https://reakit.io/docs/disclosure/#animating).





# [0.9.0](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/compare/reakit-playground@0.8.0...reakit-playground@0.9.0) (2020-03-30)


### Bug Fixes

* Add ie11 ponyfill for Element.matches ([#555](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/issues/555)) ([07488aa](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/commit/07488aa1142ffba652c4582890f52bda9953966a)), closes [#556](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/issues/556)


### Features

* **reakit-utils:** Remove `warning` util ([ff98d43](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/commit/ff98d43568790cc191fde1ee9b56a35311a3a10f))
* **reakit-warning:** Add `reakit-warning` package ([82e17ee](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/commit/82e17ee089cf97974438fe08b18cdadf2b9a1a2c))
* Add `Clickable` component ([#596](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/issues/596)) ([6a9fca9](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/commit/6a9fca9f20f1e93eb93776577607d5577d6f5870))
* Add `DisclosureContent` component ([#554](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/issues/554)) ([fd93b08](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/commit/fd93b08046ac89c5995e926a09f9e60464c83ce7))
* Remove `Provider` from `reakit/utils/Provider` ([134f7eb](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/commit/134f7ebc55838882f5e8dbd19473fb7417135116))


### BREAKING CHANGES

* **reakit-utils:** `warning` has been removed from `reakit-utils`. Use the `reakit-warning` package instead.
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





# [0.8.0](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/compare/reakit-playground@0.7.0...reakit-playground@0.8.0) (2020-02-10)


### Features

* Add `MenuButton` and deprecate `MenuDisclosure` ([#544](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/issues/544)) ([f5fa914](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/commit/f5fa914b6e73f0f8fc5636a25aa5ebe2d421dcf8))
* **reakit-utils:** Add `useForkRef` method ([8366545](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/commit/8366545bf372cb8fb7c61bd18785c780c3794361))
* Add `Disclosure` module and deprecate `Hidden` ([#541](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/issues/541)) ([4397ab0](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/commit/4397ab0ea70e78ed187d6f463a5941f72907afb0))


### BREAKING CHANGES

* **reakit-utils:** `mergeRefs` has been replaced by `useForkRef`. It's now a custom hook, so it should follow the rules of hooks.

  *Before*:
  ```jsx
  import React from "react";
  import { mergeRefs } from "reakit-utils";

  const Component = React.forwardRef((props, ref) => {
    const internalRef = React.useRef();
    return <div ref={mergeRefs(internalRef, ref)} {...props} />;
  });
  ```

  *After*:
  ```jsx
  import React from "react";
  import { useForkRef } from "reakit-utils";

  const Component = React.forwardRef((props, ref) => {
    const internalRef = React.useRef();
    return <div ref={useForkRef(internalRef, ref)} {...props} />;
  });
  ```





# [0.7.0](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/compare/reakit-playground@0.6.12...reakit-playground@0.7.0) (2020-02-05)


### Features

* **reakit-utils:** Add `getActiveElement` method ([a252fcd](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/commit/a252fcd))
* **reakit-utils:** Add `isButton` method ([8ff86fc](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/commit/8ff86fc))
* **reakit-utils:** Add `isPlainObject` function ([faeb26f](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/commit/faeb26f))





## [0.6.12](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/compare/reakit-playground@0.6.11...reakit-playground@0.6.12) (2019-12-18)

**Note:** Version bump only for package reakit-playground





## [0.6.11](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/compare/reakit-playground@0.6.10...reakit-playground@0.6.11) (2019-11-22)

**Note:** Version bump only for package reakit-playground





## [0.6.10](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/compare/reakit-playground@0.6.9...reakit-playground@0.6.10) (2019-11-14)


### Features

* Add experimental `Id` module ([#492](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/issues/492)) ([5d87e99](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/commit/5d87e99))





## [0.6.9](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/compare/reakit-playground@0.6.8...reakit-playground@0.6.9) (2019-11-08)

**Note:** Version bump only for package reakit-playground





## [0.6.8](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/compare/reakit-playground@0.6.7...reakit-playground@0.6.8) (2019-11-02)

**Note:** Version bump only for package reakit-playground





## [0.6.7](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/compare/reakit-playground@0.6.6...reakit-playground@0.6.7) (2019-10-12)


### Bug Fixes

* Add a `useIsomorphicEffect` hook to allow proper SSR rendering ([#461](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/issues/461)) ([47434b2](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/commit/47434b2)), closes [#438](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/issues/438)





## [0.6.6](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/compare/reakit-playground@0.6.5...reakit-playground@0.6.6) (2019-09-25)


### Bug Fixes

* Replace IE11 incompatible DOM features ([#443](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/issues/443)) ([8837557](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/commit/8837557)), closes [#360](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/issues/360)





## [0.6.5](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/compare/reakit-playground@0.6.4...reakit-playground@0.6.5) (2019-09-19)


### Bug Fixes

* **reakit-playground:** Add missing deps ([8d6316a](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/commit/8d6316a))


### Features

* Add `MenuBar` component ([#436](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/issues/436)) ([3d13c33](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/commit/3d13c33))





## [0.6.4](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/compare/reakit-playground@0.6.3...reakit-playground@0.6.4) (2019-08-25)


### Features

* **reakit-utils:** Move `tabbable` internal module to `reakit-utils` package ([b84acce](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/commit/b84acce))
* Add new `MenuArrow` component ([#422](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/issues/422)) ([731a376](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/commit/731a376))





## [0.6.3](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/compare/reakit-playground@0.6.2...reakit-playground@0.6.3) (2019-08-12)

**Note:** Version bump only for package reakit-playground





## [0.6.2](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/compare/reakit-playground@0.6.1...reakit-playground@0.6.2) (2019-06-27)


### Bug Fixes

* Fix missing React Hooks deps ([b08b62c](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/commit/b08b62c))





## [0.6.1](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/compare/reakit-playground@0.6.0...reakit-playground@0.6.1) (2019-06-23)


### Features

* Move helpers to separate package (reakit-utils, reakit-system) ([#380](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/issues/380)) ([354b874](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/commit/354b874))


### BREAKING CHANGES

* Utils aren't exported by `reakit` or `reakit/utils` anymore. Import them from the `reakit-utils` package instead.
* System utils aren't exported by `reakit` or `reakit/system` anymore. Import them from the `reakit-system` package instead.
* `Provider` isn't exported by `reakit/utils` or `reakit/utils/Provider` anymore. Import it from `reakit` or `reakit/Provider` instead.





# [0.6.0](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/compare/reakit-playground@0.5.0...reakit-playground@0.6.0) (2019-06-01)

**Note:** Version bump only for package reakit-playground





# [0.5.0](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/compare/reakit-playground@0.4.1...reakit-playground@0.5.0) (2019-05-21)


### Bug Fixes

* **reakit-playground:** Unmount React components correctly ([#358](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/issues/358)) ([7206a18](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/commit/7206a18))


### Features

* Set `display: none` on `Hidden` when its `visible` prop is set to `false` ([73d6cd2](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/commit/73d6cd2))





## [0.4.1](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/compare/reakit-playground@0.4.0...reakit-playground@0.4.1) (2019-05-13)


### Features

* **reakit-playground:** Accept all HTML attributes in `PlaygroundEditor` ([8097875](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/commit/8097875))





# [0.4.0](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/compare/reakit-playground@0.3.0...reakit-playground@0.4.0) (2019-05-12)


### Features

* Remove experimental `KeyBinder` in favor of internal `createOnKeyDown` util ([b0adfa8](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/commit/b0adfa8))
* **reakit-playground:** Provide fallback for SSR ([4b0fd5e](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/commit/4b0fd5e))


### BREAKING CHANGES

* All the `ComponentProps` typings have been renamed to `ComponentHTMLProps`. `ComponentProps` is now the combination of `ComponentOptions` and `ComponentHTMLProps`.





# [0.3.0](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/compare/reakit-playground@0.2.0...reakit-playground@0.3.0) (2019-04-25)


### Bug Fixes

* **reakit-playground:** Consider `modules` when updating. ([5c464f8](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/commit/5c464f8))


### Features

* Add `VisuallyHidden` component ([7b1d826](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/commit/7b1d826))
* Add experimental `KeyBinder` component ([7eb739a](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/commit/7eb739a))





# [0.2.0](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/compare/reakit-playground@0.1.1...reakit-playground@0.2.0) (2019-04-17)


### Features

* **reakit-playground:** `PlaygroundEditor`, `PlaygroundPreview` and system ([c7a8c9f](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/commit/c7a8c9f))
* Add `use` prefix automatically in `useProps`/`useOptions` ([167fda1](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/commit/167fda1))
* Expose `unstable_useSealedState` util ([1540eab](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/commit/1540eab))





## [0.1.1](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/compare/reakit-playground@0.1.0...reakit-playground@0.1.1) (2019-04-09)


### Features

* Improve Dialog/Menu API ([cf7426f](https://github.com/reakit/reakit/tree/master/packages/reakit-playground/commit/cf7426f))





# 0.1.0 (2019-04-02)

**Note:** Version bump only for package reakit-playground
