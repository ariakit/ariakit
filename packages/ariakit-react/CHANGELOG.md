# @ariakit/react

## 0.1.7

### Patch Changes

- Fixed `Menu` focusing on the first menu item rather than the menu container when opened with a mouse click. ([#2339](https://github.com/ariakit/ariakit/pull/2339))

- Added `getPersistentElements` prop to `Dialog` to better support third-party elements that are already in the DOM by the time the dialog is opened. ([#2339](https://github.com/ariakit/ariakit/pull/2339))

- Added support on `Dialog` for nested/parallel dialogs, such as portalled dialogs created by third-party libraries and extensions. ([#2339](https://github.com/ariakit/ariakit/pull/2339))

- Fixed nested `Dialog` closing when dragging from the nested dialog to the parent dialog. ([#2339](https://github.com/ariakit/ariakit/pull/2339))

- Fixed build target. ([#2355](https://github.com/ariakit/ariakit/pull/2355))

- Updated JSDocs.

- Updated dependencies: `@ariakit/react-core@0.1.7`, `@ariakit/core@0.1.5`.

## 0.1.6

### Patch Changes

- Fixed `Select` component causing a scroll jump when it's dynamically rendered in a portal. ([#2322](https://github.com/ariakit/ariakit/pull/2322))

- Fixed a bug where passing controlled props to a component store wouldn't always call the state setter with an updated value. ([#2328](https://github.com/ariakit/ariakit/pull/2328))

- Fixed `Menu` not respecting `hidden={false}`. ([#2328](https://github.com/ariakit/ariakit/pull/2328))

- Updated JSDocs.

- Updated dependencies: `@ariakit/react-core@0.1.6`, `@ariakit/core@0.1.4`.

## 0.1.5

### Patch Changes

- Fixed `FormRadio` error when not explicitly providing the composite store. ([#2313](https://github.com/ariakit/ariakit/pull/2313))

- Fixed invariant error messages on `Menu` components. ([#2318](https://github.com/ariakit/ariakit/pull/2318))

- Updated validate and submit callbacks on `Form` so they always run in a consistent order. ([#2319](https://github.com/ariakit/ariakit/pull/2319))

- Fixed nested `Dialog` components when they are conditionally mounted. ([#2310](https://github.com/ariakit/ariakit/pull/2310))

- Updated dependencies: `@ariakit/react-core@0.1.5`, `@ariakit/core@0.1.3`.

## 0.1.4

### Patch Changes

- Added support for the `inert` attribute on the `Dialog` component. If the browser supports `inert`, modal dialogs will now use it rather than focus trap regions. ([#2301](https://github.com/ariakit/ariakit/pull/2301))

- Fixed nested modal `Dialog` also closing the parent dialog when clicking outside. ([#2300](https://github.com/ariakit/ariakit/pull/2300))

- Fixed modal `Dialog` eventually losing focus to `document.body`. ([#2300](https://github.com/ariakit/ariakit/pull/2300))

- Fixed `Combobox` with `autoSelect` and `autoComplete` set to `both` or `inline` where the completion string would lose its selected state. ([#2308](https://github.com/ariakit/ariakit/pull/2308))

- Fixed `Combobox` not processing composition text (like chinese characters or accents). ([#2308](https://github.com/ariakit/ariakit/pull/2308))

- Updated dependencies: `@ariakit/react-core@0.1.4`.

## 0.1.3

### Patch Changes

- Fixed `Dialog` not returning focus when closed when rendered with `React.lazy`. ([#2290](https://github.com/ariakit/ariakit/pull/2290))

- Fixed `Hovercard` being shown on touch/tap on mobile devices. ([#2291](https://github.com/ariakit/ariakit/pull/2291))

- Fixed `Hovercard` not properly cleaning up the timeout to hide the card when
  unmounted. ([#2289](https://github.com/ariakit/ariakit/pull/2289))

- Updated dependencies: `@ariakit/react-core@0.1.3`, `@ariakit/core@0.1.2`.

## 0.1.2

### Patch Changes

- Added missing `defaultValue` prop back to `useRadioStore`. ([#2265](https://github.com/ariakit/ariakit/pull/2265))

- Updated dependencies: `@ariakit/core@0.1.1`, `@ariakit/react-core@0.1.2`.

## 0.1.1

### Patch Changes

- Removed extra `console.log` from `Hovercard`.

- Updated dependencies: `@ariakit/react-core@0.1.1`.

## 0.1.0

### Minor Changes

- `Combobox` doesn't support filtering via the `list` and `matches` props anymore. Instead, you can use a library such as [match-sorter](https://github.com/kentcdodds/match-sorter) to filter the list.

  Before:

  ```jsx
  const combobox = useComboboxState({ list });

  combobox.matches.map((value) => <ComboboxItem key={value} value={value} />);
  ```

  After:

  ```jsx
  const combobox = useComboboxStore();
  const value = combobox.useState("value");
  const matches = useMemo(() => matchSorter(list, value), [value]);

  matches.map((value) => <ComboboxItem key={value} value={value} />);
  ```

  This gives you more control over the filtering process, and you can use any library you want. Besides [match-sorter](https://github.com/kentcdodds/match-sorter), we also recommend [fast-fuzzy](https://github.com/EthanRutherford/fast-fuzzy) for fuzzy matching.

- Replaced state hooks (e.g., `useComboboxState`) with component stores (e.g., `useComboboxStore`).

  Before:

  ```jsx
  const combobox = useComboboxState({ defaultValue: "value" });
  const value = combobox.value;

  <Combobox state={combobox} />;
  ```

  After:

  ```jsx
  const combobox = useComboboxStore({ defaultValue: "value" });
  const value = combobox.useState("value");

  <Combobox store={combobox} />;
  ```

  This change applies to all state hooks, not just combobox, and has some API differences. Please, refer to the TypeScript definitions for more information. Learn more about the motivation behind this change in the [RFC](https://github.com/ariakit/ariakit/issues/1875).

- The `initialFocusRef` and `finalFocusRef` props from `Dialog` and derived components have been renamed to `initialFocus` and `finalFocus` respectively. They now support `HTMLElement` in addition to refs.

  ```diff
  - <Dialog initialFocusRef={initialFocusRef} finalFocusRef={finalFocusRef} />
  + <Dialog initialFocus={initialFocusRef} finalFocus={finalFocusRef} />
  ```

- `useMenuStore` and `useSelectStore` can now receive a `combobox` prop to combine them with a `Combobox` component. This replaces the old method of passing the result of `useComboboxState` directly as an argument to `useMenuState` and `useSelectState`.

  Before:

  ```jsx
  const combobox = useComboboxState();
  const menu = useMenuState(combobox);
  const select = useSelectState(combobox);
  ```

  After:

  ```jsx
  const combobox = useComboboxStore();
  const menu = useMenuStore({ combobox });
  const select = useSelectStore({ combobox });
  ```

- Updated package names to include the `@ariakit` scope, providing a more distinct and specific namespace for our packages.

  Additionally, we've made a change to the versioning system, moving from `v2.0.0-beta.x` to `v0.x.x`. This alteration means that although the library is still in beta, we can release breaking changes in minor versions without disrupting projects that don't set exact versions in their `package.json`.

  ```diff
  - npm i ariakit
  + npm i @ariakit/react
  ```

- We've made changes to the package structure, and component hooks such as `useButton` and `useCheckbox` are no longer exported from `@ariakit/react`. Instead, you can import them from `@ariakit/react-core`:

  ```diff
  - import { useButton } from "@ariakit/react";
  + import { useButton } from "@ariakit/react-core/button/button";
  ```

  By doing so, we can reduce the API surface of the `@ariakit/react` package and move towards a stable release. It's important to note that `@ariakit/react-core` does not follow semver conventions, and breaking changes may be introduced in minor and patch versions.

### Patch Changes

- Packages are now ESM by default (commonjs modules are still available with the `.cjs` extension).

- Updated dependencies: `@ariakit/react-core@0.1.0`, `@ariakit/core@0.1.0`.
