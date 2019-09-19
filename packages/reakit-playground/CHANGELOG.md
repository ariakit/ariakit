# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
