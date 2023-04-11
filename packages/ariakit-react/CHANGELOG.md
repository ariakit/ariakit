# @ariakit/react

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
