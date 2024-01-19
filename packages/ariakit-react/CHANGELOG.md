# @ariakit/react

## 0.4.0

This version introduces enhanced support for CSS animations and transitions, along with a few breaking changes for quite specific cases. The majority of users won't be impacted by these.

Please review the brief notes following the **BREAKING** labels on each update to determine if any changes are needed in your code.

### Improved animation support

This version enhances support for CSS animations and transitions on Ariakit components that use [Disclosure](https://ariakit.org/components/disclosure). This includes [Dialog](https://ariakit.org/components/dialog), [Popover](https://ariakit.org/components/popover), [Combobox](https://ariakit.org/components/combobox), [Select](https://ariakit.org/components/select), [Hovercard](https://ariakit.org/components/hovercard), [Menu](https://ariakit.org/components/menu), and [Tooltip](https://ariakit.org/components/tooltip).

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
