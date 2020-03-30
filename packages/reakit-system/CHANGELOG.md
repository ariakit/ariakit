# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.10.0](https://github.com/reakit/reakit/tree/master/packages/reakit-system/compare/reakit-system@0.9.0...reakit-system@0.10.0) (2020-03-30)


### Features

* Automatically check `Radio` on focus ([#599](https://github.com/reakit/reakit/tree/master/packages/reakit-system/issues/599)) ([6edc689](https://github.com/reakit/reakit/tree/master/packages/reakit-system/commit/6edc68980de142686bdbdceecc8769e2a6265001))
* Select the first `Tab` by default and don't require `stopId` prop ([#597](https://github.com/reakit/reakit/tree/master/packages/reakit-system/issues/597)) ([528b016](https://github.com/reakit/reakit/tree/master/packages/reakit-system/commit/528b016304f381b171cdc96598201deb54fb53c8))


### BREAKING CHANGES

* The first `Tab` is now selected by default. There's no need to pass `selectedId` to `useTabState` anymore.

  If you're already using `selectedId` to select a tab in the initial render, you don't need to change anything as this still works. But, if you want to render tabs with none selected, you should now pass `null` to `selectedId`:

  ```js
  // if you're already using selectedId, there's no need to change anything
  const tab = useTabState({ selectedId: "tab-1" });
  ```

  ```diff
  // when there's no tab selected by default, you now need to explicitly specify it
  - const tab = useTabState();
  + const tab = useTabState({ selectedId: null });
  ```
* **Most users will not be affected by this**, but `stops`, `register` and `unregister` on the returned object of state hooks have been renamed to `items`, `registerItem` and `unregisterItem`, respectively.

  ```diff
  const tab = useTabState();
  - tab.stops.map(...);
  + tab.items.map(...);
  - tab.register(...);
  + tab.registerItem(...);
  - tab.unregister(...);
  + tab.unregisterItem(...);
  ```





# [0.9.0](https://github.com/reakit/reakit/tree/master/packages/reakit-system/compare/reakit-system@0.8.0...reakit-system@0.9.0) (2020-02-10)


### Features

* Add `Disclosure` module and deprecate `Hidden` ([#541](https://github.com/reakit/reakit/tree/master/packages/reakit-system/issues/541)) ([4397ab0](https://github.com/reakit/reakit/tree/master/packages/reakit-system/commit/4397ab0ea70e78ed187d6f463a5941f72907afb0))





# [0.8.0](https://github.com/reakit/reakit/tree/master/packages/reakit-system/compare/reakit-system@0.7.2...reakit-system@0.8.0) (2020-02-05)


### Features

* Add `modal` state to `useDialogState` ([#535](https://github.com/reakit/reakit/tree/master/packages/reakit-system/issues/535)) ([f3953ad](https://github.com/reakit/reakit/tree/master/packages/reakit-system/commit/f3953ad)), closes [#404](https://github.com/reakit/reakit/tree/master/packages/reakit-system/issues/404)
* Replace `unstable_wrap` by `wrapElement` ([#538](https://github.com/reakit/reakit/tree/master/packages/reakit-system/issues/538)) ([17a12fb](https://github.com/reakit/reakit/tree/master/packages/reakit-system/commit/17a12fb))





## [0.7.2](https://github.com/reakit/reakit/tree/master/packages/reakit-system/compare/reakit-system@0.7.1...reakit-system@0.7.2) (2019-12-18)

**Note:** Version bump only for package reakit-system





## [0.7.1](https://github.com/reakit/reakit/tree/master/packages/reakit-system/compare/reakit-system@0.7.0...reakit-system@0.7.1) (2019-11-22)

**Note:** Version bump only for package reakit-system





# [0.7.0](https://github.com/reakit/reakit/tree/master/packages/reakit-system/compare/reakit-system@0.6.8...reakit-system@0.7.0) (2019-11-14)


### Features

* **reakit-system:** Replace `useCompose` by `useComposeOptions` on `createHook` ([#493](https://github.com/reakit/reakit/tree/master/packages/reakit-system/issues/493)) ([50fd7df](https://github.com/reakit/reakit/tree/master/packages/reakit-system/commit/50fd7df))





## [0.6.8](https://github.com/reakit/reakit/tree/master/packages/reakit-system/compare/reakit-system@0.6.7...reakit-system@0.6.8) (2019-11-08)

**Note:** Version bump only for package reakit-system





## [0.6.7](https://github.com/reakit/reakit/tree/master/packages/reakit-system/compare/reakit-system@0.6.6...reakit-system@0.6.7) (2019-11-02)

**Note:** Version bump only for package reakit-system





## [0.6.6](https://github.com/reakit/reakit/tree/master/packages/reakit-system/compare/reakit-system@0.6.5...reakit-system@0.6.6) (2019-10-12)


### Performance Improvements

* Improve space complexity for `createHook` method ([#453](https://github.com/reakit/reakit/tree/master/packages/reakit-system/issues/453)) ([6fe7028](https://github.com/reakit/reakit/tree/master/packages/reakit-system/commit/6fe7028))





## [0.6.5](https://github.com/reakit/reakit/tree/master/packages/reakit-system/compare/reakit-system@0.6.4...reakit-system@0.6.5) (2019-09-25)

**Note:** Version bump only for package reakit-system





## [0.6.4](https://github.com/reakit/reakit/tree/master/packages/reakit-system/compare/reakit-system@0.6.3...reakit-system@0.6.4) (2019-09-19)

**Note:** Version bump only for package reakit-system





## [0.6.3](https://github.com/reakit/reakit/tree/master/packages/reakit-system/compare/reakit-system@0.6.2...reakit-system@0.6.3) (2019-08-25)


### Bug Fixes

* **reakit-system:** Remove dependency on reakit type ([d5ea02c](https://github.com/reakit/reakit/tree/master/packages/reakit-system/commit/d5ea02c)), closes [#413](https://github.com/reakit/reakit/tree/master/packages/reakit-system/issues/413)


### Features

* Upgrade `reakit` peer dependency version ([73baeff](https://github.com/reakit/reakit/tree/master/packages/reakit-system/commit/73baeff))





## [0.6.2](https://github.com/reakit/reakit/tree/master/packages/reakit-system/compare/reakit-system@0.6.1...reakit-system@0.6.2) (2019-06-27)

**Note:** Version bump only for package reakit-system





## 0.6.1 (2019-06-23)


### Features

* Move helpers to separate package (reakit-utils, reakit-system) ([#380](https://github.com/reakit/reakit/tree/master/packages/reakit-system/issues/380)) ([354b874](https://github.com/reakit/reakit/tree/master/packages/reakit-system/commit/354b874))


### BREAKING CHANGES

* Utils aren't exported by `reakit` or `reakit/utils` anymore. Import them from the `reakit-utils` package instead.
* System utils aren't exported by `reakit` or `reakit/system` anymore. Import them from the `reakit-system` package instead.
* `Provider` isn't exported by `reakit/utils` or `reakit/utils/Provider` anymore. Import it from `reakit` or `reakit/Provider` instead.





# Change Log
