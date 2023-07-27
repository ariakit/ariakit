# @ariakit/react

## 0.2.14

### Patch Changes

- Fixed `flushSync` warning. ([#2672](https://github.com/ariakit/ariakit/pull/2672))

- Updated dependencies: `@ariakit/react-core@0.2.14`.

## 0.2.13

### Patch Changes

- The `as` prop has been soft deprecated. Use the [`render`](https://ariakit.org/guide/composition) prop instead. ([#2621](https://github.com/ariakit/ariakit/pull/2621))

- The `Combobox` component now properly disables the `autoSelect` behavior when the user is scrolling through the list of options. This should prevent issues when scrolling virtualized or infinite lists. ([#2617](https://github.com/ariakit/ariakit/pull/2617))

- Fixed `Combobox` with `autoSelect` always focusing on the first item when a virtualized list is scrolled using arrow keys. ([#2636](https://github.com/ariakit/ariakit/pull/2636))

- Controlled store updates are now flushed synchronously. This should prevent issues when controlling a `Combobox` by passing `value` and `setValue` to the combobox store, for example. ([#2671](https://github.com/ariakit/ariakit/pull/2671))

- Updated dependencies: `@ariakit/react-core@0.2.13`.

## 0.2.12

### Patch Changes

- Fixed `CompositeItem` not being tabbable before hydration. ([#2601](https://github.com/ariakit/ariakit/pull/2601))

- Updated dependencies: `@ariakit/react-core@0.2.12`.

## 0.2.11

### Patch Changes

- Fixed `Combobox` with `autoSelect` and `autoComplete="both"` so the value is maintained when the combobox input loses focus. ([#2595](https://github.com/ariakit/ariakit/pull/2595))

- Fixed `Combobox` with `autoSelect` prop causing a scroll jump when the popover was opened by typing on the input. ([#2599](https://github.com/ariakit/ariakit/pull/2599))

- Fixed `Combobox` with the `autoSelect` prop not automatically selecting the first option when used in combination with `Select` after the selected option is re-mounted. ([#2592](https://github.com/ariakit/ariakit/pull/2592))

- Updated composite item components with the `focusOnHover` prop set to `true` so that they don't scroll into view when hovered. ([#2590](https://github.com/ariakit/ariakit/pull/2590))

- Fixed `Menu` initial focus when used in combination with `Combobox`. ([#2582](https://github.com/ariakit/ariakit/pull/2582))

- Fixed `Popover` not updating its position when the placement changes while the popover is closed. ([#2587](https://github.com/ariakit/ariakit/pull/2587))

- Fixed `Select` not scrolling selected option into view in Safari. ([#2591](https://github.com/ariakit/ariakit/pull/2591))

- Updated dependencies: `@ariakit/react-core@0.2.11`.

## 0.2.10

### Patch Changes

- Fixed `defaultItems` passed to the collection store being overriden when new items are added. ([#2559](https://github.com/ariakit/ariakit/pull/2559))

- Fixed `Combobox` with the `autoSelect` prop not allowing the user to scroll when the list of items is virtualized. ([#2562](https://github.com/ariakit/ariakit/pull/2562))

- Fixed `Composite` not moving focus to items by pressing the arrow keys when the active item isn't rendered. ([#2561](https://github.com/ariakit/ariakit/pull/2561))

- Fixed `CompositeItem` not being tabbable before hydration. ([#2565](https://github.com/ariakit/ariakit/pull/2565))

- Updated dependencies: `@ariakit/react-core@0.2.10`.

## 0.2.9

### Patch Changes

- Added new `disclosure` prop to the `Disclosure` store. ([#2518](https://github.com/ariakit/ariakit/pull/2518))

- Fixed `Focusable` not receiving focus when rendered as a native button on Safari. ([#2534](https://github.com/ariakit/ariakit/pull/2534))

- Fixed `Dialog` with `preventBodyScroll` set to `true` (default) not preventing body scroll on nested animated dialogs. ([#2534](https://github.com/ariakit/ariakit/pull/2534))

- Updated dependencies: `@ariakit/react-core@0.2.9`.

## 0.2.8

### Patch Changes

- The `render` prop now supports a `ReactElement` as a value. See the [Composition](https://ariakit.org/guide/composition) guide for more information. ([#2486](https://github.com/ariakit/ariakit/pull/2486))

- Updated dependencies: `@ariakit/react-core@0.2.8`.

## 0.2.7

### Patch Changes

- Fixed deeply nested `Dialog` not removing the `inert` attribute from elements outside when closed. ([#2507](https://github.com/ariakit/ariakit/pull/2507))

- Updated dependencies: `@ariakit/react-core@0.2.7`.

## 0.2.6

### Patch Changes

- Added missing `types` field to proxy package.json files. ([#2489](https://github.com/ariakit/ariakit/pull/2489))

- Updated dependencies: `@ariakit/react-core@0.2.6`.

## 0.2.5

### Patch Changes

- Added `.cjs` and `.js` extensions to paths in proxy package.json files to support bundlers that can't automaically resolve them. ([#2487](https://github.com/ariakit/ariakit/pull/2487))

- Updated dependencies: `@ariakit/react-core@0.2.5`.

## 0.2.4

### Patch Changes

- The `Checkbox` component now accepts `string[]` as the `value` prop. This is to conform with the native input prop type. If a string array is passed, it will be stringified, just like in the native input element. ([#2456](https://github.com/ariakit/ariakit/pull/2456))

- Fixed the `clickOnEnter` prop on `Checkbox` not working when rendering the component as a native input element. ([#2456](https://github.com/ariakit/ariakit/pull/2456))

- Fixed typeahead behavior when the composite item element's text content starts with an empty space. ([#2475](https://github.com/ariakit/ariakit/pull/2475))

- Removed the delay before focusing on the final focus element when a dialog is closed. ([#2462](https://github.com/ariakit/ariakit/pull/2462))

- Fixed `Dialog` wrongly focusing on the final focus element when a dialog is closed by clicking on another dialog. ([#2462](https://github.com/ariakit/ariakit/pull/2462))

- Fixed `Disclosure` timing to set the `disclosureElement` state on the disclosure store. ([#2462](https://github.com/ariakit/ariakit/pull/2462))

- Removed the `hideOnControl` prop from `Hovercard`. ([#2478](https://github.com/ariakit/ariakit/pull/2478))

- Fixed clicking outside a `Dialog` when there's an ancestor element between the dialog content element and the portal element. ([#2482](https://github.com/ariakit/ariakit/pull/2482))

- Fixed `Popover` with the `updatePosition` prop not moving focus into the popover when it opens. ([#2482](https://github.com/ariakit/ariakit/pull/2482))

- Updated the `updatePosition` prop type on `Popover` to allow for returning a `Promise`. ([#2482](https://github.com/ariakit/ariakit/pull/2482))

- Updated dependencies: `@ariakit/react-core@0.2.4`.

## 0.2.3

### Patch Changes

- Updated the `SelectPopover` component so the `composite` and `typeahead` props are automatically set to `false` when combining it with a `Combobox` component using the `combobox` prop from the select store. ([#2428](https://github.com/ariakit/ariakit/pull/2428))

  This means you'll not need to explicitly pass `composite={false}` when building a [Select with Combobox](https://ariakit.org/examples/select-combobox) component.

- The `ComboboxItem` component will now register itself on the combobox store even when the combobox is closed. ([#2428](https://github.com/ariakit/ariakit/pull/2428))

- Fixed `Combobox` with `virtualFocus` set to `true` (default) always reseting the focus when using VoiceOver and Safari to navigate through the items. ([#2428](https://github.com/ariakit/ariakit/pull/2428))

- Fixed `autoComplete` prop type on `Combobox` conflicting with the native `autoComplete` prop. ([#2428](https://github.com/ariakit/ariakit/pull/2428))

  It's now possible to extend props from `InputHTMLAttributes` without having to `Omit` the `autoComplete` prop.

- The `SelectList` and `SelectPopover` components will now automatically render the `aria-multiselectable` attribute even when the `composite` prop is set to `false`, but only when the underlying element has a composite role. ([#2428](https://github.com/ariakit/ariakit/pull/2428))

- Fixed `Composite` rendering the `aria-activedescendant` attribute even when the `composite` prop was set to `false`. ([#2428](https://github.com/ariakit/ariakit/pull/2428))

- Fixed `Focusable` triggering focus visible when pressing the <kbd>Alt</kbd>/<kbd>Option</kbd> key. ([#2428](https://github.com/ariakit/ariakit/pull/2428))

- Fixed `activeId` state on `Tab` not updating correctly when setting `selectedId` with the Next.js App Router. ([#2443](https://github.com/ariakit/ariakit/pull/2443))

- Updated dependencies: `@ariakit/react-core@0.2.3`.

## 0.2.2

### Patch Changes

- Added `alwaysVisible` prop to `DisclosureContent` and derived components to allow the content to be visible even when the `open` state is `false`. ([#2438](https://github.com/ariakit/ariakit/pull/2438))

- Fixed `useHovercardStore` and `useTooltipStore` not updating the state when the `timeout`, `showTimeout` or `hideTimeout` props changed. ([#2421](https://github.com/ariakit/ariakit/pull/2421))

- Fixed `useTooltipStore` not updating the state when the `type` or `skipTimeout` props changed. ([#2421](https://github.com/ariakit/ariakit/pull/2421))

- Fixed `Dialog` moving focus on show and hide too early. ([#2421](https://github.com/ariakit/ariakit/pull/2421))

- Fixed `Hovercard` and `Tooltip` hiding too early when pressing the `Escape` key. ([#2421](https://github.com/ariakit/ariakit/pull/2421))

- Removed unnecessary `tabIndex={0}` prop from `TooltipAnchor`. ([#2421](https://github.com/ariakit/ariakit/pull/2421))

- Updated dependencies: `@ariakit/react-core@0.2.2`.

## 0.2.1

### Patch Changes

- Added a `render` prop to all components as a more flexible alternative to `children` as a function. ([#2411](https://github.com/ariakit/ariakit/pull/2411))

- Updated dependencies: `@ariakit/react-core@0.2.1`.

## 0.2.0

### Minor Changes

- **BREAKING**: Moved props from the `usePopoverStore` hook to the `Popover` component: `fixed`, `gutter`, `shift`, `flip`, `slide`, `overlap`, `sameWidth`, `fitViewport`, `arrowPadding`, `overflowPadding`, `getAnchorRect`, `renderCallback` (renamed to `updatePosition`). ([#2279](https://github.com/ariakit/ariakit/pull/2279))

  The exception is the `placement` prop that should still be passed to the store.

  **Before**:

  ```jsx
  const popover = usePopoverStore({
    placement: "bottom",
    fixed: true,
    gutter: 8,
    shift: 8,
    flip: true,
    slide: true,
    overlap: true,
    sameWidth: true,
    fitViewport: true,
    arrowPadding: 8,
    overflowPadding: 8,
    getAnchorRect: (anchor) => anchor?.getBoundingClientRect(),
    renderCallback: (props) => props.defaultRenderCallback(),
  });

  <Popover store={popover} />;
  ```

  **After**:

  ```jsx
  const popover = usePopoverStore({ placement: "bottom" });

  <Popover
    store={popover}
    fixed
    gutter={8}
    shift={8}
    flip
    slide
    overlap
    sameWidth
    fitViewport
    arrowPadding={8}
    overflowPadding={8}
    getAnchorRect={(anchor) => anchor?.getBoundingClientRect()}
    updatePosition={(props) => props.updatePosition()}
  />;
  ```

  This change affects all the hooks and components that use `usePopoverStore` and `Popover` underneath: `useComboboxStore`, `ComboboxPopover`, `useHovercardStore`, `Hovercard`, `useMenuStore`, `Menu`, `useSelectStore`, `SelectPopover`, `useTooltipStore`, `Tooltip`.

  With this change, the underlying `@floating-ui/dom` dependency has been also moved to the `Popover` component, which means it can be lazy loaded. See the [Lazy Popover](https://ariakit.org/examples/popover-lazy) example.

- **BREAKING**: The backdrop element on the `Dialog` component is now rendered as a sibling rather than as a parent of the dialog. This should make it easier to animate them separately. ([#2407](https://github.com/ariakit/ariakit/pull/2407))

  This might be a breaking change if you're relying on their parent/child relationship for styling purposes (for example, to position the dialog in the center of the backdrop). If that's the case, you can apply the following styles to the dialog to achieve the same effect:

  ```css
  .dialog {
    position: fixed;
    inset: 1rem;
    margin: auto;
    height: fit-content;
    max-height: calc(100vh - 2 * 1rem);
  }
  ```

  These styles work even if the dialog is a child of the backdrop, so you can use them regardless of whether you're upgrading to this version or not.

### Patch Changes

- Deprecated the `backdropProps` prop on the `Dialog` component. Use the `backdrop` prop instead. ([#2407](https://github.com/ariakit/ariakit/pull/2407))

- The `backdrop` prop on the `Dialog` component now accepts a JSX element as its value. ([#2407](https://github.com/ariakit/ariakit/pull/2407))

- The `Dialog` component will now wait for being unmounted before restoring the body scroll when the `hidden` prop is set to `false`. This should prevent the body scroll from being restored too early when the dialog is being animated out using third-party libraries like Framer Motion. ([#2407](https://github.com/ariakit/ariakit/pull/2407))

- The `Tooltip` component now defaults to use `aria-describedby` instead of `aria-labelledby`. ([#2279](https://github.com/ariakit/ariakit/pull/2279))

  If you want to use the tooltip as a label for an anchor element, you can use the `type` prop on `useTooltipStore`:

  ```jsx
  useTooltipStore({ type: "label" });
  ```

- The `Tooltip` component now supports mouse events. ([#2279](https://github.com/ariakit/ariakit/pull/2279))

  It's now possible to hover over the tooltip without it disappearing, which makes it compliant with [WCAG 1.4.13](https://www.w3.org/WAI/WCAG21/Understanding/content-on-hover-or-focus.html).

- Fixed infinite loop on `Portal` with the `preserveTabOrder` prop set to `true` when the portalled element is placed right after its original position in the React tree. ([#2279](https://github.com/ariakit/ariakit/pull/2279))

- Updated dependencies: `@ariakit/react-core@0.2.0`.

## 0.1.8

### Patch Changes

- Fixed `DialogBackdrop` not including the `data-backdrop` attribute in the initial render, causing a flash of unstyled content when the dialog is initially open. ([#2369](https://github.com/ariakit/ariakit/pull/2369))

- Fixed `Dialog` calling `hideOnInteractOutside` twice when clicking on the backdrop. ([#2369](https://github.com/ariakit/ariakit/pull/2369))

- The built-in `DialogBackdrop` component is no longer focusable. ([#2369](https://github.com/ariakit/ariakit/pull/2369))

- Call `autoFocusOnHide` and `autoFocusOnShow` with a `null` argument when there's no element to focus or the element is not focusable. This allows users to specify a fallback element to focus on hide or show. ([#2369](https://github.com/ariakit/ariakit/pull/2369))

- Updated dependencies: `@ariakit/react-core@0.1.8`.

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
