# @ariakit/react

## 0.4.17

- Restored support for React 17 in [`PopoverArrow`](https://ariakit.org/reference/popover-arrow).
- Updated dependencies: `@ariakit/react-core@0.4.17`

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
- Updated dependencies: `@ariakit/react-core@0.4.16`

## 0.4.15

- Fixed a regression on [Hovercard](https://ariakit.org/components/hovercard) that sometimes prevented it from closing when other popups were opened.
- Fixed typings for [`onSubmit`](https://ariakit.org/reference/use-form-store#onsubmit) and [`onValidate`](https://ariakit.org/reference/use-form-store#onvalidate).
- Improved JSDocs.
- Updated dependencies: `@ariakit/react-core@0.4.15`

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
- Added [`id`](https://ariakit.org/reference/use-composite-store#id) prop to composite stores.
- Fixed composite typeahead functionality when rendering virtualized lists.
- Fixed [`SelectValue`](https://ariakit.org/reference/select-value) to display the [`fallback`](https://ariakit.org/reference/select-value#fallback) when the value is an empty array or string.
- Fixed an issue where composite widgets might not navigate to the correct item when pressing <kbd>↑</kbd> while the composite base element was focused.
- Improved JSDocs.
- Updated dependencies: `@ariakit/react-core@0.4.14`

## 0.4.13

### Accessible composite widgets with invalid `activeId`

We've improved the logic for composite widgets such as [Tabs](https://ariakit.org/components/tab) and [Toolbar](https://ariakit.org/components/toolbar) when the [`activeId`](https://ariakit.org/reference/composite-provider#activeid) state points to an element that is disabled or missing from the DOM. This can happen if an item is dynamically removed, disabled, or lazily rendered, potentially making the composite widget inaccessible to keyboard users.

Now, when the [`activeId`](https://ariakit.org/reference/composite-provider#activeid) state is invalid, all composite items will remain tabbable, enabling users to <kbd>Tab</kbd> into the composite widget. Once a composite item receives focus or the element referenced by the [`activeId`](https://ariakit.org/reference/composite-provider#activeid) state becomes available, the roving tabindex behavior is restored.

### Other updates

- Fixed regression in [`focusShift`](https://ariakit.org/reference/composite-provider#focusshift).
- Fixed [Radio](https://ariakit.org/components/radio) to prevent `onChange` from triggering on radios that are already checked.
- Fixed [`DisclosureContent`](https://ariakit.org/reference/disclosure-content) setting an incorrect `animating` state value during enter animations.
- Improved JSDocs.
- Updated dependencies: `@ariakit/react-core@0.4.13`

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
- Fixed [`Tab`](https://ariakit.org/reference/tab) to pass the [`rowId`](https://ariakit.org/reference/tab#rowid) prop when used with other composite widgets.
- Improved JSDocs.
- Updated dependencies: `@ariakit/react-core@0.4.12`

## 0.4.11

### Tabs inside animated Combobox or Select

When rendering [Tab](https://ariakit.org/components/tab) inside [Combobox](https://ariakit.org/components/combobox) or [Select](https://ariakit.org/components/select), it now waits for the closing animation to finish before restoring the tab with the selected item. This should prevent an inconsistent UI where the tab is restored immediately while the content is still animating out. See [Select with Combobox and Tabs](https://ariakit.org/examples/select-combobox-tab).

### Other updates

- Updated [Combobox](https://ariakit.org/components/combobox) to immediately reset the [`activeId`](https://ariakit.org/reference/use-combobox-store#activeid) upon closing the popover.
- Removed delay when applying the [`data-focus-visible`](https://ariakit.org/guide/styling#data-focus-visible) attribute.
- Fixed mouse down on [`MenuButton`](https://ariakit.org/reference/menu-button) hiding the menu on Safari.
- Improved JSDocs.
- Updated dependencies: `@ariakit/react-core@0.4.11`

## 0.4.10

- Fixed a regression introduced in `v0.4.8` that set the default value of the [`accessibleWhenDisabled`](https://ariakit.org/reference/tab#accessiblewhendisabled) prop to `false` on [`Tab`](https://ariakit.org/reference/tab).
- Updated dependencies: `@ariakit/react-core@0.4.10`

## 0.4.9

### New `useStoreState` hook

The [`useStoreState`](https://ariakit.org/reference/use-store-state) hook is now part of the public API. Previously used internally by dynamic `useState` hooks from Ariakit store objects, it is now available in the `@ariakit/react` package to ensure compatibility with the new React Compiler.

The following snippets are equivalent:

```js
const combobox = useComboboxStore();
const value = combobox.useState("value");
```

```js
const combobox = useComboboxStore();
const value = useStoreState(combobox, "value");
```

Besides working better with the new React Compiler, [`useStoreState`](https://ariakit.org/reference/use-store-state) is more flexible than `store.useState` as it accepts a store that is `null` or `undefined`, in which case the returned value will be `undefined`. This is useful when you're reading a store from a context that may not always be available:

```js
const combobox = useComboboxContext();
const value = useStoreState(combobox, "value");
```

### New `ComboboxValue` component

A [`ComboboxValue`](https://ariakit.org/reference/combobox-value) component is now available. This _value_ component displays the current value of the combobox input without rendering any DOM elements or taking any HTML props. You can optionally pass a function as a child returning any React node based on the current value:

```jsx
<ComboboxProvider>
  <Combobox />
  <ComboboxValue>{(value) => `Current value: ${value}`}</ComboboxValue>
</ComboboxProvider>
```

### `aria-selected` on composite items

Composite items like [`ComboboxItem`](https://ariakit.org/reference/combobox-item) no longer have the `aria-selected` attribute automatically set when focused. This attribute was previously used to address an old bug in Google Chrome, but it's no longer needed. Now, it's only set when the item is actually selected, such as in a select widget or a multi-selectable combobox.

This change shouldn't affect most users since the `aria-selected` attribute is not part of the public API and is not recommended as a [CSS selector](https://ariakit.org/guide/styling#css-selectors) (use [`[data-active-item]`](https://ariakit.org/guide/styling#data-active-item) instead). However, if you have snapshot tests, you may need to update them.

### Other updates

- Added [`userValue`](https://ariakit.org/reference/combobox-item-value#uservalue) prop to [`ComboboxItemValue`](https://ariakit.org/reference/combobox-item-value).
- Improved JSDocs.
- Updated dependencies: `@ariakit/react-core@0.4.9`

## 0.4.8

### Accessing selected tabs when disabled

A [Tab](https://ariakit.org/components/tab) component that is both selected and disabled will now remain accessible to keyboard focus even if the [`accessibleWhenDisabled`](https://ariakit.org/reference/tab#accessiblewhendisabled) prop is set to `false`. This ensures users can navigate to other tabs using the keyboard.

### Other updates

- Fixed [Dialog](https://ariakit.org/components/dialog) to prevent smooth scrolling on hide.
- Fixed [Hovercard](https://ariakit.org/components/hovercard) unexpectedly hiding when scrolling in Safari.
- Improved JSDocs.
- Updated dependencies: `@ariakit/react-core@0.4.8`

## 0.4.7

### New `SelectValue` component

A [`SelectValue`](https://ariakit.org/reference/select-value) component is now available. This is a _value_ component, which means it doesn't render any DOM elements and, as a result, doesn't take HTML props. Optionally, it can use a [`fallback`](https://ariakit.org/reference/select-value#fallback) prop as a default value if the store's [`value`](https://ariakit.org/reference/use-select-store#value) is `undefined`:

```jsx
<Select>
  <SelectValue fallback="Select a value" />
  <SelectArrow />
</Select>
```

### Other updates

- Added React 19 to peer dependencies.
- Fixed [`autoSelect`](https://ariakit.org/reference/combobox#autoselect) behavior with virtualized lists on mobile devices.
- Improved JSDocs.
- Updated dependencies: `@ariakit/react-core@0.4.7`

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
- Updated dependencies: `@ariakit/react-core@0.4.6`

## 0.4.5

### Multi-selectable Combobox with inline autocomplete

When rendering a [Multi-selectable Combobox](https://ariakit.org/examples/combobox-multiple) with the [`autoComplete`](https://ariakit.org/reference/combobox#autocomplete) prop set to `"inline"` or `"both"`, the completion string will no longer be inserted into the input upon deselecting an item. This is because the completion string generally represents an addition action, whereas deselecting an item is a removal action.

### Other updates

- Updated [`Combobox`](https://ariakit.org/reference/combobox) to no longer use `ReactDOM.flushSync` when updating the value.
- Added new [`resetValueOnSelect`](https://ariakit.org/reference/combobox-item#resetvalueonselect) prop to [`ComboboxItem`](https://ariakit.org/reference/combobox-item).
- Added new [`resetValue`](https://ariakit.org/reference/use-combobox-store#resetvalue) method to combobox store.
- Improved JSDocs.
- Updated dependencies: `@ariakit/react-core@0.4.5`

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
- Updated dependencies: `@ariakit/react-core@0.4.4`

## 0.4.3

- Fixed TypeScript types for `ref`.
- Fixed [`CompositeItem`](https://ariakit.org/reference/composite-item) occasionally failing to set the [`activeId`](https://ariakit.org/reference/use-composite-store#activeid) state on focus.
- Fixed [`unmountOnHide`](https://ariakit.org/reference/tab-panel#unmountonhide) prop not working on [`TabPanel`](https://ariakit.org/reference/tab-panel) without [`tabId`](https://ariakit.org/reference/tab-panel#tabid).
- Fixed regression in `v0.4.2` that caused nested tabs to stop working.
- Added new [`combobox`](https://ariakit.org/reference/tab-provider#combobox) property to tab store.
- Improved JSDocs.
- Updated dependencies: `@ariakit/react-core@0.4.3`

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
- Updated dependencies: `@ariakit/react-core@0.4.2`

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
- Updated dependencies: `@ariakit/react-core@0.4.1`

## 0.4.0

This version introduces enhanced support for CSS animations and transitions, along with a few breaking changes for quite specific cases. The majority of users won't be impacted by these.

Please review the brief notes following the **BREAKING** labels on each update to determine if any changes are needed in your code.

### Improved animation support

**BREAKING** if you have popups with CSS animation/transition, but aren't using the [`animated`](https://ariakit.org/reference/disclosure-provider#animated) prop.

This version enhances support for CSS animations and transitions on Ariakit components that use [Disclosure](https://ariakit.org/components/disclosure). This includes [Dialog](https://ariakit.org/components/dialog), [Popover](https://ariakit.org/components/popover), [Combobox](https://ariakit.org/components/combobox), [Select](https://ariakit.org/components/select), [Hovercard](https://ariakit.org/components/hovercard), [Menu](https://ariakit.org/components/menu), and [Tooltip](https://ariakit.org/components/tooltip).

These components now support _enter_ and _leave_ transitions and animations right out of the box, eliminating the need to provide an explicit [`animated`](https://ariakit.org/reference/disclosure-provider#animated) prop. If an enter animation is detected, the component will automatically wait for a leave animation to complete before unmounting or hiding itself.

This means that if you've set any CSS animation/transition property on a dialog and didn't previously specify the [`animated`](https://ariakit.org/reference/disclosure-provider#animated) prop, you might now notice a delay when closing the dialog. If this isn't what you want, you can turn off the CSS animation/transition using the [`[data-leave]`](https://ariakit.org/guide/styling#data-leave) selector:

```css
.dialog[data-leave] {
  transition: unset;
}
```

Use the [`[data-enter]`](https://ariakit.org/guide/styling#data-enter) selector to apply CSS transitions. For CSS animations, use the newly introduced [`[data-open]`](https://ariakit.org/guide/styling#data-open) selector. The [`[data-leave]`](https://ariakit.org/guide/styling#data-leave) selector can be used for both transitions and animations.

### `ComboboxList` is no longer focusable

**BREAKING** if you're using the [`ComboboxList`](https://ariakit.org/reference/combobox-list) component directly with [`Focusable`](https://ariakit.org/reference/focusable) props.

The [`ComboboxList`](https://ariakit.org/reference/combobox-list) component is no longer focusable and doesn't accept focusable props such as [`autoFocus`](https://ariakit.org/reference/focusable#autofocus), [`disabled`](https://ariakit.org/reference/focusable#disabled), and [`onFocusVisible`](https://ariakit.org/reference/focusable#onfocusvisible) anymore. If you need focusable features specifically on the [`ComboboxList`](https://ariakit.org/reference/combobox-list) component, you can use [composition](https://ariakit.org/guide/composition) to render it as a [`Focusable`](https://ariakit.org/reference/focusable) component.

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

**BREAKING** if you're using TypeScript with the [`onChange`](https://ariakit.org/reference/radio#onchange) prop on [`Radio`](https://ariakit.org/reference/radio), [`FormRadio`](https://ariakit.org/reference/form-radio), or [`MenuItemRadio`](https://ariakit.org/reference/menu-item-radio).

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
- The `type` prop on [Tooltip](https://ariakit.org/components/tooltip) has been deprecated. See [Tooltip anchors must have accessible names](https://ariakit.org/components/tooltip#tooltip-anchors-must-have-accessible-names).
- Removed the ancestors of open, nested modals from the accessibility tree.
- Tooltips no longer use `aria-describedby` to associate the tooltip content with the anchor.
- Added new [`disclosure`](https://ariakit.org/reference/use-disclosure-store#disclosure-1) property to disclosure stores.
- Updated dependencies: `@ariakit/react-core@0.4.0`

## 0.3.14

- Fixed a regression introduced in `v0.3.13` where dialogs wouldn't close when clicking outside on iOS.
- Updated dependencies: `@ariakit/react-core@0.3.14`

## 0.3.13

### Improved performance of large collections

Components like [`MenuItem`](https://ariakit.org/reference/menu-item), [`ComboboxItem`](https://ariakit.org/reference/combobox-item), and [`SelectItem`](https://ariakit.org/reference/select-item) should now offer improved performance when rendering large collections.

### New `FormControl` component

This version introduces a new [`FormControl`](https://ariakit.org/reference/form-control) component. In future versions, this will replace the [`FormField`](https://ariakit.org/reference/form-field) component.

### Other updates

- Adjusted the focus behavior in Safari to occur prior to the `pointerup` event instead of `mouseup`.
- Improved JSDocs.
- Updated dependencies: `@ariakit/react-core@0.3.13`

## 0.3.12

- The auto-select feature on [Combobox](https://ariakit.org/components/combobox) now resets with each keystroke.
- Fixed [`Combobox`](https://ariakit.org/reference/combobox) with the [`autoSelect`](https://ariakit.org/reference/combobox#autoselect) prop calling `onFocus` with every input change.
- Fixed [`Hovercard`](https://ariakit.org/reference/hovercard) flickering when used with shadow DOM.
- Fixed [`Select`](https://ariakit.org/reference/select) with [`Combobox`](https://ariakit.org/reference/combobox) scroll jumping when opening using keyboard navigation.
- Fixed [`CompositeItem`](https://ariakit.org/reference/composite-item) triggering blur on focus.
- Fixed [`ComboboxItem`](https://ariakit.org/reference/combobox-item) not triggering the `onClick` event when the item is partially visible.
- Improved JSDocs.
- Updated dependencies: `@ariakit/react-core@0.3.12`

## 0.3.11

### Modal Combobox

The [Combobox](https://ariakit.org/components/combobox) components now support the [`modal`](https://ariakit.org/reference/combobox-popover#modal) prop on [`ComboboxPopover`](https://ariakit.org/reference/combobox-popover).

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
- Updated dependencies: `@ariakit/react-core@0.3.11`

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
- Updated dependencies: `@ariakit/react-core@0.3.10`

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
- Updated dependencies: `@ariakit/react-core@0.3.9`

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
- Updated dependencies: `@ariakit/react-core@0.3.8`

## 0.3.7

### Expanding Menubar

The [Menubar](https://ariakit.org/components/menubar) component will now only expand if there's another menu already expanded in the same menubar.

### Internal data attribute changes

Just like the change in v0.3.6 that removed the `data-command` and `data-disclosure` attributes from elements, this update stops the `data-composite-hover` attribute from infiltrating composite item elements in the DOM. We're mentioning this in the changelog as some users might have snapshot tests that require updating.

### Other updates

- Fixed `setSelectionRange` error when used with [unsupported](https://html.spec.whatwg.org/multipage/input.html#concept-input-apply) input types.
- Fixed [`MenuButton`](https://ariakit.org/reference/menu-button) with [`showOnHover`](https://ariakit.org/reference/menu-button#showonhover) not updating the `activeId` state when hovered.
- Updated [`onFocusVisible`](https://ariakit.org/reference/focusable#onfocusvisible) element type on [`Focusable`](https://ariakit.org/reference/focusable) from `Element` to `HTMLElement`.
- Updated dependencies: `@ariakit/react-core@0.3.7`

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
- Updated dependencies: `@ariakit/react-core@0.3.6`

---

[Previous versions](https://github.com/ariakit/ariakit/blob/main/packages/ariakit-react/CHANGELOG-035.md)
