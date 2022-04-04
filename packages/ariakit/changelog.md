# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
