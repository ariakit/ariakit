<a name="0.12.0"></a>
# [0.12.0](https://github.com/reakit/reakit/compare/v0.11.2...v0.12.0) (2018-07-18)


### Features

* **Hidden:** Add transition props ([#147](https://github.com/reakit/reakit/issues/147)) ([db8a801](https://github.com/reakit/reakit/commit/db8a801))
* **Hidden:** Replace destroy prop by unmount ([#145](https://github.com/reakit/reakit/issues/145)) ([07308ba](https://github.com/reakit/reakit/commit/07308ba))
* **Perpendicular:** Add alignOffset prop ([#150](https://github.com/reakit/reakit/issues/150)) ([e1823d6](https://github.com/reakit/reakit/commit/e1823d6))
* **Perpendicular:** Add angle prop ([#149](https://github.com/reakit/reakit/issues/149)) ([4ce1a64](https://github.com/reakit/reakit/commit/4ce1a64))
* Make prop-types a dependency ([#151](https://github.com/reakit/reakit/issues/151)) ([a31efd9](https://github.com/reakit/reakit/commit/a31efd9))
* **TableCell:** Replace header prop by as="th" ([#152](https://github.com/reakit/reakit/issues/152)) ([9e1a37c](https://github.com/reakit/reakit/commit/9e1a37c))


### BREAKING CHANGES

* **TableCell:** `header` prop was removed in favor of `<TableCell as="th" />`.
* **Perpendicular:** The default value of the `gutter` prop on `Perpendicular` has been changed to `0`.
* **Perpendicular:** `PopoverArrow` and `TooltipArrow`, when their `align` prop is either `start` or `end` have a `0.5rem` offset.
* **Perpendicular:** Replaced `reverse` by `angle` prop on `Perpendicular`.
* **Hidden:** `styleProp` was removed from `Hidden`. Now, it changes the `display` property unless you pass an `animated` prop or one of the transition props (`fade`, `expand` and/or `slide`).
* **Hidden:** `PopoverArrow` is slightly smaller and has `border: 0`. It's more like a fix.
* **Hidden:** `onEnter` and `onExit` was removed from `Step`. They'll be replaced in the future (if people come up with use cases) by `onShow` and `onHide` on the `Hidden` component.
* **Hidden:** `Step` now requires `isCurrent` prop instead of `current` and `indexOf`. If you're already passing the entire state `{...step}` as props, you don't need to change anything.
* **Hidden:** `Hidden`'s `destroy` prop was replaced by `unmount`.



<a name="0.11.2"></a>
## [0.11.2](https://github.com/reakit/reakit/compare/v0.11.1...v0.11.2) (2018-07-18)


### Bug Fixes

* **Table:** Use theme.Table ([a4bed90](https://github.com/reakit/reakit/commit/a4bed90))
* **TabsPanel:** Make it possible to pass visible to TabsPanel ([#144](https://github.com/reakit/reakit/issues/144)) ([54a8f9a](https://github.com/reakit/reakit/commit/54a8f9a))




