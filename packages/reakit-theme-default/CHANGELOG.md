# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="0.1.0"></a>
# [0.1.0](https://github.com/reakit/reakit/tree/master/packages/reakit-theme-default/compare/reakit-theme-default@0.1.0-beta.0...reakit-theme-default@0.1.0) (2018-09-13)

**Note:** Version bump only for package reakit-theme-default





<a name="0.1.0-beta.0"></a>
# 0.1.0-beta.0 (2018-09-13)


### Features

* Add `reakit-theme-default` package ([#188](https://github.com/reakit/reakit/tree/master/packages/reakit-theme-default/issues/188)) ([f9f16ad](https://github.com/reakit/reakit/tree/master/packages/reakit-theme-default/commit/f9f16ad)), closes [#154](https://github.com/reakit/reakit/tree/master/packages/reakit-theme-default/issues/154)


### BREAKING CHANGES

* `Arrow`, `Box`, `Shadow` and `Fit` were removed.

  If you need their styles, look at the [source code before this commit](https://github.com/reakit/reakit/tree/100a833940b65284958988b888c0172ea5468d35/packages/reakit/src) and copy them.
* Almost all styles have been removed from components.

  If you need some basic styles, you should install `reakit-theme-default`. But, since they were rewritten, they may be slightly different from the old styles.

  To learn more, see [Theming](https://reakit.io/guide/theming).
