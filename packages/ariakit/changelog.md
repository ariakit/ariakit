# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.0.0-alpha.21](https://github.com/ariakit/ariakit/compare/ariakit@2.0.0-alpha.20...ariakit@2.0.0-alpha.21) (2022-04-05)


### Bug Fixes

* Fix `autoFocusOnShow` prop not working on `Menu` ([60a66c5](https://github.com/ariakit/ariakit/commit/60a66c5ed940fcaab3b1772b9b89f6858bdb20b0))
* Fix `Menu` not reacting to mouse leave on iPad with mouse ([a4d0aca](https://github.com/ariakit/ariakit/commit/a4d0acad8c45449349184b777107760810ca276a))
* Fix `MenuBar` on mobile ([#1176](https://github.com/ariakit/ariakit/issues/1176)) ([1561a8c](https://github.com/ariakit/ariakit/commit/1561a8c80667820dcd26929316a95065bbbe5aac)), closes [#1091](https://github.com/ariakit/ariakit/issues/1091)
* Fix `Popover` not flipping ([96792a6](https://github.com/ariakit/ariakit/commit/96792a6094a716a4a6f5c16139e116509e7f2e30))
* Fix conflict on `Menu` and `Combobox` that auto selects item on backspace ([#1181](https://github.com/ariakit/ariakit/issues/1181)) ([abf8fed](https://github.com/ariakit/ariakit/commit/abf8fed2005e8b5d2745f02644c5c8a94f2e5b5e))
* Reset `activeId` when `Menu` is hidden ([fbf5a42](https://github.com/ariakit/ariakit/commit/fbf5a42546f7cca23441442582f51b71a40250da))
* Update repository data on package.json ([2a14f98](https://github.com/ariakit/ariakit/commit/2a14f98bf19d713dd145d4dfa2e5775f5469ce9c))


### Features

* Add `--scrollbar-width` CSS variable when modal dialog is visible ([#1184](https://github.com/ariakit/ariakit/issues/1184)) ([0bcda26](https://github.com/ariakit/ariakit/commit/0bcda261fb55d86cb382ff8a299d7765555846e7))





# [2.0.0-alpha.20](https://github.com/ariakit/ariakit/compare/ariakit@2.0.0-alpha.19...ariakit@2.0.0-alpha.20) (2022-03-31)


### Bug Fixes

* Fix `CompositeHover` activating item without mouse movement ([d342e06](https://github.com/ariakit/ariakit/commit/d342e06c7726a7e8c00df0e6c41758aa73a3d775))
* Fix `CompositeTypeahead` char sequence cleanup ([876a2c5](https://github.com/ariakit/ariakit/commit/876a2c5a4fc941f52c29449d65e778d9746ee914))
* Fix `Dialog` final focus when pressing Escape ([18a45b7](https://github.com/ariakit/ariakit/commit/18a45b7de7ed63627b4e1389f5b3b18e67adc3df))
* Fix `Menu` initial focus ([bc2a60a](https://github.com/ariakit/ariakit/commit/bc2a60a77bb2eca7ef20a9792c960b13aeb36a76))
* Fix `Select` + `Combobox` not getting correct value ([#1163](https://github.com/ariakit/ariakit/issues/1163)) ([278cff9](https://github.com/ariakit/ariakit/commit/278cff90b700de972ceae5114acc3b142ba0377d)), closes [#1159](https://github.com/ariakit/ariakit/issues/1159)
* Fix `Select` mouse down event on React 16 ([424b478](https://github.com/ariakit/ariakit/commit/424b478115e2d0f7fc99d46d7ab66f2b7cac1cc9))
* Fix modal `Dialog` not opening when triggered by `MenuItem` ([#1164](https://github.com/ariakit/ariakit/issues/1164)) ([d727de5](https://github.com/ariakit/ariakit/commit/d727de516f643f0a4f7973f0670b32fb1ca0f48d)), closes [#1137](https://github.com/ariakit/ariakit/issues/1137)
* Fix Popover warning when placement is auto base ([#1118](https://github.com/ariakit/ariakit/issues/1118)) ([d2c5b38](https://github.com/ariakit/ariakit/commit/d2c5b384f817b7650f7c4b552fe4a85409e9bd6e)), closes [#1117](https://github.com/ariakit/ariakit/issues/1117)
* Import `createRoot` from `react-dom/client` ([de0ea45](https://github.com/ariakit/ariakit/commit/de0ea45d5d2d8502d84b3f7c8961fa816fee908b))
* Stop re-validating `Form` on reset ([9a35214](https://github.com/ariakit/ariakit/commit/9a352141fda1fc04e77cea984747c56e91cb6a70))
* Support empty string values on `Select` ([7f665d6](https://github.com/ariakit/ariakit/commit/7f665d6f3041e153cbb72e5bcf8e3aacd06c3935))
* Update React peer dependency versions ([bb36c70](https://github.com/ariakit/ariakit/commit/bb36c709b4ec0444941f7b7ac60e311b55ccbe9d))


### Features

* Add `Select` components ([#993](https://github.com/ariakit/ariakit/issues/993)) ([729971c](https://github.com/ariakit/ariakit/commit/729971c1471e3ccd16ece63cae568357f3741704))
* Add `touchOnBlur` prop to `FormField` ([8de453f](https://github.com/ariakit/ariakit/commit/8de453fadab2f8b280d23e1f64f32da7e2eb8c51))
* Add default cursor styles to non-native `FormLabel` ([13ae84f](https://github.com/ariakit/ariakit/commit/13ae84fc10a253bbdb17ca7329a3cedc9d3ba9a1))
