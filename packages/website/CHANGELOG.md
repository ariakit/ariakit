# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.0.0-beta.4](https://github.com/reakit/reakit/tree/master/packages/website/compare/website@1.0.0-beta.3...website@1.0.0-beta.4) (2019-06-27)


### Bug Fixes

* Fix missing React Hooks deps ([b08b62c](https://github.com/reakit/reakit/tree/master/packages/website/commit/b08b62c))


### Features

* **website:** Hide state hook props from docs ([#390](https://github.com/reakit/reakit/tree/master/packages/website/issues/390)) ([fdac912](https://github.com/reakit/reakit/tree/master/packages/website/commit/fdac912))





# [1.0.0-beta.3](https://github.com/reakit/reakit/tree/master/packages/website/compare/website@1.0.0-beta.2...website@1.0.0-beta.3) (2019-06-23)


### Features

* **website:** Add previous/next links on documentation for better navigation ([#375](https://github.com/reakit/reakit/tree/master/packages/website/issues/375)) ([db97ee6](https://github.com/reakit/reakit/tree/master/packages/website/commit/db97ee6))
* Move helpers to separate package (reakit-utils, reakit-system) ([#380](https://github.com/reakit/reakit/tree/master/packages/website/issues/380)) ([354b874](https://github.com/reakit/reakit/tree/master/packages/website/commit/354b874))
* **website:** Add Spectrum/StackOverflow links ([#382](https://github.com/reakit/reakit/tree/master/packages/website/issues/382)) ([dff8158](https://github.com/reakit/reakit/tree/master/packages/website/commit/dff8158))


### BREAKING CHANGES

* Utils aren't exported by `reakit` or `reakit/utils` anymore. Import them from the `reakit-utils` package instead.
* System utils aren't exported by `reakit` or `reakit/system` anymore. Import them from the `reakit-system` package instead.
* `Provider` isn't exported by `reakit/utils` or `reakit/utils/Provider` anymore. Import it from `reakit` or `reakit/Provider` instead.





# [1.0.0-beta.2](https://github.com/reakit/reakit/tree/master/packages/website/compare/website@1.0.0-beta.1...website@1.0.0-beta.2) (2019-06-01)


### Features

* Add `unstable_animated` option to `useHiddenState` and its derivatives ([#370](https://github.com/reakit/reakit/tree/master/packages/website/issues/370)) ([4ba7f61](https://github.com/reakit/reakit/tree/master/packages/website/commit/4ba7f61))





# [1.0.0-beta.1](https://github.com/reakit/reakit/tree/master/packages/website/compare/website@1.0.0-beta.0...website@1.0.0-beta.1) (2019-05-21)


### Bug Fixes

* **reakit-system-palette:** Fix primary color contrast ratio ([#355](https://github.com/reakit/reakit/tree/master/packages/website/issues/355)) ([3856e1e](https://github.com/reakit/reakit/tree/master/packages/website/commit/3856e1e)), closes [#354](https://github.com/reakit/reakit/tree/master/packages/website/issues/354)
* **website:** Add SEO to newsletter page ([9b1be52](https://github.com/reakit/reakit/tree/master/packages/website/commit/9b1be52))


### BREAKING CHANGES

* **reakit-system-palette:** The `primary` color on `reakit-system-palette` (used by `reakit-system-bootstrap`) has been changed from `#007BFF` to `#006DFF` to conform with WCAG 2.1 AA contrast ratio.





# [1.0.0-beta.0](https://github.com/reakit/reakit/tree/master/packages/website/compare/website@0.20.0...website@1.0.0-beta.0) (2019-05-13)


### Features

* **website:** Add Google Tag Manager ([a6866a8](https://github.com/reakit/reakit/tree/master/packages/website/commit/a6866a8))





# [0.20.0](https://github.com/reakit/reakit/tree/master/packages/website/compare/website@0.19.0...website@0.20.0) (2019-05-12)


### BREAKING CHANGES

* All the `ComponentProps` typings have been renamed to `ComponentHTMLProps`. `ComponentProps` is now the combination of `ComponentOptions` and `ComponentHTMLProps`.





# [0.19.0](https://github.com/reakit/reakit/tree/master/packages/website/compare/website@0.18.0...website@0.19.0) (2019-04-25)


### Features

* Add `VisuallyHidden` component ([7b1d826](https://github.com/reakit/reakit/tree/master/packages/website/commit/7b1d826))





# [0.18.0](https://github.com/reakit/reakit/tree/master/packages/website/compare/website@0.17.1...website@0.18.0) (2019-04-17)


### Features

* **reakit-playground:** `PlaygroundEditor`, `PlaygroundPreview` and system ([c7a8c9f](https://github.com/reakit/reakit/tree/master/packages/website/commit/c7a8c9f))





## [0.17.1](https://github.com/reakit/reakit/tree/master/packages/website/compare/website@0.17.0...website@0.17.1) (2019-04-09)

**Note:** Version bump only for package website





# [0.17.0](https://github.com/reakit/reakit/tree/master/packages/website/compare/website@0.16.0-beta.2...website@0.17.0) (2019-04-02)

**Note:** Version bump only for package website
