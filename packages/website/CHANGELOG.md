# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="0.15.5"></a>
## [0.15.5](https://github.com/reakit/reakit/compare/website@0.15.4...website@0.15.5) (2018-09-28)


### Bug Fixes

* **website:** Make DarkModeToggle a ToolbarFocusable ([8edccca](https://github.com/reakit/reakit/commit/8edccca))





<a name="0.15.4"></a>
## [0.15.4](https://github.com/reakit/reakit/compare/website@0.15.3...website@0.15.4) (2018-09-25)


### Bug Fixes

* **website:** Fix `DarkModeToggle` tracking ([00e8545](https://github.com/reakit/reakit/commit/00e8545))





<a name="0.15.3"></a>
## [0.15.3](https://github.com/reakit/reakit/compare/website@0.15.2...website@0.15.3) (2018-09-21)


### Features

* **website:** Add `Filter` component with keydown `/` focus ([#242](https://github.com/reakit/reakit/issues/242)) ([974126e](https://github.com/reakit/reakit/commit/974126e))





<a name="0.15.2"></a>
## [0.15.2](https://github.com/reakit/reakit/compare/website@0.15.1...website@0.15.2) (2018-09-18)


### Bug Fixes

* **website:** Internal guide links ([76f52b9](https://github.com/reakit/reakit/commit/76f52b9))





<a name="0.15.1"></a>
## [0.15.1](https://github.com/reakit/reakit/compare/website@0.15.0...website@0.15.1) (2018-09-13)

**Note:** Version bump only for package website





<a name="0.15.0"></a>
# [0.15.0](https://github.com/reakit/reakit/compare/website@0.14.6...website@0.15.0) (2018-09-13)


### Bug Fixes

* **website:** Container typings ([8c2efb6](https://github.com/reakit/reakit/commit/8c2efb6))
* **website:** Last SectionNavigation link alignment ([987a0be](https://github.com/reakit/reakit/commit/987a0be))
* **website:** Logo color ([40bf5af](https://github.com/reakit/reakit/commit/40bf5af))
* **website:** Logo color ([d074577](https://github.com/reakit/reakit/commit/d074577))


### Code Refactoring

* Rename Base to Box ([#225](https://github.com/reakit/reakit/issues/225)) ([3be19d0](https://github.com/reakit/reakit/commit/3be19d0)), closes [#186](https://github.com/reakit/reakit/issues/186)


### Features

* Add `reakit-theme-default` package ([#188](https://github.com/reakit/reakit/issues/188)) ([f9f16ad](https://github.com/reakit/reakit/commit/f9f16ad)), closes [#154](https://github.com/reakit/reakit/issues/154)
* Add typescript support to Hidden ([#220](https://github.com/reakit/reakit/issues/220)) ([143eeb1](https://github.com/reakit/reakit/commit/143eeb1))


### BREAKING CHANGES

* `Hidden.Container` doesn't support overwriting its `actions` anymore.
* `Base` has been renamed to `Box`.

  Before:
  ```jsx
  import { Base } from "reakit";
  <Base />
  ```

  After:
  ```jsx
  import { Box } from "reakit";
  <Box />
  ```
* `Arrow`, `Box`, `Shadow` and `Fit` were removed.

  If you need their styles, look at the [source code before this commit](https://github.com/reakit/reakit/tree/100a833940b65284958988b888c0172ea5468d35/packages/reakit/src) and copy them.
* Almost all styles have been removed from components.

  If you need some basic styles, you should install `reakit-theme-default`. But, since they were rewritten, they may be slightly different from the old styles.

  To learn more, see [Theming](https://reakit.io/guide/theming).





<a name="0.14.6"></a>
## [0.14.6](https://github.com/reakit/reakit/compare/website@0.14.5...website@0.14.6) (2018-09-09)


### Bug Fixes

* **website:** Remove warning about value on NewsletterForm ([b990b8c](https://github.com/reakit/reakit/commit/b990b8c))





<a name="0.14.5"></a>
## [0.14.5](https://github.com/reakit/reakit/compare/website@0.14.4...website@0.14.5) (2018-08-24)

**Note:** Version bump only for package website





<a name="0.14.4"></a>
## [0.14.4](https://github.com/reakit/reakit/compare/website@0.14.3...website@0.14.4) (2018-08-23)


### Bug Fixes

* TypeScript definition errors ([#201](https://github.com/reakit/reakit/issues/201)) ([f16de0f](https://github.com/reakit/reakit/commit/f16de0f)), closes [#198](https://github.com/reakit/reakit/issues/198)





<a name="0.14.3"></a>
## [0.14.3](https://github.com/reakit/reakit/compare/website@0.14.2...website@0.14.3) (2018-08-19)


### Features

* **website:** Add analytics trackings ([#195](https://github.com/reakit/reakit/issues/195)) ([cc697c6](https://github.com/reakit/reakit/commit/cc697c6))
* **website:** Add newsletter form ([#194](https://github.com/reakit/reakit/issues/194)) ([3e568ff](https://github.com/reakit/reakit/commit/3e568ff))
* Add `shift` and `flip` props to `Popover` ([#196](https://github.com/reakit/reakit/issues/196)) ([9ee52ed](https://github.com/reakit/reakit/commit/9ee52ed))





<a name="0.14.2"></a>
## [0.14.2](https://github.com/reakit/reakit/compare/website@0.14.1...website@0.14.2) (2018-08-16)

**Note:** Version bump only for package website





<a name="0.14.1"></a>
## 0.14.1 (2018-08-15)


### Features

* Add TypeScript typings to `as`, `Base` and `Arrow` ([#146](https://github.com/reakit/reakit/issues/146)) ([6d8830a](https://github.com/reakit/reakit/commit/6d8830a)), closes [#142](https://github.com/reakit/reakit/issues/142)
