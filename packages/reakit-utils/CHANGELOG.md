# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.10.0](https://github.com/reakit/reakit/tree/master/packages/reakit-utils/compare/reakit-utils@0.9.0...reakit-utils@0.10.0) (2020-03-30)


### Bug Fixes

* Add ie11 ponyfill for Element.matches ([#555](https://github.com/reakit/reakit/tree/master/packages/reakit-utils/issues/555)) ([07488aa](https://github.com/reakit/reakit/tree/master/packages/reakit-utils/commit/07488aa1142ffba652c4582890f52bda9953966a)), closes [#556](https://github.com/reakit/reakit/tree/master/packages/reakit-utils/issues/556)


### Features

* **reakit-utils:** Add `flatten` util ([57ac450](https://github.com/reakit/reakit/tree/master/packages/reakit-utils/commit/57ac4503da4604bae5a18dc6d7e6644ec152daad))
* **reakit-utils:** Remove `warning` util ([ff98d43](https://github.com/reakit/reakit/tree/master/packages/reakit-utils/commit/ff98d43568790cc191fde1ee9b56a35311a3a10f))


### BREAKING CHANGES

* **reakit-utils:** `warning` has been removed from `reakit-utils`. Use the `reakit-warning` package instead.





# [0.9.0](https://github.com/reakit/reakit/tree/master/packages/reakit-utils/compare/reakit-utils@0.8.0...reakit-utils@0.9.0) (2020-02-10)


### Features

* **reakit-utils:** Add `useForkRef` method ([8366545](https://github.com/reakit/reakit/tree/master/packages/reakit-utils/commit/8366545bf372cb8fb7c61bd18785c780c3794361))


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





# [0.8.0](https://github.com/reakit/reakit/tree/master/packages/reakit-utils/compare/reakit-utils@0.7.3...reakit-utils@0.8.0) (2020-02-05)


### Features

* **reakit-utils:** Add `getActiveElement` method ([a252fcd](https://github.com/reakit/reakit/tree/master/packages/reakit-utils/commit/a252fcd))
* **reakit-utils:** Add `isButton` method ([8ff86fc](https://github.com/reakit/reakit/tree/master/packages/reakit-utils/commit/8ff86fc))
* **reakit-utils:** Add `isPlainObject` function ([faeb26f](https://github.com/reakit/reakit/tree/master/packages/reakit-utils/commit/faeb26f))
* **reakit-utils:** Remove `Omit` type ([24797e0](https://github.com/reakit/reakit/tree/master/packages/reakit-utils/commit/24797e0))


### BREAKING CHANGES

* **reakit-utils:** `Omit` has been removed from `reakit-utils/types`. [TypeScript now supports it natively](https://www.typescriptlang.org/docs/handbook/utility-types.html#omittk).





## [0.7.3](https://github.com/reakit/reakit/tree/master/packages/reakit-utils/compare/reakit-utils@0.7.2...reakit-utils@0.7.3) (2019-12-18)

**Note:** Version bump only for package reakit-utils





## [0.7.2](https://github.com/reakit/reakit/tree/master/packages/reakit-utils/compare/reakit-utils@0.7.1...reakit-utils@0.7.2) (2019-11-22)


### Bug Fixes

* **reakit-utils:** Support iframes ([b6b3340](https://github.com/reakit/reakit/tree/master/packages/reakit-utils/commit/b6b3340))





## [0.7.1](https://github.com/reakit/reakit/tree/master/packages/reakit-utils/compare/reakit-utils@0.7.0...reakit-utils@0.7.1) (2019-11-14)

**Note:** Version bump only for package reakit-utils





# [0.7.0](https://github.com/reakit/reakit/tree/master/packages/reakit-utils/compare/reakit-utils@0.6.7...reakit-utils@0.7.0) (2019-11-08)

**Note:** Version bump only for package reakit-utils





## [0.6.7](https://github.com/reakit/reakit/tree/master/packages/reakit-utils/compare/reakit-utils@0.6.6...reakit-utils@0.6.7) (2019-11-02)


### Bug Fixes

* Fix `Tabbable` focus behavior on Mac Safari/Firefox ([#458](https://github.com/reakit/reakit/tree/master/packages/reakit-utils/issues/458)) ([8306241](https://github.com/reakit/reakit/tree/master/packages/reakit-utils/commit/8306241))





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
