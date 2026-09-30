# @ariakit/solid-components

## 0.1.8

### More HTML helpers for `Role`

[`Role`](https://ariakit.com/reference/role) now includes helpers for standard HTML elements such as `kbd`, `hr`, `code`, `main`, `fieldset`, and `table` in React and Solid. Each helper renders its named element and accepts its native props and ref, with the same composition options as existing helpers.

```tsx
<Role.kbd>⌘K</Role.kbd>
<Role.hr />
<Role.time dateTime="2026-09-09">September 9</Role.time>
```

### Other updates

- Updated dependencies: `@ariakit/components@0.1.13`, `@ariakit/utils@0.2.1`, `@ariakit/solid-utils@0.1.8`

## 0.1.7

- Updated dependencies: `@ariakit/utils@0.2.0`, `@ariakit/solid-utils@0.1.7`

## 0.1.6

- Updated dependencies: `@ariakit/utils@0.1.6`, `@ariakit/solid-utils@0.1.6`

## 0.1.5

- Updated dependencies: `@ariakit/utils@0.1.5`, `@ariakit/solid-utils@0.1.5`

## 0.1.4

- Fixed [`Group`](https://ariakit.com/reference/group) to ignore its internal [`GroupLabel`](https://ariakit.com/reference/group-label) reference when `aria-label` is passed.
- Fixed Solid component hooks such as [`VisuallyHidden`](https://ariakit.com/reference/visually-hidden) and [`FocusTrapRegion`](https://ariakit.com/reference/focus-trap-region) to return usable props when called without arguments, matching their optional props type.
- Updated dependencies: `@ariakit/utils@0.1.4`, `@ariakit/solid-utils@0.1.4`

## 0.1.3

- Updated [`VisuallyHidden`](https://ariakit.com/reference/visually-hidden) to hide content with the modern `clip-path: inset(50%)` technique instead of the deprecated `clip` property. The same technique now applies to the other elements Ariakit hides visually, such as the [`Select`](https://ariakit.com/reference/select) value mirror and the [`Dialog`](https://ariakit.com/reference/dialog) dismiss button.
- Updated dependencies: `@ariakit/utils@0.1.3`, `@ariakit/solid-utils@0.1.3`

## 0.1.2

- Fixed runtime `process.env.NODE_ENV` checks in published package output, including test-only behavior and development warnings.
- Updated dependencies: `@ariakit/utils@0.1.2`, `@ariakit/solid-utils@0.1.2`

## 0.1.1

- Release artifacts now include npm trusted publishing provenance.
- Updated dependencies: `@ariakit/utils@0.1.1`, `@ariakit/solid-utils@0.1.1`

## 0.1.0

### Added component packages

The internal component packages are now available under these names:

- `@ariakit/components`
- `@ariakit/react-components`
- `@ariakit/solid-components`

### Other updates

- Updated dependencies: `@ariakit/utils@0.1.0`, `@ariakit/solid-utils@0.1.0`

## 0.0.0

Initial release.
