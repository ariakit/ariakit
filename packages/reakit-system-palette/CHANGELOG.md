# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.6.3](https://github.com/reakit/reakit/tree/master/packages/reakit-system-palette/compare/reakit-system-palette@0.6.2...reakit-system-palette@0.6.3) (2019-08-25)


### Features

* Upgrade `reakit` peer dependency version ([73baeff](https://github.com/reakit/reakit/tree/master/packages/reakit-system-palette/commit/73baeff))





## [0.6.2](https://github.com/reakit/reakit/tree/master/packages/reakit-system-palette/compare/reakit-system-palette@0.6.1...reakit-system-palette@0.6.2) (2019-06-27)

**Note:** Version bump only for package reakit-system-palette





## [0.6.1](https://github.com/reakit/reakit/tree/master/packages/reakit-system-palette/compare/reakit-system-palette@0.6.0...reakit-system-palette@0.6.1) (2019-06-23)


### Features

* Move helpers to separate package (reakit-utils, reakit-system) ([#380](https://github.com/reakit/reakit/tree/master/packages/reakit-system-palette/issues/380)) ([354b874](https://github.com/reakit/reakit/tree/master/packages/reakit-system-palette/commit/354b874))


### BREAKING CHANGES

* Utils aren't exported by `reakit` or `reakit/utils` anymore. Import them from the `reakit-utils` package instead.
* System utils aren't exported by `reakit` or `reakit/system` anymore. Import them from the `reakit-system` package instead.
* `Provider` isn't exported by `reakit/utils` or `reakit/utils/Provider` anymore. Import it from `reakit` or `reakit/Provider` instead.





# [0.6.0](https://github.com/reakit/reakit/tree/master/packages/reakit-system-palette/compare/reakit-system-palette@0.5.0...reakit-system-palette@0.6.0) (2019-06-01)

**Note:** Version bump only for package reakit-system-palette





# [0.5.0](https://github.com/reakit/reakit/tree/master/packages/reakit-system-palette/compare/reakit-system-palette@0.4.1...reakit-system-palette@0.5.0) (2019-05-21)


### Bug Fixes

* **reakit-system-palette:** Fix primary color contrast ratio ([#355](https://github.com/reakit/reakit/tree/master/packages/reakit-system-palette/issues/355)) ([3856e1e](https://github.com/reakit/reakit/tree/master/packages/reakit-system-palette/commit/3856e1e)), closes [#354](https://github.com/reakit/reakit/tree/master/packages/reakit-system-palette/issues/354)


### BREAKING CHANGES

* **reakit-system-palette:** The `primary` color on `reakit-system-palette` (used by `reakit-system-bootstrap`) has been changed from `#007BFF` to `#006DFF` to conform with WCAG 2.1 AA contrast ratio.





## [0.4.1](https://github.com/reakit/reakit/tree/master/packages/reakit-system-palette/compare/reakit-system-palette@0.4.0...reakit-system-palette@0.4.1) (2019-05-13)

**Note:** Version bump only for package reakit-system-palette





# [0.4.0](https://github.com/reakit/reakit/tree/master/packages/reakit-system-palette/compare/reakit-system-palette@0.3.0...reakit-system-palette@0.4.0) (2019-05-12)


### Bug Fixes

* **reakit-system-bootstrap:** Fix `MenuDisclosure` arrow alignment on Safari. ([13f6e3e](https://github.com/reakit/reakit/tree/master/packages/reakit-system-palette/commit/13f6e3e))
* **reakit-system-palette:** Fix several issues with `darken`/`lighten` ([6b58654](https://github.com/reakit/reakit/tree/master/packages/reakit-system-palette/commit/6b58654))


### Features

* Add `unstable_animated` prop to `Hidden` ([e0ff29f](https://github.com/reakit/reakit/tree/master/packages/reakit-system-palette/commit/e0ff29f))
* Rename `mergeProps` util to `unstable_mergeProps` ([9be2e14](https://github.com/reakit/reakit/tree/master/packages/reakit-system-palette/commit/9be2e14))


### BREAKING CHANGES

* `mergeProps` util has been renamed to `unstable_mergeProps` and is not exported by the root package anymore. Instead, it should be imported from `reakit/utils/mergeProps`.
* All the `ComponentProps` typings have been renamed to `ComponentHTMLProps`. `ComponentProps` is now the combination of `ComponentOptions` and `ComponentHTMLProps`.





# [0.3.0](https://github.com/reakit/reakit/tree/master/packages/reakit-system-palette/compare/reakit-system-palette@0.2.0...reakit-system-palette@0.3.0) (2019-04-25)

**Note:** Version bump only for package reakit-system-palette





# [0.2.0](https://github.com/reakit/reakit/tree/master/packages/reakit-system-palette/compare/reakit-system-palette@0.1.1...reakit-system-palette@0.2.0) (2019-04-17)

**Note:** Version bump only for package reakit-system-palette





## [0.1.1](https://github.com/reakit/reakit/tree/master/packages/reakit-system-palette/compare/reakit-system-palette@0.1.0...reakit-system-palette@0.1.1) (2019-04-09)


### Features

* Remove `unstable_` prefix from many things ([ec434fc](https://github.com/reakit/reakit/tree/master/packages/reakit-system-palette/commit/ec434fc))





# 0.1.0 (2019-04-02)

**Note:** Version bump only for package reakit-system-palette
