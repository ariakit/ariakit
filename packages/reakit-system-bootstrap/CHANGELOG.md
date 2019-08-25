# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.6.3](https://github.com/reakit/reakit/tree/master/packages/reakit-system-bootstrap/compare/reakit-system-bootstrap@0.6.2...reakit-system-bootstrap@0.6.3) (2019-08-25)


### Bug Fixes

* **reakit-system-bootstrap:** Fix `MenuItem` styling as an anchor element ([580f5dd](https://github.com/reakit/reakit/tree/master/packages/reakit-system-bootstrap/commit/580f5dd))


### Features

* Upgrade `reakit` peer dependency version ([73baeff](https://github.com/reakit/reakit/tree/master/packages/reakit-system-bootstrap/commit/73baeff))





## [0.6.2](https://github.com/reakit/reakit/tree/master/packages/reakit-system-bootstrap/compare/reakit-system-bootstrap@0.6.1...reakit-system-bootstrap@0.6.2) (2019-06-27)


### Features

* Add new `size` prop to `PopoverArrow` and `TooltipArrow` ([11a6df1](https://github.com/reakit/reakit/tree/master/packages/reakit-system-bootstrap/commit/11a6df1)), closes [#383](https://github.com/reakit/reakit/tree/master/packages/reakit-system-bootstrap/issues/383)





## [0.6.1](https://github.com/reakit/reakit/tree/master/packages/reakit-system-bootstrap/compare/reakit-system-bootstrap@0.6.0...reakit-system-bootstrap@0.6.1) (2019-06-23)


### Bug Fixes

* **reakit-system-bootstrap:** Fix SVG arrow being added after `MenuDisclosure` when children is a function ([3f53b33](https://github.com/reakit/reakit/tree/master/packages/reakit-system-bootstrap/commit/3f53b33))


### Features

* Move helpers to separate package (reakit-utils, reakit-system) ([#380](https://github.com/reakit/reakit/tree/master/packages/reakit-system-bootstrap/issues/380)) ([354b874](https://github.com/reakit/reakit/tree/master/packages/reakit-system-bootstrap/commit/354b874))


### BREAKING CHANGES

* Utils aren't exported by `reakit` or `reakit/utils` anymore. Import them from the `reakit-utils` package instead.
* System utils aren't exported by `reakit` or `reakit/system` anymore. Import them from the `reakit-system` package instead.
* `Provider` isn't exported by `reakit/utils` or `reakit/utils/Provider` anymore. Import it from `reakit` or `reakit/Provider` instead.





# [0.6.0](https://github.com/reakit/reakit/tree/master/packages/reakit-system-bootstrap/compare/reakit-system-bootstrap@0.5.0...reakit-system-bootstrap@0.6.0) (2019-06-01)


### Features

* Remove z-index and extra styles from `Dialog` and `DialogBackdrop` ([#372](https://github.com/reakit/reakit/tree/master/packages/reakit-system-bootstrap/issues/372)) ([5edd0d8](https://github.com/reakit/reakit/tree/master/packages/reakit-system-bootstrap/commit/5edd0d8)), closes [#366](https://github.com/reakit/reakit/tree/master/packages/reakit-system-bootstrap/issues/366)


### BREAKING CHANGES

* Removed extra styles from `Dialog` and `DialogBackdrop` and all their derivative components. Also removed default `z-index` from `Tooltip`. These styles have been moved to the `reakit-system-bootstrap` package. If you're not using this system package, you should apply the styles manually.

  **Before:**
  ```jsx
  <DialogBackdrop />
  <Dialog />
  <Popover />
  <Menu />
  <Tooltip />
  ```

  **After:**
  ```jsx
  <DialogBackdrop
    style={{
      position: "fixed",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      zIndex: 998
    }}
  />
  <Dialog style={{ zIndex: 999 }} />
  <Popover style={{ zIndex: 999 }} />
  <Menu style={{ zIndex: 999 }} />
  <Tooltip style={{ zIndex: 999 }} />
  ```





# [0.5.0](https://github.com/reakit/reakit/tree/master/packages/reakit-system-bootstrap/compare/reakit-system-bootstrap@0.4.1...reakit-system-bootstrap@0.5.0) (2019-05-21)


### Features

* Set `display: none` on `Hidden` when its `visible` prop is set to `false` ([73d6cd2](https://github.com/reakit/reakit/tree/master/packages/reakit-system-bootstrap/commit/73d6cd2))





## [0.4.1](https://github.com/reakit/reakit/tree/master/packages/reakit-system-bootstrap/compare/reakit-system-bootstrap@0.4.0...reakit-system-bootstrap@0.4.1) (2019-05-13)

**Note:** Version bump only for package reakit-system-bootstrap





# [0.4.0](https://github.com/reakit/reakit/tree/master/packages/reakit-system-bootstrap/compare/reakit-system-bootstrap@0.3.0...reakit-system-bootstrap@0.4.0) (2019-05-12)


### Bug Fixes

* **reakit-system-bootstrap:** Fix `Button` enabled state ([fc2d6a0](https://github.com/reakit/reakit/tree/master/packages/reakit-system-bootstrap/commit/fc2d6a0))
* **reakit-system-bootstrap:** Fix `MenuDisclosure` arrow alignment on Safari. ([13f6e3e](https://github.com/reakit/reakit/tree/master/packages/reakit-system-bootstrap/commit/13f6e3e))
* **reakit-system-palette:** Fix several issues with `darken`/`lighten` ([6b58654](https://github.com/reakit/reakit/tree/master/packages/reakit-system-bootstrap/commit/6b58654))


### Features

* Add `unstable_animated` prop to `Hidden` ([e0ff29f](https://github.com/reakit/reakit/tree/master/packages/reakit-system-bootstrap/commit/e0ff29f))
* **reakit-theme-bootstrap:** Remove highlight color on mobile tap ([d3aefd5](https://github.com/reakit/reakit/tree/master/packages/reakit-system-bootstrap/commit/d3aefd5))


### BREAKING CHANGES

* All the `ComponentProps` typings have been renamed to `ComponentHTMLProps`. `ComponentProps` is now the combination of `ComponentOptions` and `ComponentHTMLProps`.





# [0.3.0](https://github.com/reakit/reakit/tree/master/packages/reakit-system-bootstrap/compare/reakit-system-bootstrap@0.2.0...reakit-system-bootstrap@0.3.0) (2019-04-25)


### Bug Fixes

* **reakit-system-bootstrap:** Fix `MenuDisclosure`'s arrow pointing to the wrong direction ([6010f6d](https://github.com/reakit/reakit/tree/master/packages/reakit-system-bootstrap/commit/6010f6d))
* **reakit-system-bootstrap:** Fix disabled `Button` changing style on hover/active ([8c2cf33](https://github.com/reakit/reakit/tree/master/packages/reakit-system-bootstrap/commit/8c2cf33))
* **reakit-system-bootstrap:** Fix horizontal alignment of text inside `Button` ([4c14fdc](https://github.com/reakit/reakit/tree/master/packages/reakit-system-bootstrap/commit/4c14fdc))


### Features

* **reakit-system-bootstrap:** Better alignment for items inside `Button` ([c8f7ca5](https://github.com/reakit/reakit/tree/master/packages/reakit-system-bootstrap/commit/c8f7ca5))





# [0.2.0](https://github.com/reakit/reakit/tree/master/packages/reakit-system-bootstrap/compare/reakit-system-bootstrap@0.1.1...reakit-system-bootstrap@0.2.0) (2019-04-17)


### Bug Fixes

* **reakit-system-bootstrap:** `MenuItem` should always have default cursor ([d9ae0d6](https://github.com/reakit/reakit/tree/master/packages/reakit-system-bootstrap/commit/d9ae0d6))
* Change system's `useProps` order in built-in components ([e679024](https://github.com/reakit/reakit/tree/master/packages/reakit-system-bootstrap/commit/e679024))
* **reakit-system-bootstrap:** Fix `Button` line break ([2cb78e6](https://github.com/reakit/reakit/tree/master/packages/reakit-system-bootstrap/commit/2cb78e6))
* **reakit-system-bootstrap:** Fix `Group` not working with a single element and/or hidden elements ([c64cf25](https://github.com/reakit/reakit/tree/master/packages/reakit-system-bootstrap/commit/c64cf25))
* **reakit-system-bootstrap:** Fix emotion not displaying pretty css class names ([777d677](https://github.com/reakit/reakit/tree/master/packages/reakit-system-bootstrap/commit/777d677))
* **reakit-system-bootstrap:** Remove extra margin from `MenuDisclosure` when sub menu is on the left ([f99ce3e](https://github.com/reakit/reakit/tree/master/packages/reakit-system-bootstrap/commit/f99ce3e))


### Features

* Remove focus from `MenuItem` on mouse out ([fdd1bb8](https://github.com/reakit/reakit/tree/master/packages/reakit-system-bootstrap/commit/fdd1bb8))
* **reakit-playground:** `PlaygroundEditor`, `PlaygroundPreview` and system ([c7a8c9f](https://github.com/reakit/reakit/tree/master/packages/reakit-system-bootstrap/commit/c7a8c9f))
* **reakit-system-bootstrap:** `FormRemoveButton` danger by default ([60ed7d0](https://github.com/reakit/reakit/tree/master/packages/reakit-system-bootstrap/commit/60ed7d0))
* **reakit-system-bootstrap:** `MenuDisclosure` should have darker background when expanded ([80f767a](https://github.com/reakit/reakit/tree/master/packages/reakit-system-bootstrap/commit/80f767a))
* **reakit-system-bootstrap:** Use SVG arrows instead of characters in `MenuDisclosure` ([9242fe2](https://github.com/reakit/reakit/tree/master/packages/reakit-system-bootstrap/commit/9242fe2))





## [0.1.1](https://github.com/reakit/reakit/tree/master/packages/reakit-system-bootstrap/compare/reakit-system-bootstrap@0.1.0...reakit-system-bootstrap@0.1.1) (2019-04-09)


### Features

* Improve Dialog/Menu API ([cf7426f](https://github.com/reakit/reakit/tree/master/packages/reakit-system-bootstrap/commit/cf7426f))
* Remove `unstable_` prefix from many things ([ec434fc](https://github.com/reakit/reakit/tree/master/packages/reakit-system-bootstrap/commit/ec434fc))





# 0.1.0 (2019-04-02)

**Note:** Version bump only for package reakit-system-bootstrap
