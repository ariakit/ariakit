# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
