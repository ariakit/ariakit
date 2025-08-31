# @ariakit/core

## 0.4.16

- Updated `Array` types to `ReadonlyArray` for better compatibility.

## 0.4.15

- Fixed `valid` state not updating on [Form](https://ariakit.org/components/form).

## 0.4.14

- Fixed a regression on [Hovercard](https://ariakit.org/components/hovercard) that sometimes prevented it from closing when other popups were opened.
- Fixed typings for [`onSubmit`](https://ariakit.org/reference/use-form-store#onsubmit) and [`onValidate`](https://ariakit.org/reference/use-form-store#onvalidate).
- Improved JSDocs.

## 0.4.13

- Fixed the [`item`](https://ariakit.org/reference/use-collection-store#item) method to prevent it from returning items that have been removed from the collection store.
- Fixed the [`item`](https://ariakit.org/reference/use-menu-store#item) method when keeping different menu stores in sync.
- Added [`id`](https://ariakit.org/reference/use-composite-store#id) prop to composite stores.
- Added `sortBasedOnDOMPosition` function.
- Updated core utils.
- Improved JSDocs.

## 0.4.12

- Fixed regression in [`focusShift`](https://ariakit.org/reference/composite-provider#focusshift).
- Improved JSDocs.

## 0.4.11

### Overriding composite state for specific methods

The [`next`](https://ariakit.org/reference/use-composite-store#next), [`previous`](https://ariakit.org/reference/use-composite-store#previous), [`up`](https://ariakit.org/reference/use-composite-store#up), and [`down`](https://ariakit.org/reference/use-composite-store#down) methods of the [composite store](https://ariakit.org/reference/use-composite-store) now accept an object as the first argument to override the composite state for that specific method. For example, you can pass a different [`activeId`](https://ariakit.org/reference/use-composite-store#activeid) value to the [`next`](https://ariakit.org/reference/use-composite-store#next) method so it returns the next item based on that value rather than the current active item in the composite store:

```js
const store = useCompositeStore({ defaultActiveId: "item1" });
const item3 = store.next({ activeId: "item2" });
```

It's important to note that the composite state is not modified when using this feature. The state passed to these methods is used solely for that specific method call.

### Other updates

- Fixed CJS build on Next.js.
- Fixed `getScrollingElement` to consider `overflow: clip`.
- Improved JSDocs.

## 0.4.10

### Tabs inside animated Combobox or Select

When rendering [Tab](https://ariakit.org/components/tab) inside [Combobox](https://ariakit.org/components/combobox) or [Select](https://ariakit.org/components/select), it now waits for the closing animation to finish before restoring the tab with the selected item. This should prevent an inconsistent UI where the tab is restored immediately while the content is still animating out. See [Select with Combobox and Tabs](https://ariakit.org/examples/select-combobox-tab).

### Other updates

- Updated [Combobox](https://ariakit.org/components/combobox) to immediately reset the [`activeId`](https://ariakit.org/reference/use-combobox-store#activeid) upon closing the popover.
- Improved JSDocs.

## 0.4.9

- Improved JSDocs.

## 0.4.8

- Added a README file to the package.
- Improved JSDocs.

## 0.4.7

- Improved JSDocs.

## 0.4.6

- Ensured [Combobox](https://ariakit.org/components/combobox) uses roving tabindex to manage focus on mobile Safari.
- Added a new `listElement` state to the Select store.
- Removed unnecessary utility functions: `closest`, `matches`.
- Improved use of [Tab](https://ariakit.org/components/tab) components within [Select](https://ariakit.org/components/select) widgets.
- Improved JSDocs.

## 0.4.5

- Added new `undo` utils.
- Added new experimental Tag components.
- Added DOM utils: `isTextbox`, `getTextboxValue`.
- Added event function: `getInputType`.
- Added new [`resetValue`](https://ariakit.org/reference/use-combobox-store#resetvalue) method to combobox store.
- Improved JSDocs.

## 0.4.4

### Combobox `autoFocusOnHide` behavior

Previously, the [`autoFocusOnHide`](https://ariakit.org/reference/combobox-popover#autofocusonhide) feature on [`ComboboxPopover`](https://ariakit.org/reference/combobox-popover) was turned off by default. Most of the time, this didn't have any practical impact because the combobox input element was already focused when the popover was hidden.

Now, this feature is enabled by default and should work consistently even when [`virtualFocus`](https://ariakit.org/reference/combobox-provider#virtualfocus) is set to `false`.

### Other updates

- Improved JSDocs.

## 0.4.3

- Fixed regression in `v0.4.2` that caused nested tabs to stop working.
- Added new [`combobox`](https://ariakit.org/reference/tab-provider#combobox) property to tab store.
- Improved JSDocs.
- Fixed TypeScript error on `defaultValue`.

## 0.4.2

- Fixed [`Focusable`](https://ariakit.org/reference/focusable) to identify `summary` as a native tabbable element.
- Added new [`composite`](https://ariakit.org/reference/tab-provider#composite) property to tab store.
- Improved JSDocs.

## 0.4.1

- Added [`disclosure`](https://ariakit.org/reference/use-disclosure-store#disclosure-1) property to disclosure stores.
- Improved JSDocs.

## 0.4.0

### Improved animation support

This version enhances support for CSS animations and transitions on Ariakit components that use [Disclosure](https://ariakit.org/component/disclosure). This includes [Dialog](https://ariakit.org/components/dialog), [Popover](https://ariakit.org/components/popover), [Combobox](https://ariakit.org/components/combobox), [Select](https://ariakit.org/components/select), [Hovercard](https://ariakit.org/components/hovercard), [Menu](https://ariakit.org/components/menu), and [Tooltip](https://ariakit.org/components/tooltip).

These components now support _enter_ and _leave_ transitions and animations right out of the box, eliminating the need to provide an explicit `animated` prop. If an enter animation is detected, the component will automatically wait for a leave animation to complete before unmounting or hiding itself.

Use the [`[data-enter]`](https://ariakit.org/guide/styling#data-enter) selector for CSS transitions. For CSS animations, use the newly introduced [`[data-open]`](https://ariakit.org/guide/styling#data-open) selector. The [`[data-leave]`](https://ariakit.org/guide/styling#data-leave) selector can be used for both transitions and animations.

### Composite widgets with `grid` role

**BREAKING** if you're manually setting the `role="grid"` prop on a composite widget.

Ariakit automatically assigns the `role` prop to all composite items to align with the container `role`. For example, if [`SelectPopover`](https://ariakit.org/reference/select-popover) has its role set to `listbox` (which is the default value), its owned [`SelectItem`](https://ariakit.org/reference/select-item) elements will automatically get their role set to `option`.

In previous versions, this was also valid for composite widgets with a `grid` role, where the composite item element would automatically be given `role="gridcell"`. This is no longer the case, and you're now required to manually pass `role="gridcell"` to the composite item element if you're rendering a container with `role="grid"`.

Before:

```jsx
<SelectPopover role="grid">
  <SelectRow> {/* Automatically gets role="row" */}
    <SelectItem> {/* Automatically gets role="gridcell" */}
```

After:

```jsx
<SelectPopover role="grid">
  <SelectRow> {/* Still gets role="row" */}
    <SelectItem role="gridcell">
```

This change is due to the possibility of rendering a composite item element with a different role as a child of a static `div` with `role="gridcell"`, which is a valid and frequently used practice when using the `grid` role. As a result, you no longer have to manually adjust the `role` prop on the composite item:

```jsx
<SelectPopover role="grid">
  <SelectRow>
    <div role="gridcell">
      <SelectItem render={<button />}>
```

Previously, you had to explicitly pass `role="button"` to the [`SelectItem`](https://ariakit.org/reference/select-item) component above, otherwise it would automatically receive `role="gridcell"`, leading to an invalid accessibility tree.

### Other updates

- Added `removeUndefinedValues` utility function.
- Added new [`disclosure`](https://ariakit.org/reference/use-disclosure-store#disclosure-1) property to disclosure stores.

## 0.3.11

### Improved performance of large collections

Components like [`MenuItem`](https://ariakit.org/reference/menu-item), [`ComboboxItem`](https://ariakit.org/reference/combobox-item), and [`SelectItem`](https://ariakit.org/reference/select-item) should now offer improved performance when rendering large collections.

### Other updates

- Improved JSDocs.

## 0.3.10

- Fixed [`CompositeItem`](https://ariakit.org/reference/composite-item) triggering blur on focus.
- Improved JSDocs.

## 0.3.9

- Fixed `Maximum update depth exceeded` warning when rendering multiple collection items on the page.
- Improved JSDocs.

## 0.3.8

- Fixed [`CollectionItem`](https://ariakit.org/reference/collection-item) elements getting out of order when composing stores.
- Fixed unmounted [`SelectPopover`](https://ariakit.org/reference/select-popover) not re-opening when its [`open`](https://ariakit.org/reference/select-provider#open) state is initially set to `true`.
- Fixed TypeScript build errors.

## 0.3.7

### Multi-selectable Combobox

We've added support for the [Combobox](https://ariakit.org/components/combobox) with multiple selection capabilities using a new [`selectedValue`](https://ariakit.org/reference/combobox-provider#selectedvalue) prop, along with [`defaultSelectedValue`](https://ariakit.org/reference/combobox-provider#defaultselectedvalue) and [`setSelectedValue`](https://ariakit.org/reference/combobox-provider#setselectedvalue).

This works similarly to the [`value`](https://ariakit.org/reference/select-provider#value) prop on [Select](https://ariakit.org/components/select) components. If it receives an array, the combobox will allow multiple selections. By default, it's a string that represents the selected value in a single-select combobox.

Check out the [Multi-selectable Combobox](https://ariakit.org/examples/combobox-multiple) example to see it in action.

### Other updates

- Added [`resetValueOnSelect`](https://ariakit.org/reference/combobox-provider#resetvalueonselect) state to [Combobox](https://ariakit.org/components/combobox) components.

## 0.3.6

- Fixed `setSelectionRange` error when used with [unsupported](https://html.spec.whatwg.org/multipage/input.html#concept-input-apply) input types.

## 0.3.5

- Added new `menubar` module.

## 0.3.4

### Patch Changes

- [`#2935`](https://github.com/ariakit/ariakit/pull/2935) Fixed TypeScript declaration files in CommonJS projects using `NodeNext` for `moduleResolution`.

- [`#2945`](https://github.com/ariakit/ariakit/pull/2945) Added new `disabledFromProps` function to `@ariakit/core/utils/misc`.

- [`#2948`](https://github.com/ariakit/ariakit/pull/2948) Added `"use client"` directive to all modules.

- Improved JSDocs.

## 0.3.3

### Patch Changes

- [`#2909`](https://github.com/ariakit/ariakit/pull/2909) Fixed [Disclosure](https://ariakit.org/components/disclosure) and related components not waiting for the exit animation to complete before hiding the content element.

- Improved JSDocs.

## 0.3.2

### Patch Changes

- Improved JSDocs.

## 0.3.1

### Patch Changes

- [`#2801`](https://github.com/ariakit/ariakit/pull/2801) Fixed `values.slice` error that would occur when clicking on `FormCheckbox` that uses an integer-like field name.

## 0.3.0

### Minor Changes

- [`#2783`](https://github.com/ariakit/ariakit/pull/2783) **BREAKING** _(This should affect very few people)_: The `select` and `menu` props on `useComboboxStore` have been removed. If you need to compose `Combobox` with `Select` or `Menu`, use the `combobox` prop on `useSelectStore` or `useMenuStore` instead.

- [`#2745`](https://github.com/ariakit/ariakit/pull/2745) Component stores will now throw an error if they receive another store prop in conjunction with default prop values.

### Patch Changes

- [`#2782`](https://github.com/ariakit/ariakit/pull/2782) Fixed form store not synchrozining validate and submit callbacks with another form store through the `store` property.

- [`#2783`](https://github.com/ariakit/ariakit/pull/2783) Component store objects now contain properties for the composed stores passed to them as props. For instance, `useSelectStore({ combobox })` will return a `combobox` property if the `combobox` prop is specified.

- [`#2785`](https://github.com/ariakit/ariakit/pull/2785) Added `parent` and `menubar` properties to the menu store. These properties are automatically set when rendering nested menus or menus within a menubar.

  Now, it also supports rendering nested menus that aren't nested in the React tree. In this case, you would have to supply the parent menu store manually to the child menu store.

  These properties are also included in the returned menu store object, allowing you to verify whether the menu is nested. For instance:

  ```jsx
  const menu = useMenuStore(props);
  const isNested = Boolean(menu.parent);
  ```

- [`#2796`](https://github.com/ariakit/ariakit/pull/2796) Composed store props such as `useSelectStore({ combobox })` now accept `null` as a value.

## 0.2.9

### Patch Changes

- [`#2709`](https://github.com/ariakit/ariakit/pull/2709) Fixed `addGlobalEventListener` function when used in a document with sandbox iframes.

## 0.2.8

### Patch Changes

- Removed private properties from the store object. ([#2706](https://github.com/ariakit/ariakit/pull/2706))

  Instead of accessing `store.setup`, `store.sync`, `store.subscribe`, etc. directly, use the equivalent functions exported by the `@ariakit/core/utils/store` module.

## 0.2.7

### Patch Changes

- Added new `EmptyObject` type export to `@ariakit/core/utils/types`. ([#2553](https://github.com/ariakit/ariakit/pull/2553))

## 0.2.6

### Patch Changes

- Fixed `defaultItems` passed to the collection store being overriden when new items are added. ([#2559](https://github.com/ariakit/ariakit/pull/2559))

## 0.2.5

### Patch Changes

- Added new `disclosure` prop to the `Disclosure` store. ([#2518](https://github.com/ariakit/ariakit/pull/2518))

## 0.2.4

### Patch Changes

- Added missing `types` field to proxy package.json files. ([#2489](https://github.com/ariakit/ariakit/pull/2489))

## 0.2.3

### Patch Changes

- Added `.cjs` and `.js` extensions to paths in proxy package.json files to support bundlers that can't automaically resolve them. ([#2487](https://github.com/ariakit/ariakit/pull/2487))

## 0.2.2

### Patch Changes

- Updated the `SelectPopover` component so the `composite` and `typeahead` props are automatically set to `false` when combining it with a `Combobox` component using the `combobox` prop from the select store. ([#2428](https://github.com/ariakit/ariakit/pull/2428))

  This means you'll not need to explicitly pass `composite={false}` when building a [Select with Combobox](https://ariakit.org/examples/select-combobox) component.

- Updated `getScrollingElement` function so it also considers horizontal scrolling elements.

- Fixed `StringWithValue` utility type.

- Fixed `activeId` state on `Tab` not updating correctly when setting `selectedId` with the Next.js App Router. ([#2443](https://github.com/ariakit/ariakit/pull/2443))

## 0.2.1

### Patch Changes

- Fixed `useHovercardStore` and `useTooltipStore` not updating the state when the `timeout`, `showTimeout` or `hideTimeout` props changed. ([#2421](https://github.com/ariakit/ariakit/pull/2421))

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

## 0.1.5

### Patch Changes

- Updated `isFocusable` function to return `false` when the element is `inert` or is a descendant of an `inert` element. ([#2339](https://github.com/ariakit/ariakit/pull/2339))

- Fixed build target. ([#2355](https://github.com/ariakit/ariakit/pull/2355))

- Updated JSDocs.

## 0.1.4

### Patch Changes

- Updated JSDocs.

## 0.1.3

### Patch Changes

- Added support for native radio buttons within forms, that work with roving tabindex, to all `focus` utilities. ([#2313](https://github.com/ariakit/ariakit/pull/2313))

- Updated validate and submit callbacks on `Form` so they always run in a consistent order. ([#2319](https://github.com/ariakit/ariakit/pull/2319))

- Marked internal store functions as deprecated/experimental. ([#2316](https://github.com/ariakit/ariakit/pull/2316))

## 0.1.2

### Patch Changes

- Added `isFalsyBooleanCallback` method.

## 0.1.1

### Patch Changes

- Added missing `defaultValue` prop back to `useRadioStore`. ([#2265](https://github.com/ariakit/ariakit/pull/2265))

## 0.1.0

### Minor Changes

- Updated package names to include the `@ariakit` scope, providing a more distinct and specific namespace for our packages.

  Additionally, we've made a change to the versioning system, moving from `v2.0.0-beta.x` to `v0.x.x`. This alteration means that although the library is still in beta, we can release breaking changes in minor versions without disrupting projects that don't set exact versions in their `package.json`.

  ```diff
  - npm i ariakit
  + npm i @ariakit/react
  ```

### Patch Changes

- Packages are now ESM by default (commonjs modules are still available with the `.cjs` extension).
