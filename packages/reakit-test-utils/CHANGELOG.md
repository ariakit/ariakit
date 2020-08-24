# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.14.3](https://github.com/reakit/reakit/tree/master/packages/reakit-test-utils/compare/reakit-test-utils@0.14.2...reakit-test-utils@0.14.3) (2020-08-24)

**Note:** Version bump only for package reakit-test-utils





## [0.14.2](https://github.com/reakit/reakit/tree/master/packages/reakit-test-utils/compare/reakit-test-utils@0.14.1...reakit-test-utils@0.14.2) (2020-08-17)


### Bug Fixes

* **reakit-test-utils:** Fix `fireEvent` when element has `pointer-events: none` ([#714](https://github.com/reakit/reakit/tree/master/packages/reakit-test-utils/issues/714)) ([a3f0749](https://github.com/reakit/reakit/tree/master/packages/reakit-test-utils/commit/a3f07497a9aa8f8cef7687feabd277bd69eddbb8))





## [0.14.1](https://github.com/reakit/reakit/tree/master/packages/reakit-test-utils/compare/reakit-test-utils@0.14.0...reakit-test-utils@0.14.1) (2020-08-13)

**Note:** Version bump only for package reakit-test-utils





# [0.14.0](https://github.com/reakit/reakit/tree/master/packages/reakit-test-utils/compare/reakit-test-utils@0.13.1...reakit-test-utils@0.14.0) (2020-08-06)

**Note:** Version bump only for package reakit-test-utils





## [0.13.1](https://github.com/reakit/reakit/tree/master/packages/reakit-test-utils/compare/reakit-test-utils@0.13.0...reakit-test-utils@0.13.1) (2020-07-18)

**Note:** Version bump only for package reakit-test-utils





# [0.13.0](https://github.com/reakit/reakit/tree/master/packages/reakit-test-utils/compare/reakit-test-utils@0.12.0...reakit-test-utils@0.13.0) (2020-06-17)

**Note:** Version bump only for package reakit-test-utils





# [0.12.0](https://github.com/reakit/reakit/tree/master/packages/reakit-test-utils/compare/reakit-test-utils@0.11.2...reakit-test-utils@0.12.0) (2020-06-17)

**Note:** Version bump only for package reakit-test-utils





## [0.11.2](https://github.com/reakit/reakit/tree/master/packages/reakit-test-utils/compare/reakit-test-utils@0.11.1...reakit-test-utils@0.11.2) (2020-06-04)


### Features

* **reakit-test-utils:** Add `axe` utility ([#654](https://github.com/reakit/reakit/tree/master/packages/reakit-test-utils/issues/654)) ([db7f022](https://github.com/reakit/reakit/tree/master/packages/reakit-test-utils/commit/db7f02297e7c08c3e3085bd9677ad2b24fe5f09d))





## [0.11.1](https://github.com/reakit/reakit/tree/master/packages/reakit-test-utils/compare/reakit-test-utils@0.11.0...reakit-test-utils@0.11.1) (2020-05-12)


### Bug Fixes

* Fix `Tabbable` elements preventing behaviors on mouse down ([#641](https://github.com/reakit/reakit/tree/master/packages/reakit-test-utils/issues/641)) ([239eb56](https://github.com/reakit/reakit/tree/master/packages/reakit-test-utils/commit/239eb5622a1a02cd6f69c857bb725c8250dad155)), closes [#432](https://github.com/reakit/reakit/tree/master/packages/reakit-test-utils/issues/432)


### Features

* Remove deprecated `Hidden` module ([7a1cb99](https://github.com/reakit/reakit/tree/master/packages/reakit-test-utils/commit/7a1cb99b96d11900c16aade43fa154eb3b54d635))


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





# [0.11.0](https://github.com/reakit/reakit/tree/master/packages/reakit-test-utils/compare/reakit-test-utils@0.10.0...reakit-test-utils@0.11.0) (2020-04-29)

**Note:** Version bump only for package reakit-test-utils





# [0.10.0](https://github.com/reakit/reakit/tree/master/packages/reakit-test-utils/compare/reakit-test-utils@0.9.0...reakit-test-utils@0.10.0) (2020-04-20)


### Bug Fixes

* **reakit-test-utils:** Fix various bugs ([7933be0](https://github.com/reakit/reakit/tree/master/packages/reakit-test-utils/commit/7933be03a9cac40e32e176d3bb213a35af1457b3))
* Fix `Composite` on IE11 ([#609](https://github.com/reakit/reakit/tree/master/packages/reakit-test-utils/issues/609)) ([555b931](https://github.com/reakit/reakit/tree/master/packages/reakit-test-utils/commit/555b931de003a81a635ed1d980d67f9c62fb91e0))





# [0.9.0](https://github.com/reakit/reakit/tree/master/packages/reakit-test-utils/compare/reakit-test-utils@0.8.0...reakit-test-utils@0.9.0) (2020-03-30)

**Note:** Version bump only for package reakit-test-utils





# [0.8.0](https://github.com/reakit/reakit/tree/master/packages/reakit-test-utils/compare/reakit-test-utils@0.7.0...reakit-test-utils@0.8.0) (2020-02-10)

**Note:** Version bump only for package reakit-test-utils





# [0.7.0](https://github.com/reakit/reakit/tree/master/packages/reakit-test-utils/compare/reakit-test-utils@0.6.9...reakit-test-utils@0.7.0) (2020-02-05)

**Note:** Version bump only for package reakit-test-utils





## 0.6.9 (2019-12-18)

**Note:** Version bump only for package reakit-test-utils
