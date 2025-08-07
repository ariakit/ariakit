# @ariakit/react-core

## 0.4.17

- Restored support for React 17 in [`PopoverArrow`](https://ariakit.org/reference/popover-arrow).

## 0.4.16

### Improved `PopoverArrow`

The [`PopoverArrow`](https://ariakit.org/reference/popover-arrow) component now attempts to infer its border width from the popover’s `box-shadow` style when all lengths are `0px` and the spread radius exceeds `0px` (e.g., `box-shadow: 0 0 0 1px black`), which is commonly known as a "ring". If the border width cannot be inferred, you can use the new [`borderWidth`](https://ariakit.org/reference/popover-arrow#borderwidth) prop to define it. This ensures a consistent size regardless of the arrow's size, which wasn't achievable before when manually setting the CSS `stroke-width` property.

In addition, the arrow’s SVG path has been slightly modified to be more angled in the pointing direction. Note that you can always provide your own SVG using the `children` prop.

### Scrolling behavior when closing dialogs and popovers

When hiding a dialog or popover, the [`finalFocus`](https://ariakit.org/reference/dialog#finalfocus) element will no longer scroll into view. This change prevents scrolling issues when the element lies outside the viewport and mirrors the behavior of native HTML dialog and popover elements.

### Other updates

- Fixed [`data-focus-visible`](https://ariakit.org/guide/styling#data-focus-visible) attribute removal on lower-end devices.
- Fixed [Select](https://ariakit.org/components/select) not passing down the [`disabled`](https://ariakit.org/reference/select#disabled) prop to the native select element.
- Fixed [Dialog](https://ariakit.org/components/dialog) initial focus behavior in Safari for non-focusable elements.
- Fixed `valid` state not updating on [Form](https://ariakit.org/components/form).
- Fixed [`moveOnKeyPress`](https://ariakit.org/reference/composite#moveonkeypress) being triggered with composition text commands.
- Updated dependencies: `@ariakit/core@0.4.15`

## 0.4.15

- Fixed a regression on [Hovercard](https://ariakit.org/components/hovercard) that sometimes prevented it from closing when other popups were opened.
- Fixed typings for [`onSubmit`](https://ariakit.org/reference/use-form-store#onsubmit) and [`onValidate`](https://ariakit.org/reference/use-form-store#onvalidate).
- Improved JSDocs.
- Updated dependencies: `@ariakit/core@0.4.14`

## 0.4.14

### Improved performance on composite widgets

Composite item components such as [`ComboboxItem`](https://ariakit.org/reference/combobox-item) and [`SelectItem`](https://ariakit.org/reference/select-item) now render 20-30% faster compared to Ariakit v0.4.13.

This enhancement should decrease the time needed to render large collections of items in composite widgets and improve the Interaction to Next Paint (INP) metric. We're working on further optimizations to make composite widgets even faster in future releases.

### Combobox auto-scroll

The [`Combobox`](https://ariakit.org/reference/combobox) component now scrolls the list to the top while typing when the [`autoSelect`](https://ariakit.org/reference/combobox#autoselect) prop is disabled.

The behavior is now consistent with the [`autoSelect`](https://ariakit.org/reference/combobox#autoselect) prop, except the first item won't be automatically focused.

### Other updates

- Fixed the [`item`](https://ariakit.org/reference/use-collection-store#item) method to prevent it from returning items that have been removed from the collection store.
- Fixed the [`item`](https://ariakit.org/reference/use-menu-store#item) method when keeping different menu stores in sync.
- Added experimental `offscreenBehavior` prop to collection and composite item components.
- Added [`id`](https://ariakit.org/reference/use-composite-store#id) prop to composite stores.
- Fixed composite typeahead functionality when rendering virtualized lists.
- Added `useStoreStateObject` function.
- Fixed `TagInput` when pasting content with final newline.
- Fixed [`SelectValue`](https://ariakit.org/reference/select-value) to display the [`fallback`](https://ariakit.org/reference/select-value#fallback) when the value is an empty array or string.
- Fixed an issue where composite widgets might not navigate to the correct item when pressing <kbd>↑</kbd> while the composite base element was focused.
- Improved JSDocs.
- Updated dependencies: `@ariakit/core@0.4.13`

## 0.4.13

### Accessible composite widgets with invalid `activeId`

We've improved the logic for composite widgets such as [Tabs](https://ariakit.org/components/tab) and [Toolbar](https://ariakit.org/components/toolbar) when the [`activeId`](https://ariakit.org/reference/composite-provider#activeid) state points to an element that is disabled or missing from the DOM. This can happen if an item is dynamically removed, disabled, or lazily rendered, potentially making the composite widget inaccessible to keyboard users.

Now, when the [`activeId`](https://ariakit.org/reference/composite-provider#activeid) state is invalid, all composite items will remain tabbable, enabling users to <kbd>Tab</kbd> into the composite widget. Once a composite item receives focus or the element referenced by the [`activeId`](https://ariakit.org/reference/composite-provider#activeid) state becomes available, the roving tabindex behavior is restored.

### Other updates

- Fixed regression in [`focusShift`](https://ariakit.org/reference/composite-provider#focusshift).
- Fixed [Radio](https://ariakit.org/components/radio) to prevent `onChange` from triggering on radios that are already checked.
- Fixed [`DisclosureContent`](https://ariakit.org/reference/disclosure-content) setting an incorrect `animating` state value during enter animations.
- Improved JSDocs.
- Updated dependencies: `@ariakit/core@0.4.12`

## 0.4.12

### Tab panels with scroll restoration

Ariakit now supports scroll restoration for the [`TabPanel`](https://ariakit.org/reference/tab-panel) component. This allows you to control whether and how the scroll position is restored when switching tabs.

To enable scroll restoration, use the new [`scrollRestoration`](https://ariakit.org/reference/tab-panel#scrollrestoration) prop:

```jsx
// Restores the scroll position of the tab panel element when switching tabs
<TabPanel scrollRestoration />
```

By default, the scroll position is restored when switching tabs. You can set it to `"reset"` to return the scroll position to the top of the tab panel when changing tabs. Use the [`scrollElement`](https://ariakit.org/reference/tab-panel#scrollelement) prop to specify a different scrollable element:

```jsx
// Resets the scroll position of a different scrollable element
<div className="overflow-auto">
  <TabPanel
    scrollRestoration="reset"
    scrollElement={(panel) => panel.parentElement}
  />
</div>
```

### Full height dialogs and on-screen virtual keyboards

A new [`--dialog-viewport-height`](https://ariakit.org/guide/styling#--dialog-viewport-height) CSS variable has been added to the [Dialog](https://ariakit.org/components/dialog) component. This variable exposes the height of the visual viewport, considering the space taken by virtual keyboards on mobile devices. Use this CSS variable when you have input fields in your dialog to ensure it always fits within the visual viewport:

```css
.dialog {
  max-height: var(--dialog-viewport-height, 100dvh);
}
```

### Overriding composite state for specific methods

The [`next`](https://ariakit.org/reference/use-composite-store#next), [`previous`](https://ariakit.org/reference/use-composite-store#previous), [`up`](https://ariakit.org/reference/use-composite-store#up), and [`down`](https://ariakit.org/reference/use-composite-store#down) methods of the [composite store](https://ariakit.org/reference/use-composite-store) now accept an object as the first argument to override the composite state for that specific method. For example, you can pass a different [`activeId`](https://ariakit.org/reference/use-composite-store#activeid) value to the [`next`](https://ariakit.org/reference/use-composite-store#next) method so it returns the next item based on that value rather than the current active item in the composite store:

```js
const store = useCompositeStore({ defaultActiveId: "item1" });
const item3 = store.next({ activeId: "item2" });
```

It's important to note that the composite state is not modified when using this feature. The state passed to these methods is used solely for that specific method call.

### Other updates

- Fixed the ability to <kbd>Tab</kbd> out of a nested [Menu](https://ariakit.org/components/menu) within a modal [Dialog](https://ariakit.org/components/dialog).
- Fixed CJS build on Next.js.
- Enhanced performance on [Dialog](https://ariakit.org/components/dialog) backdrops.
- Updated the `useAttribute` hook to handle cases when the attribute is removed from the element.
- Fixed [`Tab`](https://ariakit.org/reference/tab) to pass the [`rowId`](https://ariakit.org/reference/tab#rowid) prop when used with other composite widgets.
- Improved JSDocs.
- Updated dependencies: `@ariakit/core@0.4.11`

## 0.4.11

### Tabs inside animated Combobox or Select

When rendering [Tab](https://ariakit.org/components/tab) inside [Combobox](https://ariakit.org/components/combobox) or [Select](https://ariakit.org/components/select), it now waits for the closing animation to finish before restoring the tab with the selected item. This should prevent an inconsistent UI where the tab is restored immediately while the content is still animating out. See [Select with Combobox and Tabs](https://ariakit.org/examples/select-combobox-tab).

### Other updates

- Updated [Combobox](https://ariakit.org/components/combobox) to immediately reset the [`activeId`](https://ariakit.org/reference/use-combobox-store#activeid) upon closing the popover.
- Removed delay when applying the [`data-focus-visible`](https://ariakit.org/guide/styling#data-focus-visible) attribute.
- Fixed mouse down on [`MenuButton`](https://ariakit.org/reference/menu-button) hiding the menu on Safari.
- Improved JSDocs.
- Updated dependencies: `@ariakit/core@0.4.10`

## 0.4.10

- Fixed a regression introduced in `v0.4.8` that set the default value of the [`accessibleWhenDisabled`](https://ariakit.org/reference/tab#accessiblewhendisabled) prop to `false` on [`Tab`](https://ariakit.org/reference/tab).

## 0.4.9

### `aria-selected` on composite items

Composite items like [`ComboboxItem`](https://ariakit.org/reference/combobox-item) no longer have the `aria-selected` attribute automatically set when focused. This attribute was previously used to address an old bug in Google Chrome, but it's no longer needed. Now, it's only set when the item is actually selected, such as in a select widget or a multi-selectable combobox.

This change shouldn't affect most users since the `aria-selected` attribute is not part of the public API and is not recommended as a [CSS selector](https://ariakit.org/guide/styling#css-selectors) (use [`[data-active-item]`](https://ariakit.org/guide/styling#data-active-item) instead). However, if you have snapshot tests, you may need to update them.

### Other updates

- Removed `useControlledState` and `useRefId` hooks.
- Added [`userValue`](https://ariakit.org/reference/combobox-item-value#uservalue) prop to [`ComboboxItemValue`](https://ariakit.org/reference/combobox-item-value).
- Improved JSDocs.
- Updated dependencies: `@ariakit/core@0.4.9`

## 0.4.8

### Accessing selected tabs when disabled

A [Tab](https://ariakit.org/components/tab) component that is both selected and disabled will now remain accessible to keyboard focus even if the [`accessibleWhenDisabled`](https://ariakit.org/reference/tab#accessiblewhendisabled) prop is set to `false`. This ensures users can navigate to other tabs using the keyboard.

### Other updates

- Fixed [Dialog](https://ariakit.org/components/dialog) to prevent smooth scrolling on hide.
- Fixed [Hovercard](https://ariakit.org/components/hovercard) unexpectedly hiding when scrolling in Safari.
- Added a README file to the package.
- Improved JSDocs.
- Updated dependencies: `@ariakit/core@0.4.8`

## 0.4.7

- Added React 19 to peer dependencies.
- Fixed [`autoSelect`](https://ariakit.org/reference/combobox#autoselect) behavior with virtualized lists on mobile devices.
- Improved JSDocs.
- Updated dependencies: `@ariakit/core@0.4.7`

## 0.4.6

### Nested `SelectList`

The [`SelectList`](https://ariakit.org/reference/select-list) component can now be nested within a [`SelectPopover`](https://ariakit.org/reference/select-popover). This lets you render additional elements inside the popover without breaking the accessibility tree. The ARIA roles will be automatically adjusted to ensure a valid accessibility tree:

```jsx {6-9}
<SelectProvider>
  <Select />
  <SelectPopover>
    <SelectHeading>Fruits</SelectHeading>
    <SelectDismiss />
    <SelectList>
      <SelectItem value="Apple" />
      <SelectItem value="Banana" />
    </SelectList>
  </SelectPopover>
</SelectProvider>
```

### New Select components

Two new components have been added to the [Select](https://ariakit.org/components/select) module: [`SelectHeading`](https://ariakit.org/reference/select-heading) and [`SelectDismiss`](https://ariakit.org/reference/select-dismiss).

You can use them alongside [`SelectList`](https://ariakit.org/reference/select-list) to add a heading and a dismiss button to the select popover:

```jsx {4,5}
<SelectProvider>
  <Select />
  <SelectPopover>
    <SelectHeading>Fruits</SelectHeading>
    <SelectDismiss />
    <SelectList>
      <SelectItem value="Apple" />
      <SelectItem value="Banana" />
    </SelectList>
  </SelectPopover>
</SelectProvider>
```

### `--popover-transform-origin`

The [Popover](https://ariakit.org/components/popover) components now expose a [`--popover-transform-origin`](https://ariakit.org/guide/styling#--popover-transform-origin) CSS variable. You can use this to set the `transform-origin` property for the popover content element in relation to the anchor element:

```css
.popover {
  transform-origin: var(--popover-transform-origin);
}
```

### Opening `SelectPopover` on click

To ensure uniformity across all dropdown buttons in the library, the [`SelectPopover`](https://ariakit.org/reference/select-popover) now opens when you click on the [`Select`](https://ariakit.org/reference/select) component, instead of on mouse/touch/pointer down.

This change also resolves a problem where the `:active` state wouldn't be triggered on the select button due to a focus change on mousedown.

### Other updates

- Fixed `ref` warning in React 19.
- Ensured [Combobox](https://ariakit.org/components/combobox) uses roving tabindex to manage focus on mobile Safari.
- Added a new `listElement` state to the Select store.
- Improved use of [Tab](https://ariakit.org/components/tab) components within [Select](https://ariakit.org/components/select) widgets.
- Fixed `data-focus-visible` being applied after a `blur` event.
- Fixed composite items not scrolling into view in Safari.
- Improved JSDocs.
- Updated dependencies: `@ariakit/core@0.4.6`

## 0.4.5

### Multi-selectable Combobox with inline autocomplete

When rendering a [Multi-selectable Combobox](https://ariakit.org/examples/combobox-multiple) with the [`autoComplete`](https://ariakit.org/reference/combobox#autocomplete) prop set to `"inline"` or `"both"`, the completion string will no longer be inserted into the input upon deselecting an item. This is because the completion string generally represents an addition action, whereas deselecting an item is a removal action.

### Other updates

- Added new experimental Tag components.
- Updated [`Combobox`](https://ariakit.org/reference/combobox) to no longer use `ReactDOM.flushSync` when updating the value.
- Added new [`resetValueOnSelect`](https://ariakit.org/reference/combobox-item#resetvalueonselect) prop to [`ComboboxItem`](https://ariakit.org/reference/combobox-item).
- Added new [`resetValue`](https://ariakit.org/reference/use-combobox-store#resetvalue) method to combobox store.
- Added experimental `ComboboxValue` component.
- Improved JSDocs.
- Updated dependencies: `@ariakit/core@0.4.5`

## 0.4.4

### Combobox `autoFocusOnHide` behavior

Previously, the [`autoFocusOnHide`](https://ariakit.org/reference/combobox-popover#autofocusonhide) feature on [`ComboboxPopover`](https://ariakit.org/reference/combobox-popover) was turned off by default. Most of the time, this didn't have any practical impact because the combobox input element was already focused when the popover was hidden.

Now, this feature is enabled by default and should work consistently even when [`virtualFocus`](https://ariakit.org/reference/combobox-provider#virtualfocus) is set to `false`.

### Better SVG strokes

The `strokeWidth` property on SVG elements rendered by [`CheckboxCheck`](https://ariakit.org/reference/checkbox-check), [`ComboboxCancel`](https://ariakit.org/reference/combobox-cancel), [`ComboboxDisclosure`](https://ariakit.org/reference/combobox-disclosure), [`DialogDismiss`](https://ariakit.org/reference/dialog-dismiss), [`HovercardDisclosure`](https://ariakit.org/reference/hovercard-disclosure), [`PopoverDisclosureArrow`](https://ariakit.org/reference/popover-disclosure-arrow), and all components that use any of these now defaults to `1.5px` instead of `1.5pt`. This should make the strokes slightly thinner.

Remember, you can always override the SVG element rendered by these components by rendering custom `children`.

### Minimum value length to show combobox options

A new [`showMinLength`](https://ariakit.org/reference/combobox#showminlength) prop has been added to the [`Combobox`](https://ariakit.org/reference/combobox) component. This prop lets you set the minimum length of the value before the combobox options appear. The default value is `0`.

```jsx
<Combobox showMinLength={2} />
```

Previously, achieving this behavior required combining three separate props: [`showOnChange`](https://ariakit.org/reference/combobox#showonchange), [`showOnClick`](https://ariakit.org/reference/combobox#showonclick), and [`showOnKeyPress`](https://ariakit.org/reference/combobox#showonkeypress). We've added this prop to simplify this common task.

These props continue to work as expected as they can be used to customize the behavior for each distinct event.

### Rendering composite items as input elements

We've added the ability to render [`CompositeItem`](https://ariakit.org/reference/composite-item) as an input element using the [`render`](https://ariakit.org/reference/composite-item#render) prop:

```jsx
<CompositeItem render={<input />} />
```

Before, you could only do this with the experimental `CompositeInput` component. Now, this functionality is integrated directly into the [`CompositeItem`](https://ariakit.org/reference/composite-item) component.

### Other updates

- Fixed [`Dialog`](https://ariakit.org/reference/dialog) calling [`autoFocusOnHide`](https://ariakit.org/reference/dialog#autofocusonhide) twice.
- Improved JSDocs.
- Updated dependencies: `@ariakit/core@0.4.4`

## 0.4.3

- Fixed TypeScript types for `ref`.
- Fixed [`CompositeItem`](https://ariakit.org/reference/composite-item) occasionally failing to set the [`activeId`](https://ariakit.org/reference/use-composite-store#activeid) state on focus.
- Fixed [`unmountOnHide`](https://ariakit.org/reference/tab-panel#unmountonhide) prop not working on [`TabPanel`](https://ariakit.org/reference/tab-panel) without [`tabId`](https://ariakit.org/reference/tab-panel#tabid).
- Fixed regression in `v0.4.2` that caused nested tabs to stop working.
- Added new [`combobox`](https://ariakit.org/reference/tab-provider#combobox) property to tab store.
- Improved JSDocs.
- Updated dependencies: `@ariakit/core@0.4.3`

## 0.4.2

### Tooltip behavior improvements

When using [Tooltip](https://ariakit.org/components/tooltip) components alongside elements that move focus upon clicking (like [`MenuButton`](https://ariakit.org/reference/menu-button), which moves focus to its [`Menu`](https://ariakit.org/reference/menu) when clicked), the tooltip will now stop from appearing after the user clicks the anchor element. It will only show when the mouse leaves and re-enters the anchor element.

This was already the case when tooltips had no [`timeout`](https://ariakit.org/reference/tooltip-provider#timeout). Now, the behavior is consistent regardless of the timeout value.

### Combobox with Tabs

[Tab](https://ariakit.org/components/tab) components can now be rendered as part of other composite widgets, like [Combobox](https://ariakit.org/components/combobox). The following structure should work seamlessly:

```jsx "TabProvider" "TabList" "Tab" "TabPanel"
<ComboboxProvider>
  <Combobox />
  <ComboboxPopover>
    <TabProvider>
      <TabList>
        <Tab />
      </TabList>
      <TabPanel unmountOnHide>
        <ComboboxList>
          <ComboboxItem />
        </ComboboxList>
      </TabPanel>
    </TabProvider>
  </ComboboxPopover>
</ComboboxProvider>
```

### Other updates

- Added `SelectValue` component to `@ariakit/react-core`.
- Fixed `inert` behavior on older browsers.
- Fixed [Portal](https://ariakit.org/components/portal) rendering extra `span` even when the [`portal`](https://ariakit.org/reference/portal#portal-1) prop is `false`.
- Fixed [`Focusable`](https://ariakit.org/reference/focusable) to identify `summary` as a native tabbable element.
- Added [`Role.summary`](https://ariakit.org/reference/role) component.
- Improved typeahead functionality on unmounted composite items.
- Added new [`composite`](https://ariakit.org/reference/tab-provider#composite) property to tab store.
- Added new [`hideWhenEmpty`](https://ariakit.org/reference/combobox-cancel#hidewhenempty) prop to [`ComboboxCancel`](https://ariakit.org/reference/combobox-cancel).
- Added support for nested [`ComboboxList`](https://ariakit.org/reference/combobox-list).
- Added [`unmountOnHide`](https://ariakit.org/reference/tab-panel#unmountonhide) prop to [`TabPanel`](https://ariakit.org/reference/tab-panel).
- Improved JSDocs.
- Updated dependencies: `@ariakit/core@0.4.2`

## 0.4.1

### New `autoSelect` mode

The [`autoSelect`](https://ariakit.org/reference/combobox#autoselect) prop of the [`Combobox`](https://ariakit.org/reference/combobox) component now accepts a new `"always"` value:

```jsx
<Combobox autoSelect="always" />
```

When using this value, the first enabled item will automatically gain focus when the list shows up, as well as when the combobox input value changes (which is the behavior of the [`autoSelect`](https://ariakit.org/reference/combobox#autoselect) prop when set to `true`).

### `ComboboxItem` losing focus too early

Some tweaks were made to the [`ComboboxItem`](https://ariakit.org/reference/combobox-item) component to ensure it doesn't lose focus right after a click or <kbd>Escape</kbd> keystroke when the combobox popover is animated. This should avoid an inconsistent UI as the popover plays its exit animation.

### Other updates

- Added [`disclosure`](https://ariakit.org/reference/use-disclosure-store#disclosure-1) property to disclosure stores.
- Added [`blurActiveItemOnClick`](https://ariakit.org/reference/combobox#bluractiveitemonclick) prop to [`Combobox`](https://ariakit.org/reference/combobox).
- Added [`showOnClick`](https://ariakit.org/reference/combobox#showonclick) prop to [`Combobox`](https://ariakit.org/reference/combobox).
- Added [`showOnKeyPress`](https://ariakit.org/reference/combobox#showonkeypress) prop to [`Combobox`](https://ariakit.org/reference/combobox).
- Fixed [`DisclosureContent`](https://ariakit.org/reference/disclosure-content) components losing their ref value on fast refresh.
- Improved JSDocs.
- Updated dependencies: `@ariakit/core@0.4.1`

## 0.4.0

This version introduces enhanced support for CSS animations and transitions, along with a few breaking changes for quite specific cases. The majority of users won't be impacted by these.

Please review the brief notes following the **BREAKING** labels on each update to determine if any changes are needed in your code.

### Improved animation support

This version enhances support for CSS animations and transitions on Ariakit components that use [Disclosure](https://ariakit.org/component/disclosure). This includes [Dialog](https://ariakit.org/components/dialog), [Popover](https://ariakit.org/components/popover), [Combobox](https://ariakit.org/components/combobox), [Select](https://ariakit.org/components/select), [Hovercard](https://ariakit.org/components/hovercard), [Menu](https://ariakit.org/components/menu), and [Tooltip](https://ariakit.org/components/tooltip).

These components now support _enter_ and _leave_ transitions and animations right out of the box, eliminating the need to provide an explicit `animated` prop. If an enter animation is detected, the component will automatically wait for a leave animation to complete before unmounting or hiding itself.

Use the [`[data-enter]`](https://ariakit.org/guide/styling#data-enter) selector for CSS transitions. For CSS animations, use the newly introduced [`[data-open]`](https://ariakit.org/guide/styling#data-open) selector. The [`[data-leave]`](https://ariakit.org/guide/styling#data-leave) selector can be used for both transitions and animations.

### `ComboboxList` is no longer focusable

**BREAKING** if you're using the [`ComboboxList`](https://ariakit.org/reference/combobox-list) component directly with [`Focusable`](https://ariakit.org/reference/focusable) props.

The [`ComboboxList`](https://ariakit.org/reference/combobox-list) component is no longer focusable and doesn't accept [`Focusable`](https://ariakit.org/reference/focusable) props such as [`autoFocus`](https://ariakit.org/reference/focusable#autofocus), [`disabled`](https://ariakit.org/reference/focusable#disabled), and [`onFocusVisible`](https://ariakit.org/reference/focusable#onfocusvisible) anymore. If you need [Focusable](https://ariakit.org/components/focusable) features specifically on the [`ComboboxList`](https://ariakit.org/reference/combobox-list) component, you can use [composition](https://ariakit.org/guide/composition) to render it as a [`Focusable`](https://ariakit.org/reference/focusable) component.

Before:

```jsx
<ComboboxList disabled />
```

After:

```jsx
<ComboboxList render={<Focusable disabled />} />
```

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

### Radio types have improved

**BREAKING** if you're using TypeScript and the [`onChange`](https://ariakit.org/reference/radio#onchange) prop on [`Radio`](https://ariakit.org/reference/radio), [`FormRadio`](https://ariakit.org/reference/form-radio), or [`MenuItemRadio`](https://ariakit.org/reference/menu-item-radio).

The [`onChange`](https://ariakit.org/reference/radio#onchange) callback argument type has changed from `React.SyntheticEvent` to `React.ChangeEvent`.

Before:

```tsx
<Radio onChange={(event: React.SyntheticEvent) => {}} />
```

After:

```tsx
<Radio onChange={(event: React.ChangeEvent) => {}} />
```

### Public data attributes have now boolean values

**BREAKING** if you're depending on [data attributes](https://ariakit.org/guide/styling#data-active) to carry an empty string (`""`) value.

In previous versions, data attributes such as [`data-active`](https://ariakit.org/guide/styling#data-active), [`data-active-item`](https://ariakit.org/guide/styling#data-active-item), [`data-enter`](https://ariakit.org/guide/styling#data-enter), [`data-leave`](https://ariakit.org/guide/styling#data-leave), and [`data-focus-visible`](https://ariakit.org/guide/styling#data-focus-visible) would carry an empty string (`""`) value when active, and `undefined` when inactive. Now, they have a `true` value when active, but remain `undefined` when inactive.

Their use as CSS selectors remains unchanged. You should continue to select them with the attribute selector with no value (e.g., `[data-enter]`). However, if you're employing them in different ways or have snapshot tests that depend on their value, you might need to update your code.

### Removed deprecated features

**BREAKING** if you haven't addressed the deprecation warnings from previous releases.

This version eliminates features that were deprecated in previous releases: the `backdropProps` and `as` props, as well as the ability to use a render function for the `children` prop across all components.

Before:

```jsx
<Dialog backdropProps={{ className: "backdrop" }} />
<Combobox as="textarea" />
<Combobox>
  {(props) => <textarea {...props} />}
</Combobox>
```

After:

```jsx
<Dialog backdrop={<div className="backdrop" />} />
<Combobox render={<textarea />} />
<Combobox render={(props) => <textarea {...props} />} />
```

You can learn more about these new features in the [Composition guide](https://ariakit.org/guide/composition).

### Other updates

- Deprecated `MenuBar` in favor of [Menubar](https://ariakit.org/components/menubar) components.
- Revamped utilities for creating Ariakit components.
- The `type` prop for the [Tooltip](https://ariakit.org/components/tooltip) has been deprecated. See [Tooltip anchors must have accessible names](https://ariakit.org/components/tooltip#tooltip-anchors-must-have-accessible-names).
- Removed the ancestors of open, nested modals from the accessibility tree.
- Tooltips no longer use `aria-describedby` to associate the tooltip content with the anchor.
- Added new [`disclosure`](https://ariakit.org/reference/use-disclosure-store#disclosure-1) property to disclosure stores.
- Updated dependencies: `@ariakit/core@0.4.0`

## 0.3.14

- Fixed a regression introduced in `v0.3.13` where dialogs wouldn't close when clicking outside on iOS.

## 0.3.13

### Improved performance of large collections

Components like [`MenuItem`](https://ariakit.org/reference/menu-item), [`ComboboxItem`](https://ariakit.org/reference/combobox-item), and [`SelectItem`](https://ariakit.org/reference/select-item) should now offer improved performance when rendering large collections.

### New `FormControl` component

This version introduces a new [`FormControl`](https://ariakit.org/reference/form-control) component. In future versions, this will replace the [`FormField`](https://ariakit.org/reference/form-field) component.

### Other updates

- Adjusted the focus behavior in Safari to occur prior to the `pointerup` event instead of `mouseup`.
- Improved JSDocs.
- Updated dependencies: `@ariakit/core@0.3.11`

## 0.3.12

- The auto-select feature on [Combobox](https://ariakit.org/components/combobox) now resets with each keystroke.
- Fixed [`Combobox`](https://ariakit.org/reference/combobox) with the [`autoSelect`](https://ariakit.org/reference/combobox#autoselect) prop calling `onFocus` with every input change.
- Fixed [`Hovercard`](https://ariakit.org/reference/hovercard) flickering when used with shadow DOM.
- Fixed [`Select`](https://ariakit.org/reference/select) with [`Combobox`](https://ariakit.org/reference/combobox) scroll jumping when opening using keyboard navigation.
- Fixed [`CompositeItem`](https://ariakit.org/reference/composite-item) triggering blur on focus.
- Fixed [`ComboboxItem`](https://ariakit.org/reference/combobox-item) not triggering the `onClick` event when the item is partially visible.
- Improved JSDocs.
- Updated dependencies: `@ariakit/core@0.3.10`

## 0.3.11

### Modal Combobox

The [Combobox](https://ariakit.org/component/combobox) components now support the [`modal`](https://ariakit.org/reference/combobox-popover#modal) prop on [`ComboboxPopover`](https://ariakit.org/reference/combobox-popover).

When a modal combobox is expanded, users can interact with and tab through all the combobox controls, including [`Combobox`](https://ariakit.org/reference/combobox), [`ComboboxDisclosure`](https://ariakit.org/reference/combobox-disclosure), and [`ComboboxCancel`](https://ariakit.org/reference/combobox-cancel), even if they're rendered outside the popover. The rest of the page will be inert.

### Controlling the auto-select functionality of Combobox

The [`Combobox`](https://ariakit.org/reference/combobox) component now includes a new [`getAutoSelectId`](https://ariakit.org/reference/combobox#getautoselectid) prop. This allows you to specify the [`ComboboxItem`](https://ariakit.org/reference/combobox-item) that should be auto-selected if the [`autoSelect`](https://ariakit.org/reference/combobox#autoselect) prop is `true`.

By default, the first _enabled_ item is auto-selected. Now you can customize this behavior by returning the id of another item from [`getAutoSelectId`](https://ariakit.org/reference/combobox#getautoselectid):

```jsx
<Combobox
  autoSelect
  getAutoSelectId={(items) => {
    // Auto select the first enabled item with a value
    const item = items.find((item) => {
      if (item.disabled) return false;
      if (!item.value) return false;
      return true;
    });
    return item?.id;
  }}
/>
```

### Styling Combobox without an active descendant

The [`Combobox`](https://ariakit.org/reference/combobox) component now includes a [`data-active-item`](https://ariakit.org/guide/styling#data-active-item) attribute when it's the only active item in the composite widget. In other words, when no [`ComboboxItem`](https://ariakit.org/reference/combobox-item) is active and the focus is solely on the combobox input.

You can use this as a CSS selector to style the combobox differently, providing additional affordance to users who pressed <kbd>↑</kbd> on the first item or <kbd>↓</kbd> on the last item. This action would place both virtual and actual DOM focus on the combobox input.

```css
.combobox[data-active-item] {
  outline-width: 2px;
}
```

### Other updates

- Fixed [`useTabStore`](https://ariakit.org/reference/use-tab-store) return value not updating its own reference.
- Fixed keyboard navigation on [Combobox](https://ariakit.org/components/combobox) when the content element is a grid.
- Fixed [`ComboboxDisclosure`](https://ariakit.org/reference/combobox-disclosure) to update its `aria-expanded` attribute when the combobox expands.
- Fixed `Maximum update depth exceeded` warning when rendering multiple collection items on the page.
- Improved JSDocs.
- Updated dependencies: `@ariakit/core@0.3.9`

## 0.3.10

### Overwriting `aria-selected` value on `ComboboxItem`

It's now possible to pass a custom `aria-selected` value to the [`ComboboxItem`](https://ariakit.org/reference/combobox-item) component, overwriting the internal behavior.

### Limiting `slide` on popovers

When components like [Popover](https://ariakit.org/components/popover) and [Menu](https://ariakit.org/components/menu) with the [`slide`](https://ariakit.org/reference/popover#slide) prop are positioned to the right or left of the anchor element, they will now cease to slide across the screen, disengaged from the anchor element, upon reaching the edge of said element.

### Other updates

- Fixed [`blurOnHoverEnd`](https://ariakit.org/reference/menu-item#bluronhoverend) set to `false` not keeping submenus open.
- Fixed scroll jump on Safari when selecting a [`CompositeItem`](https://ariakit.org/reference/composite-item).
- Fixed [`preserveTabOrderAnchor`](https://ariakit.org/reference/menu#preservetaborderanchor) on nested menus.
- Fixed focus behavior when using the [`preserveTabOrder`](https://ariakit.org/reference/portal#preservetaborder) prop.

## 0.3.9

### Automatic role on ComboboxGroup

The [`ComboboxGroup`](https://ariakit.org/reference/combobox-group) component now automatically assigns the `role` attribute as `rowgroup` if it's nestled within a [`ComboboxPopover`](https://ariakit.org/reference/combobox-popover) or [`ComboboxList`](https://ariakit.org/reference/combobox-list) wrapper that has the `role` attribute set to `grid`.

### Custom submenu auto focus

When opening nested [Menu](https://ariakit.org/components/menu) components with <kbd>Enter</kbd>, <kbd>Space</kbd>, or arrow keys, the first tabbable element will now receive focus, even if it's not a [`MenuItem`](https://ariakit.org/reference/menu-item) element. This should enable custom popups that behave like submenus, but use different semantics.

### Hovercard display timeout

The [Hovercard](https://ariakit.org/components/hovercard), [Menu](https://ariakit.org/components/menu), and [Tooltip](https://ariakit.org/components/tooltip) components now display synchronously when the [`timeout`](https://ariakit.org/reference/hovercard-provider#timeout) or [`showTimeout`](https://ariakit.org/reference/hovercard-provider#showtimeout) states are set to `0`. This should stop submenus from vanishing for a few frames prior to displaying a new menu when hovering over menu items in sequence.

### Other updates

- Fixed [`CollectionItem`](https://ariakit.org/reference/collection-item) elements getting out of order when composing stores.
- Fixed [`MenuButton`](https://ariakit.org/reference/menu-button) not assigning the correct `role` attribute when used within a [`ComboboxList`](https://ariakit.org/reference/combobox-list) element.
- Fixed [`MenuItem`](https://ariakit.org/reference/menu-item) with an explicit [`focusOnHover`](https://ariakit.org/reference/menu-item#focusonhover) prop not moving focus properly.
- Fixed [`blurOnHoverEnd`](https://ariakit.org/reference/menu-item#bluronhoverend) not working on submenu triggers.
- Fixed [Dialog](https://ariakit.org/components/dialog) not respecting the controlled [`open`](https://ariakit.org/reference/use-dialog-store#open) state.
- Fixed unmounted [`SelectPopover`](https://ariakit.org/reference/select-popover) not re-opening when its [`open`](https://ariakit.org/reference/select-provider#open) state is initially set to `true`.
- Fixed TypeScript build errors.
- Fixed focus order when using [Popover](https://ariakit.org/components/popover) with the [`portal`](https://ariakit.org/reference/popover#portal) prop with VoiceOver.
- Updated dependencies: `@ariakit/core@0.3.8`

## 0.3.8

### Multi-selectable Combobox

We've added support for the [Combobox](https://ariakit.org/components/combobox) with multiple selection capabilities using a new [`selectedValue`](https://ariakit.org/reference/combobox-provider#selectedvalue) prop, along with [`defaultSelectedValue`](https://ariakit.org/reference/combobox-provider#defaultselectedvalue) and [`setSelectedValue`](https://ariakit.org/reference/combobox-provider#setselectedvalue).

This works similarly to the [`value`](https://ariakit.org/reference/select-provider#value) prop on [Select](https://ariakit.org/components/select) components. If it receives an array, the combobox will allow multiple selections. By default, it's a string that represents the selected value in a single-select combobox.

Check out the [Multi-selectable Combobox](https://ariakit.org/examples/combobox-multiple) example to see it in action.

### New Combobox components

This version introduces new [Combobox](https://ariakit.org/components/combobox) components:

- [`ComboboxLabel`](https://ariakit.org/reference/combobox-label): This renders a `label` element for a [`Combobox`](https://ariakit.org/reference/combobox), with the `htmlFor` prop set automatically.
- [`ComboboxItemCheck`](https://ariakit.org/reference/combobox-item-check): This displays a checkmark for a [`ComboboxItem`](https://ariakit.org/reference/combobox-item) when the item is selected.

### Other updates

- Added [`resetValueOnSelect`](https://ariakit.org/reference/combobox-provider#resetvalueonselect) state to [Combobox](https://ariakit.org/components/combobox) components.
- Added [`selectValueOnClick`](https://ariakit.org/reference/combobox-item#selectvalueonclick) prop to [`ComboboxItem`](https://ariakit.org/reference/combobox-item).
- Fixed [`SelectItem`](https://ariakit.org/reference/select-item) rendering an `aria-selected` attribute even when the [`value`](https://ariakit.org/reference/select-item#value) prop is omitted.
- Updated dependencies: `@ariakit/core@0.3.7`

## 0.3.7

### Expanding Menubar

The [Menubar](https://ariakit.org/components/menubar) component will now only expand if there's another menu already expanded in the same menubar.

### Internal data attribute changes

Just like the change in v0.3.6 that removed the `data-command` and `data-disclosure` attributes from elements, this update stops the `data-composite-hover` attribute from infiltrating composite item elements in the DOM. We're mentioning this in the changelog as some users might have snapshot tests that require updating.

### Other updates

- Fixed `setSelectionRange` error when used with [unsupported](https://html.spec.whatwg.org/multipage/input.html#concept-input-apply) input types.
- Fixed [`MenuButton`](https://ariakit.org/reference/menu-button) with [`showOnHover`](https://ariakit.org/reference/menu-button#showonhover) not updating the `activeId` state when hovered.
- Updated [`onFocusVisible`](https://ariakit.org/reference/focusable#onfocusvisible) element type on [`Focusable`](https://ariakit.org/reference/focusable) from `Element` to `HTMLElement`.
- Updated dependencies: `@ariakit/core@0.3.6`

## 0.3.6

### Data attributes for duplicate components

The internal logic that identifies duplicate components has been refined. This implies that some internal `data-*` attributes will no longer seep into the rendered DOM elements. If you're doing snapshot tests on the DOM generated by Ariakit components, you should see the `data-command` and `data-disclosure` attributes removed.

### Multiple disclosure and anchor elements

The `disclosureElement` and `anchorElement` states on [Disclosure](https://ariakit.org/components/disclosure), [Popover](https://ariakit.org/components/popover), and [Menu](https://ariakit.org/components/menu), along with related components, are now set only upon interaction.

This change enables us to support multiple disclosure/anchor elements for the same `contentElement` (typically the popup element) when triggered by hover or focus.

### Expanding Menubar with focus

Adjacent [`Menu`](https://ariakit.org/reference/menu) popups will now open when the focus moves through [`MenuItem`](https://ariakit.org/reference/menu-item) elements in a [Menubar](https://ariakit.org/components/menubar). Before, they would only open when another [`Menu`](https://ariakit.org/reference/menu) was already visible.

### Maintaining Popover tab order

[`Popover`](https://ariakit.org/reference/popover) and related components now automatically set the new [`preserveTabOrderAnchor`](https://ariakit.org/reference/portal#preservetaborderanchor) prop as the disclosure element.

This ensures that, when the [`portal`](https://ariakit.org/reference/popover#portal) prop is enabled, the tab order will be preserved from the disclosure to the content element even when the [`Popover`](https://ariakit.org/reference/popover) component is rendered in a different location in the React tree.

### New Menubar components

This version introduces a new [Menubar](https://ariakit.org/components/menubar) module that can be used without the [`MenubarProvider`](https://ariakit.org/reference/menubar-provider) wrapper.

### Other updates

- Fixed [Hovercard](https://ariakit.org/components/hovercard) when used with multiple [`HovercardAnchor`](https://ariakit.org/reference/hovercard-anchor) elements.
- Added new [`preserveTabOrderAnchor`](https://ariakit.org/reference/portal#preservetaborderanchor) prop to [`Portal`](https://ariakit.org/reference/portal) and related components.
- Added new [`tabbable`](https://ariakit.org/reference/composite-item#tabbable) prop to [`CompositeItem`](https://ariakit.org/reference/composite-item) and related components.
- Added new [`blurOnHoverEnd`](https://ariakit.org/reference/composite-hover#bluronhoverend) prop to [`CompositeHover`](https://ariakit.org/reference/composite-hover) and related components.
- Updated dependencies: `@ariakit/core@0.3.5`

## 0.3.5

### Patch Changes

- [`#2935`](https://github.com/ariakit/ariakit/pull/2935) Fixed TypeScript declaration files in CommonJS projects using `NodeNext` for `moduleResolution`.

- [`#2945`](https://github.com/ariakit/ariakit/pull/2945) Added `name` and `value` properties to non-native input elements rendered by [`Checkbox`](https://ariakit.org/reference/checkbox), [`Radio`](https://ariakit.org), [`MenuItemCheckbox`](https://ariakit.org/reference/menu-item-checkbox), and [`MenuItemRadio`](https://ariakit.org/reference/menu-item-radio).

  It's now possible to access the `name` and `value` properties from the `event.target` element in the [`onChange`](https://ariakit.org/reference/checkbox#onchange) event handler.

- [`#2945`](https://github.com/ariakit/ariakit/pull/2945) Fixed [`CompositeItem`](https://ariakit.org/reference/composite-item) and associated components not receiving the [`disabled`](https://ariakit.org/reference/composite-item#disabled) prop when it's being used by a higher-level component such as [`MenuItemCheckbox`](https://ariakit.org/reference/menu-item-checkbox) or [`MenuItemRadio`](https://ariakit.org/reference/menu-item-radio).

- [`#2945`](https://github.com/ariakit/ariakit/pull/2945) It's now possible to control the menu [`values`](https://ariakit.org/reference/menu-provider#values) state by passing the [`checked`](https://ariakit.org/reference/menu-item-checkbox#checked), [`defaultChecked`](https://ariakit.org/reference/menu-item-checkbox#defaultchecked) and [`onChange`](https://ariakit.org/reference/menu-item-checkbox#onchange) props to [`MenuItemCheckbox`](https://ariakit.org/reference/menu-item-checkbox) and [`MenuItemRadio`](https://ariakit.org/reference/menu-item-radio).

- [`#2948`](https://github.com/ariakit/ariakit/pull/2948) Added `"use client"` directive to all modules.

- [`#2949`](https://github.com/ariakit/ariakit/pull/2949) The [Select](https://ariakit.org/components/select) component will now display the selected option(s) on the underlying native select element even when the corresponding [`SelectItem`](https://ariakit.org/reference/select-item) components aren't rendered.

  This comes in handy when the [`SelectPopover`](https://ariakit.org/reference/select-popover) component is rendered dynamically (for instance, using the [`unmountOnHide`](https://ariakit.org/reference/select-popover#unmountonhide) prop) or a [`defaultValue`](https://ariakit.org/reference/select-provider#defaultvalue) is given without a matching [`SelectItem`](https://ariakit.org/reference/select-item) component.

- Improved JSDocs.

- Updated dependencies: `@ariakit/core@0.3.4`.

## 0.3.4

### Patch Changes

- [`#2894`](https://github.com/ariakit/ariakit/pull/2894) Fixed [Command](https://ariakit.org/components/command) and related components not preventing the default behavior on <kbd>Space</kbd> keyup on non-native button elements.

- [`#2896`](https://github.com/ariakit/ariakit/pull/2896) Controlled store updates are no longer flushed synchronously.

  Previously, we were wrapping _all_ controlled store updates with [`ReactDOM.flushSync`](https://react.dev/reference/react-dom/flushSync). This approach proved to be quite fragile and led to a few problems. Now, we only apply this to specific updates that require synchronous flushing.

  This change shouldn't impact your application, unless you're already facing problems, which could be fixed by this. If you find any issues stemming from this change, please let us know. Regardless, you can always opt into the previous behavior by wrapping your own updates in `flushSync` when needed:

  ```js
  const [open, setOpen] = useState(false);

  useDialogStore({
    open,
    setOpen(open) {
      ReactDOM.flushSync(() => setOpen(open));
    },
  });
  ```

- [`#2897`](https://github.com/ariakit/ariakit/pull/2897) Fixed `CompositeRenderer` missing its `items` state when used in a component with a `mounted` state.

- [`#2909`](https://github.com/ariakit/ariakit/pull/2909) Fixed [Disclosure](https://ariakit.org/components/disclosure) and related components not waiting for the exit animation to complete before hiding the content element.

- [`#2909`](https://github.com/ariakit/ariakit/pull/2909) The [Dialog](https://ariakit.org/components/dialog) and related components can now receive controlled [`open`](https://ariakit.org/reference/dialog#open) and [`onClose`](https://ariakit.org/reference/dialog#onclose) props, allowing them to be used without a store:

  ```jsx
  const [open, setOpen] = useState(false);

  <Dialog
    open={open}
    onClose={() => setOpen(false)}
  >
  ```

- [`#2922`](https://github.com/ariakit/ariakit/pull/2922) Added [`unmountOnHide`](https://ariakit.org/reference/disclosure-content#unmountonhide) prop to [`DisclosureContent`](https://ariakit.org/reference/disclosure-content), [`Dialog`](https://ariakit.org/reference/dialog) and related components.

  Conditionally rendering the [`Dialog`](https://ariakit.org/reference/dialog) and related components will continue to work as before:

  ```jsx
  open && <Dialog>
  ```

  Now, you can do the same thing using the [`unmountOnHide`](https://ariakit.org/reference/dialog#unmountonhide) prop:

  ```jsx
  <Dialog unmountOnHide>
  ```

- Improved JSDocs.

- Updated dependencies: `@ariakit/core@0.3.3`.

## 0.3.3

### Patch Changes

- [`#2820`](https://github.com/ariakit/ariakit/pull/2820) Added missing `aria-haspopup` attribute to [`DialogDisclosure`](https://ariakit.org/reference/dialog-disclosure) and [`PopoverDisclosure`](https://ariakit.org/reference/popover-disclosure).

- [`#2858`](https://github.com/ariakit/ariakit/pull/2858) Fixed the [`setValueOnMove`](https://ariakit.org/reference/use-select-store#setvalueonmove) state on the [Select](https://ariakit.org/components/select) module not syncing between multiple stores.

  The following now works as expected:

  ```js
  const store1 = useSelectStore();
  const store2 = useSelectStore({ store: store1, setValueOnMove: true });

  store1.useState("setValueOnMove") === store2.useState("setValueOnMove"); // true
  ```

- [`#2862`](https://github.com/ariakit/ariakit/pull/2862) Renamed `@ariakit/react-core/dialog/utils/disable-tree-outside` module to `@ariakit/react-core/dialog/utils/disable-tree`.

- [`#2862`](https://github.com/ariakit/ariakit/pull/2862) Elements inside [Dialog](https://ariakit.org/components/dialog) and derived components are now properly disabled when the dialog is animating out.

- [`#2862`](https://github.com/ariakit/ariakit/pull/2862) Fixed a bug that occurred when rendering nested [Dialog](https://ariakit.org/components/dialog) elements with a third-party dialog interspersed.

  Previously, Ariakit didn't recognize the third-party dialog as a nested dialog when the lowest dialog opened.

- [`#2862`](https://github.com/ariakit/ariakit/pull/2862) The [`hideOnEscape`](https://ariakit.org/reference/dialog#hideonescape) prop is now triggered during the capture phase.

  Essentially, this means that you can now prevent the propagation of the <kbd>Escape</kbd> keydown event to other elements in the DOM when it's used to close an Ariakit [Dialog](https://ariakit.org/components/dialog):

  ```jsx
  <Dialog
    hideOnEscape={(event) => {
      event.stopPropagation();
      return true;
    }}
  />
  ```

- [`#2862`](https://github.com/ariakit/ariakit/pull/2862) Fixed an issue where the [Dialog](https://ariakit.org/components/dialog) component would automatically hide when parent dialogs closed.

  You can now render nested dialogs in the React tree and keep them open independently, provided they're not unmounted.

- [`#2862`](https://github.com/ariakit/ariakit/pull/2862) Fixed the [Focusable](https://ariakit.org/components/focusable) and its derived components that were incorrectly calling the [`onFocusVisible`](https://ariakit.org/reference/focusable#onfocusvisible) callback prop when the element had lost focus.

  This didn't align with the behavior of the [`data-focus-visible`](https://ariakit.org/guide/styling#data-focus-visible) attribute. The behavior now mirrors the attribute, which will only be omitted from the element if `event.preventDefault()` is invoked from within the [`onFocusVisible`](https://ariakit.org/reference/focusable#onfocusvisible) callback.

- [`#2862`](https://github.com/ariakit/ariakit/pull/2862) The [`modal`](https://ariakit.org/reference/menu#modal) prop is now automatically disabled on nested [`Menu`](https://ariakit.org/reference/menu) components.

- [`#2869`](https://github.com/ariakit/ariakit/pull/2869) Fixed uncaught `msg.startsWith` error.

- Improved JSDocs.

## 0.3.2

### Patch Changes

- [`#2811`](https://github.com/ariakit/ariakit/pull/2811) **TypeScript**: Fixed missing `null` type on props from [`useMenuStore`](https://ariakit.org/reference/use-menu-store) ([`combobox`](https://ariakit.org/reference/use-menu-store#combobox), [`parent`](https://ariakit.org/reference/use-menu-store#parent), [`menubar`](https://ariakit.org/reference/use-menu-store#menubar)), and [`useSelectStore`](https://ariakit.org/reference/use-select-store) ([`combobox`](https://ariakit.org/reference/use-select-store#combobox)).

- [`#2812`](https://github.com/ariakit/ariakit/pull/2812) Fixed an infinite loop issue when using [`MenuButton`](https://ariakit.org/reference/menu-buton) with a [`store`](https://ariakit.org/reference/menu-button#store) that is synchronized with another store.

- Improved JSDocs.

- Updated dependencies: `@ariakit/core@0.3.2`.

## 0.3.1

### Patch Changes

- [`#2797`](https://github.com/ariakit/ariakit/pull/2797) Fixed a regression on `Dialog` regarding the timing of its "focus on hide" behavior.

- [`#2801`](https://github.com/ariakit/ariakit/pull/2801) Fixed `values.slice` error that would occur when clicking on `FormCheckbox` that uses an integer-like field name.

- [`#2802`](https://github.com/ariakit/ariakit/pull/2802) Added `setMounted` prop to `useDisclosureStore` and derived component stores. This callback prop can be used to react to changes in the `mounted` state. For example:

  ```js
  useDialogStore({
    setMounted(mounted) {
      if (!mounted) {
        props.onUnmount?.();
      }
    },
  });
  ```

- [`#2803`](https://github.com/ariakit/ariakit/pull/2803) The `Toolbar` component can now render without needing an explicit `store` prop or a `ToolbarProvider` component wrap. `Toolbar` now also supports certain store props such as `focusLoop`, `orientation`, `rtl`, and `virtualFocus`.

- Updated dependencies: `@ariakit/core@0.3.1`.

## 0.3.0

### Minor Changes

- [`#2714`](https://github.com/ariakit/ariakit/pull/2714) Added support for a dynamic `store` prop on component stores.

  This is similar to the `store` prop on components, keeping both stores in sync. Now, component store hooks can support modifying the value of the `store` prop after the initial render. For instance:

  ```js
  // props.store can change between renders now
  const checkbox = useCheckboxStore({ store: props.store });
  ```

  When the `store` prop changes, the object returned from the store hook will update as well. Consequently, effects and hooks that rely on the store will re-run.

  While it's unlikely, this **could represent a breaking change** if you're depending on the `store` prop in component stores to only acknowledge the first value passed to it.

- [`#2714`](https://github.com/ariakit/ariakit/pull/2714) **BREAKING**: The `useStore` function exported by `@ariakit/react-core/utils/store` has been updated.

- [`#2760`](https://github.com/ariakit/ariakit/pull/2760) **BREAKING**: The `useStoreState` function exported by `@ariakit/react-core/utils/store` has been updated so it'll always run the selector callback even when the passed store is `null` or `undefined`.

- [`#2783`](https://github.com/ariakit/ariakit/pull/2783) **BREAKING** _(This should affect very few people)_: The `combobox` state on `useSelectStore` has been replaced by the `combobox` property on the store object.

  **Before:**

  ```js
  const combobox = useComboboxStore();
  const select = useSelectStore({ combobox });
  const hasCombobox = select.useState("combobox");
  ```

  **After:**

  ```js
  const combobox = useComboboxStore();
  const select = useSelectStore({ combobox });
  const hasCombobox = Boolean(select.combobox);
  ```

  In the example above, `select.combobox` is literally the same as the `combobox` store. It will be defined if the `combobox` store is passed to `useSelectStore`.

- [`#2783`](https://github.com/ariakit/ariakit/pull/2783) **BREAKING** _(This should affect very few people)_: The `select` and `menu` props on `useComboboxStore` have been removed. If you need to compose `Combobox` with `Select` or `Menu`, use the `combobox` prop on `useSelectStore` or `useMenuStore` instead.

- [`#2717`](https://github.com/ariakit/ariakit/pull/2717) The `children` prop as a function has been deprecated on all components. Use the [`render`](https://ariakit.org/guide/composition#explicit-render-function) prop instead.

- [`#2717`](https://github.com/ariakit/ariakit/pull/2717) The `as` prop has been deprecated on all components. Use the [`render`](https://ariakit.org/guide/composition) prop instead.

- [`#2717`](https://github.com/ariakit/ariakit/pull/2717) The `backdropProps` prop has been deprecated on `Dialog` and derived components. Use the [`backdrop`](https://ariakit.org/reference/dialog#backdrop) prop instead.

- [`#2745`](https://github.com/ariakit/ariakit/pull/2745) Component stores will now throw an error if they receive another store prop in conjunction with default prop values.

### Patch Changes

- [`#2737`](https://github.com/ariakit/ariakit/pull/2737) Fixed controlled component stores rendering with a stale state.

- [`#2758`](https://github.com/ariakit/ariakit/pull/2758) Added `CheckboxProvider` component and `useCheckboxContext` hook.

- [`#2759`](https://github.com/ariakit/ariakit/pull/2759) Added `CollectionProvider` component and `useCollectionContext` hook.

- [`#2769`](https://github.com/ariakit/ariakit/pull/2769) Added `DisclosureProvider` component and `useDisclosureContext` hook.

- [`#2770`](https://github.com/ariakit/ariakit/pull/2770) Added `CompositeProvider` component and `useCompositeContext` hook.

- [`#2771`](https://github.com/ariakit/ariakit/pull/2771) Added `DialogProvider` component and `useDialogContext` hook.

- [`#2774`](https://github.com/ariakit/ariakit/pull/2774) Added `PopoverProvider` component and `usePopoverContext` hook.

- [`#2775`](https://github.com/ariakit/ariakit/pull/2775) Added `ComboboxProvider` component and `useComboboxContext` hook.

- [`#2776`](https://github.com/ariakit/ariakit/pull/2776) Added `SelectProvider` component and `useSelectContext` hook.

- [`#2777`](https://github.com/ariakit/ariakit/pull/2777) Added `RadioProvider` component and `useRadioContext` hook.

- [`#2778`](https://github.com/ariakit/ariakit/pull/2778) Added `HovercardProvider` component and `useHovercardContext` hook.

- [`#2779`](https://github.com/ariakit/ariakit/pull/2779) Added `TabProvider` component and `useTabContext` hook.

- [`#2780`](https://github.com/ariakit/ariakit/pull/2780) Added `ToolbarProvider` component and `useToolbarContext` hook.

- [`#2781`](https://github.com/ariakit/ariakit/pull/2781) Added `TooltipProvider` component and `useTooltipContext` hook.

- [`#2782`](https://github.com/ariakit/ariakit/pull/2782) Added `FormProvider` component and `useFormContext` hook.

- [`#2783`](https://github.com/ariakit/ariakit/pull/2783) Component store objects now contain properties for the composed stores passed to them as props. For instance, `useSelectStore({ combobox })` will return a `combobox` property if the `combobox` prop is specified.

- [`#2785`](https://github.com/ariakit/ariakit/pull/2785) Added `MenuProvider` component and `useMenuContext` hook.

- [`#2785`](https://github.com/ariakit/ariakit/pull/2785) Added `MenuBarProvider` component and `useMenuBarContext` hook.

- [`#2785`](https://github.com/ariakit/ariakit/pull/2785) Added `parent` and `menubar` properties to the menu store. These properties are automatically set when rendering nested menus or menus within a menubar.

  Now, it also supports rendering nested menus that aren't nested in the React tree. In this case, you would have to supply the parent menu store manually to the child menu store.

  These properties are also included in the returned menu store object, allowing you to verify whether the menu is nested. For instance:

  ```jsx
  const menu = useMenuStore(props);
  const isNested = Boolean(menu.parent);
  ```

- [`#2794`](https://github.com/ariakit/ariakit/pull/2794) The `combobox` prop on `useSelectStore` is now automatically set based on the context.

- [`#2795`](https://github.com/ariakit/ariakit/pull/2795) Updated the `Menu` component so the `composite` and `typeahead` props are automatically set to `false` when combining it with a `Combobox` component.

  This means you'll not need to explicitly pass `composite={false}` when building a [Menu with Combobox](https://ariakit.org/examples/menu-combobox) component.

- [`#2795`](https://github.com/ariakit/ariakit/pull/2795) The `combobox` prop on `useMenuStore` is now automatically set based on the context.

- [`#2796`](https://github.com/ariakit/ariakit/pull/2796) Composed store props such as `useSelectStore({ combobox })` now accept `null` as a value.

- Updated dependencies: `@ariakit/core@0.3.0`.

## 0.2.17

### Patch Changes

- [`#2718`](https://github.com/ariakit/ariakit/pull/2718) Fixed import of `use-sync-external-store` package for ESM builds.

- Updated dependencies: `@ariakit/core@0.2.9`.

## 0.2.16

### Patch Changes

- Fixed `Collection` not populating the `items` state when passing `items` and `setItems` to `useCollectionStore`. ([#2704](https://github.com/ariakit/ariakit/pull/2704))

- Fixed `Combobox` controlled derived state. ([#2705](https://github.com/ariakit/ariakit/pull/2705))

- The `Menu`'s `disclosureElement` state is now guaranteed to be defined as the `MenuButton` element. Before, it could be overridden by a different element that received focus right before the menu opened, which could cause some weird issues. ([#2695](https://github.com/ariakit/ariakit/pull/2695))

- Fixed `Tooltip` not closing when it's open while another popover is still visible. ([#2692](https://github.com/ariakit/ariakit/pull/2692))

- Updated dependencies: `@ariakit/core@0.2.8`.

## 0.2.15

### Patch Changes

- Fixed clicking on a custom dialog backdrop hiding all parent dialogs. ([#2688](https://github.com/ariakit/ariakit/pull/2688))

- Fixed `ReactDOM.flushSync` warning on low-end devices. ([#2677](https://github.com/ariakit/ariakit/pull/2677))

- Fixed `Tooltip` not hiding when opening a dialog that was previously unmounted. ([#2691](https://github.com/ariakit/ariakit/pull/2691))

- Fixed `Focusable` not triggering `onFocusVisible` (and thus not rendering the `data-focus-visible` attribute) when an element is focused after closing a dialog. ([#2691](https://github.com/ariakit/ariakit/pull/2691))

- Fixed `Tooltip` showing on mouse move right after it was dismissed (by pressing Esc or opening a popover, for example). ([#2691](https://github.com/ariakit/ariakit/pull/2691))

## 0.2.14

### Patch Changes

- Fixed `flushSync` warning. ([#2672](https://github.com/ariakit/ariakit/pull/2672))

## 0.2.13

### Patch Changes

- The `as` prop has been soft deprecated. Use the [`render`](https://ariakit.org/guide/composition) prop instead. ([#2621](https://github.com/ariakit/ariakit/pull/2621))

- The `Combobox` component now properly disables the `autoSelect` behavior when the user is scrolling through the list of options. This should prevent issues when scrolling virtualized or infinite lists. ([#2617](https://github.com/ariakit/ariakit/pull/2617))

- Fixed `Combobox` with `autoSelect` always focusing on the first item when a virtualized list is scrolled using arrow keys. ([#2636](https://github.com/ariakit/ariakit/pull/2636))

- Added experimental element keys to the `Role` component. ([#2660](https://github.com/ariakit/ariakit/pull/2660))

- The `SelectRenderer` component doesn't require a store prop or context anymore. ([#2619](https://github.com/ariakit/ariakit/pull/2619))

- Controlled store updates are now flushed synchronously. This should prevent issues when controlling a `Combobox` by passing `value` and `setValue` to the combobox store, for example. ([#2671](https://github.com/ariakit/ariakit/pull/2671))

## 0.2.12

### Patch Changes

- Fixed `CompositeItem` not being tabbable before hydration. ([#2601](https://github.com/ariakit/ariakit/pull/2601))

## 0.2.11

### Patch Changes

- Added `forwardRef` and `memo` exports to `@ariakit/react-core/utils/system`. ([#2553](https://github.com/ariakit/ariakit/pull/2553))

- Added new experimental `CollectionRenderer` component. ([#2553](https://github.com/ariakit/ariakit/pull/2553))

- Added new experimental `CompositeRenderer` component. ([#2553](https://github.com/ariakit/ariakit/pull/2553))

- Added new experimental `SelectRenderer` component. ([#2553](https://github.com/ariakit/ariakit/pull/2553))

- Fixed `Combobox` with `autoSelect` and `autoComplete="both"` so the value is maintained when the combobox input loses focus. ([#2595](https://github.com/ariakit/ariakit/pull/2595))

- Fixed `Combobox` with `autoSelect` prop causing a scroll jump when the popover was opened by typing on the input. ([#2599](https://github.com/ariakit/ariakit/pull/2599))

- Fixed `Combobox` with the `autoSelect` prop not automatically selecting the first option when used in combination with `Select` after the selected option is re-mounted. ([#2592](https://github.com/ariakit/ariakit/pull/2592))

- Updated composite item components with the `focusOnHover` prop set to `true` so that they don't scroll into view when hovered. ([#2590](https://github.com/ariakit/ariakit/pull/2590))

- Fixed `Menu` initial focus when used in combination with `Combobox`. ([#2582](https://github.com/ariakit/ariakit/pull/2582))

- Fixed `Popover` not updating its position when the placement changes while the popover is closed. ([#2587](https://github.com/ariakit/ariakit/pull/2587))

- Fixed `Select` not scrolling selected option into view in Safari. ([#2591](https://github.com/ariakit/ariakit/pull/2591))

- Updated dependencies: `@ariakit/core@0.2.7`.

## 0.2.10

### Patch Changes

- Fixed `defaultItems` passed to the collection store being overriden when new items are added. ([#2559](https://github.com/ariakit/ariakit/pull/2559))

- Fixed `Combobox` with the `autoSelect` prop not allowing the user to scroll when the list of items is virtualized. ([#2562](https://github.com/ariakit/ariakit/pull/2562))

- Fixed `Composite` not moving focus to items by pressing the arrow keys when the active item isn't rendered. ([#2561](https://github.com/ariakit/ariakit/pull/2561))

- Fixed `CompositeItem` not being tabbable before hydration. ([#2565](https://github.com/ariakit/ariakit/pull/2565))

- Updated dependencies: `@ariakit/core@0.2.6`.

## 0.2.9

### Patch Changes

- Added new `disclosure` prop to the `Disclosure` store. ([#2518](https://github.com/ariakit/ariakit/pull/2518))

- Fixed `Focusable` not receiving focus when rendered as a native button on Safari. ([#2534](https://github.com/ariakit/ariakit/pull/2534))

- Fixed `Dialog` with `preventBodyScroll` set to `true` (default) not preventing body scroll on nested animated dialogs. ([#2534](https://github.com/ariakit/ariakit/pull/2534))

- Updated dependencies: `@ariakit/core@0.2.5`.

## 0.2.8

### Patch Changes

- Added `isValidElementWithRef` function to `@ariakit/react-core/utils/misc`. ([#2486](https://github.com/ariakit/ariakit/pull/2486))

- Added `getRefProperty` function to `@ariakit/react-core/utils/misc`. ([#2486](https://github.com/ariakit/ariakit/pull/2486))

- Added `mergeProps` function to `@ariakit/react-core/utils/misc`. ([#2486](https://github.com/ariakit/ariakit/pull/2486))

- Renamed `useForkRef` to `useMergeRefs`. ([#2486](https://github.com/ariakit/ariakit/pull/2486))

- The `render` prop now supports a `ReactElement` as a value. See the [Composition](https://ariakit.org/guide/composition) guide for more information. ([#2486](https://github.com/ariakit/ariakit/pull/2486))

## 0.2.7

### Patch Changes

- Fixed deeply nested `Dialog` not removing the `inert` attribute from elements outside when closed. ([#2507](https://github.com/ariakit/ariakit/pull/2507))

## 0.2.6

### Patch Changes

- Added missing `types` field to proxy package.json files. ([#2489](https://github.com/ariakit/ariakit/pull/2489))

- Updated dependencies: `@ariakit/core@0.2.4`.

## 0.2.5

### Patch Changes

- Added `.cjs` and `.js` extensions to paths in proxy package.json files to support bundlers that can't automaically resolve them. ([#2487](https://github.com/ariakit/ariakit/pull/2487))

- Updated dependencies: `@ariakit/core@0.2.3`.

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

- Added `useAttribute` hook.

- Fixed `activeId` state on `Tab` not updating correctly when setting `selectedId` with the Next.js App Router. ([#2443](https://github.com/ariakit/ariakit/pull/2443))

- Updated dependencies: `@ariakit/core@0.2.2`.

## 0.2.2

### Patch Changes

- Added `alwaysVisible` prop to `DisclosureContent` and derived components to allow the content to be visible even when the `open` state is `false`. ([#2438](https://github.com/ariakit/ariakit/pull/2438))

- Fixed `useHovercardStore` and `useTooltipStore` not updating the state when the `timeout`, `showTimeout` or `hideTimeout` props changed. ([#2421](https://github.com/ariakit/ariakit/pull/2421))

- Fixed `useTooltipStore` not updating the state when the `type` or `skipTimeout` props changed. ([#2421](https://github.com/ariakit/ariakit/pull/2421))

- Fixed `Dialog` moving focus on show and hide too early. ([#2421](https://github.com/ariakit/ariakit/pull/2421))

- Fixed `Hovercard` and `Tooltip` hiding too early when pressing the `Escape` key. ([#2421](https://github.com/ariakit/ariakit/pull/2421))

- Removed unnecessary `tabIndex={0}` prop from `TooltipAnchor`. ([#2421](https://github.com/ariakit/ariakit/pull/2421))

- Updated dependencies: `@ariakit/core@0.2.1`.

## 0.2.1

### Patch Changes

- Added a `render` prop to all components as a more flexible alternative to `children` as a function. ([#2411](https://github.com/ariakit/ariakit/pull/2411))

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

- Updated dependencies: `@ariakit/core@0.2.0`.

## 0.1.8

### Patch Changes

- Fixed `DialogBackdrop` not including the `data-backdrop` attribute in the initial render, causing a flash of unstyled content when the dialog is initially open. ([#2369](https://github.com/ariakit/ariakit/pull/2369))

- Fixed `Dialog` calling `hideOnInteractOutside` twice when clicking on the backdrop. ([#2369](https://github.com/ariakit/ariakit/pull/2369))

- The built-in `DialogBackdrop` component is no longer focusable. ([#2369](https://github.com/ariakit/ariakit/pull/2369))

- Call `autoFocusOnHide` and `autoFocusOnShow` with a `null` argument when there's no element to focus or the element is not focusable. This allows users to specify a fallback element to focus on hide or show. ([#2369](https://github.com/ariakit/ariakit/pull/2369))

## 0.1.7

### Patch Changes

- Fixed `Menu` focusing on the first menu item rather than the menu container when opened with a mouse click. ([#2339](https://github.com/ariakit/ariakit/pull/2339))

- Added `getPersistentElements` prop to `Dialog` to better support third-party elements that are already in the DOM by the time the dialog is opened. ([#2339](https://github.com/ariakit/ariakit/pull/2339))

- Added support on `Dialog` for nested/parallel dialogs, such as portalled dialogs created by third-party libraries and extensions. ([#2339](https://github.com/ariakit/ariakit/pull/2339))

- Fixed nested `Dialog` closing when dragging from the nested dialog to the parent dialog. ([#2339](https://github.com/ariakit/ariakit/pull/2339))

- Fixed build target. ([#2355](https://github.com/ariakit/ariakit/pull/2355))

- Updated JSDocs.

- Updated dependencies: `@ariakit/core@0.1.5`.

## 0.1.6

### Patch Changes

- Added `FocusableContainer` component to control whether `Focusable` components inside it can be auto focused when they have the `autoFocus` prop. ([#2322](https://github.com/ariakit/ariakit/pull/2322))

- Fixed `Select` component causing a scroll jump when it's dynamically rendered in a portal. ([#2322](https://github.com/ariakit/ariakit/pull/2322))

- Fixed a bug where passing controlled props to a component store wouldn't always call the state setter with an updated value. ([#2328](https://github.com/ariakit/ariakit/pull/2328))

- Fixed `Menu` not respecting `hidden={false}`. ([#2328](https://github.com/ariakit/ariakit/pull/2328))

- Updated JSDocs.

- Updated dependencies: `@ariakit/core@0.1.4`.

## 0.1.5

### Patch Changes

- Fixed `FormRadio` error when not explicitly providing the composite store. ([#2313](https://github.com/ariakit/ariakit/pull/2313))

- Fixed invariant error messages on `Menu` components. ([#2318](https://github.com/ariakit/ariakit/pull/2318))

- Updated validate and submit callbacks on `Form` so they always run in a consistent order. ([#2319](https://github.com/ariakit/ariakit/pull/2319))

- Fixed nested `Dialog` components when they are conditionally mounted. ([#2310](https://github.com/ariakit/ariakit/pull/2310))

- Updated dependencies: `@ariakit/core@0.1.3`.

## 0.1.4

### Patch Changes

- Added support for the `inert` attribute on the `Dialog` component. If the browser supports `inert`, modal dialogs will now use it rather than focus trap regions. ([#2301](https://github.com/ariakit/ariakit/pull/2301))

- Fixed nested modal `Dialog` also closing the parent dialog when clicking outside. ([#2300](https://github.com/ariakit/ariakit/pull/2300))

- Fixed modal `Dialog` eventually losing focus to `document.body`. ([#2300](https://github.com/ariakit/ariakit/pull/2300))

- Fixed `Combobox` with `autoSelect` and `autoComplete` set to `both` or `inline` where the completion string would lose its selected state. ([#2308](https://github.com/ariakit/ariakit/pull/2308))

- Fixed `Combobox` not processing composition text (like chinese characters or accents). ([#2308](https://github.com/ariakit/ariakit/pull/2308))

## 0.1.3

### Patch Changes

- Fixed `Dialog` not returning focus when closed when rendered with `React.lazy`. ([#2290](https://github.com/ariakit/ariakit/pull/2290))

- Fixed `Hovercard` being shown on touch/tap on mobile devices. ([#2291](https://github.com/ariakit/ariakit/pull/2291))

- Fixed `Hovercard` not properly cleaning up the timeout to hide the card when
  unmounted. ([#2289](https://github.com/ariakit/ariakit/pull/2289))

- Updated dependencies: `@ariakit/core@0.1.2`.

## 0.1.2

### Patch Changes

- Added missing `defaultValue` prop back to `useRadioStore`. ([#2265](https://github.com/ariakit/ariakit/pull/2265))

- Updated dependencies: `@ariakit/core@0.1.1`.

## 0.1.1

### Patch Changes

- Removed extra `console.log` from `Hovercard`.

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

- Updated dependencies: `@ariakit/core@0.1.0`.
