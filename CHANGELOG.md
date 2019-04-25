# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.0.0-alpha.3](https://github.com/reakit/reakit/compare/reakit@1.0.0-alpha.2...reakit@1.0.0-alpha.3) (2019-04-25)


### Bug Fixes

* Fix `Checkbox` not reverting `indeterminate` state when `currentValue` changes ([2ee7455](https://github.com/reakit/reakit/commit/2ee7455))
* Fix `mouseOut` events triggering outside `Dialog`. ([d814ddf](https://github.com/reakit/reakit/commit/d814ddf))
* Fix arrow keys not working on `Menu` when cursor leaves it ([9f278ac](https://github.com/reakit/reakit/commit/9f278ac))
* Fix arrow keys on `MenuItem` incorrectly hiding `Menu` ([94bd9db](https://github.com/reakit/reakit/commit/94bd9db))
* Fix focusing `MenuItem` on mouse over outside an open `Dialog` ([aac7f3c](https://github.com/reakit/reakit/commit/aac7f3c))


### Features

* Add `VisuallyHidden` component ([7b1d826](https://github.com/reakit/reakit/commit/7b1d826))
* Add experimental `KeyBinder` component ([7eb739a](https://github.com/reakit/reakit/commit/7eb739a))
* Render `MenuGroup` as a `div` instead of `fieldset` ([5d4b476](https://github.com/reakit/reakit/commit/5d4b476))
* Return `unstable_wrap` method from props hooks ([f668ae4](https://github.com/reakit/reakit/commit/f668ae4))





# [1.0.0-alpha.2](https://github.com/reakit/reakit/compare/reakit@1.0.0-alpha.1...reakit@1.0.0-alpha.2) (2019-04-17)


### Bug Fixes

* `MenuDisclosure` should close the submenu when in menubar ([d481674](https://github.com/reakit/reakit/commit/d481674))
* Change system's `useProps` order in built-in components ([e679024](https://github.com/reakit/reakit/commit/e679024))
* Fix `DialogDisclosure` not closing `Dialog` on Safari when `hideOnClickOutside` is truthy ([37865cf](https://github.com/reakit/reakit/commit/37865cf))
* Fix `MenuDisclosure` race condition on focus/click ([8a37d31](https://github.com/reakit/reakit/commit/8a37d31))
* Make click/focus behavior cross-browser by automatically focusing `Tabbable` on mouse down ([54b618c](https://github.com/reakit/reakit/commit/54b618c))
* Restore `hasShownOnFocus` state in `MenuDisclosure` ([63228fd](https://github.com/reakit/reakit/commit/63228fd))


### Features

* Add `use` prefix automatically in `useProps`/`useOptions` ([167fda1](https://github.com/reakit/reakit/commit/167fda1))
* Expose `unstable_useSealedState` util ([1540eab](https://github.com/reakit/reakit/commit/1540eab))
* Remove `unstable_` prefix from `currentId` prop ([003d1ad](https://github.com/reakit/reakit/commit/003d1ad))
* Remove `unstable_` prefix from `focusable` prop ([965dcb7](https://github.com/reakit/reakit/commit/965dcb7))
* Remove `unstable_` prefix from `loop`, `move`, `next`, `previous`, `first`, `last` props ([501f822](https://github.com/reakit/reakit/commit/501f822))
* Remove `unstable_` prefix from `manual`, `selectedId`, `select` props ([c36413f](https://github.com/reakit/reakit/commit/c36413f))
* Remove `unstable_` prefix from `stops`, `register` and `unregister` props ([061cc55](https://github.com/reakit/reakit/commit/061cc55))
* Remove focus from `MenuItem` on mouse out ([fdd1bb8](https://github.com/reakit/reakit/commit/fdd1bb8))





# [1.0.0-alpha.1](https://github.com/reakit/reakit/compare/reakit@1.0.0-alpha.0...reakit@1.0.0-alpha.1) (2019-04-09)


### Bug Fixes

* Clicking on an element inside the disclosure should hide Dialog ([93072cb](https://github.com/reakit/reakit/commit/93072cb))


### Features

* Improve Dialog/Menu API ([cf7426f](https://github.com/reakit/reakit/commit/cf7426f))
* Remove `unstable_` prefix from many things ([ec434fc](https://github.com/reakit/reakit/commit/ec434fc))





# [1.0.0-alpha.0](https://github.com/reakit/reakit/compare/reakit@0.16.0-beta.2...reakit@1.0.0-alpha.0) (2019-04-02)

**Note:** Version bump only for package reakit
