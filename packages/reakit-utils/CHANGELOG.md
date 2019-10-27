# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.6.6](https://github.com/reakit/reakit/tree/master/packages/reakit-utils/compare/reakit-utils@0.6.5...reakit-utils@0.6.6) (2019-10-12)


### Bug Fixes

* Add a `useIsomorphicEffect` hook to allow proper SSR rendering ([#461](https://github.com/reakit/reakit/tree/master/packages/reakit-utils/issues/461)) ([47434b2](https://github.com/reakit/reakit/tree/master/packages/reakit-utils/commit/47434b2)), closes [#438](https://github.com/reakit/reakit/tree/master/packages/reakit-utils/issues/438)





## [0.6.5](https://github.com/reakit/reakit/tree/master/packages/reakit-utils/compare/reakit-utils@0.6.4...reakit-utils@0.6.5) (2019-09-25)


### Bug Fixes

* Replace IE11 incompatible DOM features ([#443](https://github.com/reakit/reakit/tree/master/packages/reakit-utils/issues/443)) ([8837557](https://github.com/reakit/reakit/tree/master/packages/reakit-utils/commit/8837557)), closes [#360](https://github.com/reakit/reakit/tree/master/packages/reakit-utils/issues/360)


### Features

* Show warnings on console whenever it gets called, not only once ([efaa95e](https://github.com/reakit/reakit/tree/master/packages/reakit-utils/commit/efaa95e))





## [0.6.4](https://github.com/reakit/reakit/tree/master/packages/reakit-utils/compare/reakit-utils@0.6.3...reakit-utils@0.6.4) (2019-09-19)


### Bug Fixes

* Fix `Dialog` initial focus ([#433](https://github.com/reakit/reakit/tree/master/packages/reakit-utils/issues/433)) ([a0916c7](https://github.com/reakit/reakit/tree/master/packages/reakit-utils/commit/a0916c7))
* Fix `Dialog` with `tabIndex={0}` not being included in the tab order ([#426](https://github.com/reakit/reakit/tree/master/packages/reakit-utils/issues/426)) ([bfb1d05](https://github.com/reakit/reakit/tree/master/packages/reakit-utils/commit/bfb1d05))





## [0.6.3](https://github.com/reakit/reakit/tree/master/packages/reakit-utils/compare/reakit-utils@0.6.2...reakit-utils@0.6.3) (2019-08-25)


### Features

* **reakit-utils:** Move `tabbable` internal module to `reakit-utils` package ([b84acce](https://github.com/reakit/reakit/tree/master/packages/reakit-utils/commit/b84acce))
* Support nested `Tabbable` and `Rover` components ([#417](https://github.com/reakit/reakit/tree/master/packages/reakit-utils/issues/417)) ([ee9623e](https://github.com/reakit/reakit/tree/master/packages/reakit-utils/commit/ee9623e)), closes [#376](https://github.com/reakit/reakit/tree/master/packages/reakit-utils/issues/376)





## [0.6.2](https://github.com/reakit/reakit/tree/master/packages/reakit-utils/compare/reakit-utils@0.6.1...reakit-utils@0.6.2) (2019-06-27)


### Bug Fixes

* Fix missing React Hooks deps ([b08b62c](https://github.com/reakit/reakit/tree/master/packages/reakit-utils/commit/b08b62c))





## 0.6.1 (2019-06-23)


### Features

* Move helpers to separate package (reakit-utils, reakit-system) ([#380](https://github.com/reakit/reakit/tree/master/packages/reakit-utils/issues/380)) ([354b874](https://github.com/reakit/reakit/tree/master/packages/reakit-utils/commit/354b874))


### BREAKING CHANGES

* Utils aren't exported by `reakit` or `reakit/utils` anymore. Import them from the `reakit-utils` package instead.
* System utils aren't exported by `reakit` or `reakit/system` anymore. Import them from the `reakit-system` package instead.
* `Provider` isn't exported by `reakit/utils` or `reakit/utils/Provider` anymore. Import it from `reakit` or `reakit/Provider` instead.





# Change Log
