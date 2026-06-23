# @ariakit/react

## 0.4.30

### Improved `Dialog` performance

Opening a modal [`Dialog`](https://ariakit.com/reference/dialog) now marks and disables the elements outside the dialog in a single tree walk instead of two, tracks the dialog state with fewer store subscriptions, and finds the initial focus target without checking every tabbable element inside the dialog.

The scroll lock, the backdrop z-index synchronization, and the root-dialog bookkeeping also moved from passive effects to the layout phase, removing several forced style recalculations and layouts from the open path and applying the scroll lock before the dialog is first painted.

This also benefits components built on top of [`Dialog`](https://ariakit.com/reference/dialog), such as [`Popover`](https://ariakit.com/reference/popover), [`Menu`](https://ariakit.com/reference/menu), and [`SelectPopover`](https://ariakit.com/reference/select-popover).

### Fixed `DisclosureContent` over-waiting to unmount with mixed transitions and animations

[`DisclosureContent`](https://ariakit.com/reference/disclosure-content) (and components built on top of it, such as [`Dialog`](https://ariakit.com/reference/dialog) and [`Popover`](https://ariakit.com/reference/popover)) could keep [`unmountOnHide`](https://ariakit.com/reference/disclosure-content#unmountonhide) content mounted longer than necessary when a transition and an animation were both applied and the longest delay and longest duration belonged to different properties.

The unmount timeout is now the longest per-property end time (`delay + duration`) across the transitions and animations, instead of the longest delay added to the longest duration, which could overestimate the real end time and keep [`unmountOnHide`](https://ariakit.com/reference/disclosure-content#unmountonhide) content mounted longer than necessary. A leftover `duration` or `delay` with no matching transition or animation (such as an `animation-duration` while `animation-name` is `none`) is also ignored now.

### Other updates

- Added an associated panel lookup to [`useTabStore`](https://ariakit.com/reference/use-tab-store), improving [`Tab`](https://ariakit.com/reference/tab) performance when resolving controlled panels.
- Improved [`TooltipAnchor`](https://ariakit.com/reference/tooltip-anchor) to avoid re-rendering default description tooltip anchors when the tooltip content id changes.
- Updated [`VisuallyHidden`](https://ariakit.com/reference/visually-hidden) to hide content with the modern `clip-path: inset(50%)` technique instead of the deprecated `clip` property. The same technique now applies to the other elements Ariakit hides visually, such as the [`Select`](https://ariakit.com/reference/select) value mirror and the [`Dialog`](https://ariakit.com/reference/dialog) dismiss button.
- Fixed [`CheckboxCheck`](https://ariakit.com/reference/checkbox-check) to avoid passing invalid function children to React while unchecked.
- Fixed the [`ComboboxGroup`](https://ariakit.com/reference/combobox-group) development error message to name the correct component.
- Improved [`ComboboxItemValue`](https://ariakit.com/reference/combobox-item-value) rendering performance.
- Fixed [`Command`](https://ariakit.com/reference/command) and the components that build on it, such as [`Button`](https://ariakit.com/reference/button), staying stuck in the active (`data-active`) state when the Space key is released while the Meta key is held, or after the element becomes disabled between keydown and keyup.
- Fixed [`CompositeTypeahead`](https://ariakit.com/reference/composite-typeahead) so typeahead text from one composite no longer affects another composite rendered on the same page.
- Fixed [`Dialog`](https://ariakit.com/reference/dialog) cleanup so stale nested dialog effects no longer restore page accessibility state while a newer effect is active.
- Fixed [`Dialog`](https://ariakit.com/reference/dialog) to reset outside-interaction focus tracking when reused dialogs reopen.
- Fixed [`FormPush`](https://ariakit.com/reference/form-push) and [`FormRemove`](https://ariakit.com/reference/form-remove) incorrectly matching sibling array fields whose names share a prefix (for example `tags` and `tags2`) and throwing when a field name contained regular expression special characters.
- Fixed [`useFormStore`](https://ariakit.com/reference/use-form-store) nested value updates so path segments like `-1`, `Infinity`, and `NaN` are treated as object keys instead of array indexes.
- Improved [`Hovercard`](https://ariakit.com/reference/hovercard) so nested hovercards no longer reinstall document mousemove listeners when they mount or unmount.
- Fixed [`MenuItemRadio`](https://ariakit.com/reference/menu-item-radio) to avoid forwarding the `defaultChecked` prop to rendered elements.
- Fixed [`Popover`](https://ariakit.com/reference/popover) to ignore stale async positioning updates after a newer positioning effect has started.
- Fixed merged refs in React components and [`Portal`](https://ariakit.com/reference/portal) to preserve React 19 callback ref cleanup functions while still detaching refs that don't return a cleanup.
- Updated dependencies: `@ariakit/react-components@0.2.0`

## 0.4.29

### Fixed `Combobox` dropping characters when the popover resizes while typing

The [`Combobox`](https://ariakit.com/reference/combobox) component with [`autoSelect`](https://ariakit.com/reference/combobox#autoselect) enabled no longer loses typed characters when the popover is resized as the user types.

This could happen with a virtualized list on mobile devices, where the keyboard's autocomplete bar repeatedly changes the available viewport height. Each resize re-rendered the list and re-applied the auto-selection, briefly moving focus away from the input and dropping keystrokes.

### Composite items keep their enclosing store

Fixed [`CompositeItem`](https://ariakit.com/reference/composite-item) to register on the enclosing [`Composite`](https://ariakit.com/reference/composite) store when rendered as the same element as a component that sets its own composite context, such as a [`MenuButton`](https://ariakit.com/reference/menu-button) inside a [`MenuProvider`](https://ariakit.com/reference/menu-provider). This keeps the item reachable with the arrow keys in one- and two-dimensional composite widgets.

The [`CompositeItem`](https://ariakit.com/reference/composite-item) can now omit the explicit `store` prop and still register on the enclosing composite:

```tsx {5-7}
const composite = Ariakit.useCompositeStore();

<Ariakit.Composite store={composite}>
  <Ariakit.MenuProvider>
    <Ariakit.CompositeItem render={<Ariakit.MenuButton />}>
      Menu
    </Ariakit.CompositeItem>
    <Ariakit.Menu>
      <Ariakit.MenuItem>Edit</Ariakit.MenuItem>
    </Ariakit.Menu>
  </Ariakit.MenuProvider>
</Ariakit.Composite>;
```

### Components no longer throw on events with a non-element target

Several components attach global event listeners that read `event.target`/`event.relatedTarget` and call methods like `contains()` and `hasAttribute()` on them. When third-party code dispatched an event whose target was a non-element `EventTarget` (such as `window` or an `XMLHttpRequest`), those calls threw a `TypeError`.

This affected [`Dialog`](https://ariakit.com/reference/dialog) (its interact-outside and Escape-to-close listeners), [`HovercardDisclosure`](https://ariakit.com/reference/hovercard-disclosure) (its focusout listener), and the shared `isFocusEventOutside` and `isPortalEvent` helpers used by [`Focusable`](https://ariakit.com/reference/focusable), [`Combobox`](https://ariakit.com/reference/combobox), [`Composite`](https://ariakit.com/reference/composite), and [`Portal`](https://ariakit.com/reference/portal).

### Other updates

- Improved performance of components that subscribe to internal store state by upgrading the underlying [`@ariakit/store`](https://www.npmjs.com/package/@ariakit/store) package.
- Fixed [`Button`](https://ariakit.com/reference/button) to preserve React form pending state when submitted with the keyboard.
- Fixed [`Dialog`](https://ariakit.com/reference/dialog) to preserve closing animations when using [`unmountOnHide`](https://ariakit.com/reference/dialog#unmountonhide) with the controlled [`open`](https://ariakit.com/reference/dialog#open) and [`onClose`](https://ariakit.com/reference/dialog#onclose) props and no explicit store.
- Documented that [`removeValue`](https://ariakit.com/reference/use-form-store#removevalue) preserves array length by replacing removed items with `null`.
- Fixed runtime `process.env.NODE_ENV` checks in published package output, including test-only behavior and development warnings.
- Fixed rendering many [`Menu`](https://ariakit.com/reference/menu) components on the same page potentially causing a "Maximum update depth exceeded" error. [`MenuItem`](https://ariakit.com/reference/menu-item) elements now register only while the menu is visible, instead of registering on mount even while it's hidden.
- Fixed [`Tab`](https://ariakit.com/reference/tab) to move focus to the selected tab after a controlled [`selectedId`](https://ariakit.com/reference/tab-provider#selectedid) update while a tab has DOM focus.
- Fixed [`TooltipProvider`](https://ariakit.com/reference/tooltip-provider) to avoid a re-entrant loop when multiple tooltips are forced open at the same time.
- Updated dependencies: `@ariakit/react-components@0.1.2`

## 0.4.28

- Release artifacts now include npm trusted publishing provenance.
- Updated dependencies: `@ariakit/react-components@0.1.1`

## 0.4.27

- Fixed [`Menu`](https://ariakit.com/reference/menu) to respect the [`autoFocusOnShow`](https://ariakit.com/reference/menu#autofocusonshow) prop when set to `false` or when a callback returns `false`, while still allowing arrow keys to move focus into an already-open menu.
- Updated dependencies: `@ariakit/react-components@0.1.0`

## 0.4.26

This version focuses on bug fixes across [`Dialog`](https://ariakit.com/reference/dialog), [`Portal`](https://ariakit.com/reference/portal), [`Radio`](https://ariakit.com/reference/radio), [`Combobox`](https://ariakit.com/reference/combobox), and [`MenuButton`](https://ariakit.com/reference/menu-button), along with improvements to how portals behave inside fullscreen elements, how dialogs handle events in popup windows, and how [`Radio`](https://ariakit.com/reference/radio) groups automatically generate unique `name` attributes.

### Fixed events not handled in popup windows

[`Dialog`](https://ariakit.com/reference/dialog) and components that extend it, such as [`Menu`](https://ariakit.com/reference/menu) and [`Popover`](https://ariakit.com/reference/popover), now handle events correctly when rendered in a popup window opened via `window.open()`. [`hideOnEscape`](https://ariakit.com/reference/dialog#hideonescape), [`hideOnInteractOutside`](https://ariakit.com/reference/dialog#hideoninteractoutside), and focus restoration now use the content element's `ownerDocument` instead of the main window's `document` for event listeners.

### Fixed `Portal` not rendering inside fullscreen elements

[`Portal`](https://ariakit.com/reference/portal) was always appended to `document.body`, which made it invisible when an ancestor element entered fullscreen mode via the Fullscreen API. Portals are now automatically moved to `document.fullscreenElement` when it's active, and back to `document.body` when fullscreen is exited.

### Auto-generated `name` attribute for `Radio`

[`Radio`](https://ariakit.com/reference/radio) now automatically uses the [`RadioGroup`](https://ariakit.com/reference/radio-group) store's `id` as the default [`name`](https://ariakit.com/reference/radio#name) attribute when no explicit `name` prop is provided. This ensures consecutive [`RadioGroup`](https://ariakit.com/reference/radio-group) components have unique names, preventing the browser from treating all radio inputs as a single group and fixing Tab navigation and form submission issues.

### Other updates

- Fixed [`Combobox`](https://ariakit.com/reference/combobox) pressing Enter from submitting a parent form when the popover is open but has no matching items.
- Fixed [`Dialog`](https://ariakit.com/reference/dialog) not removing `data-enter` when closed after using the [`render`](https://ariakit.com/reference/dialog#render) prop to wrap the dialog element in an outer element.
- Fixed [`Dialog`](https://ariakit.com/reference/dialog) not restoring focus to the disclosure element when the dialog was opened and closed quickly in succession.
- Fixed [`MenuButton`](https://ariakit.com/reference/menu-button) `aria-haspopup` attribute changing from `"menu"` to `"dialog"` when opening a menu that contains a combobox.
- Fixed [`render`](https://ariakit.com/guide/composition) prop merging when the rendered element passes falsy `className` or event handler values such as `undefined` or `null`.
- Fixed `Math.random()` being called unconditionally when creating composite stores ([`useTabStore`](https://ariakit.com/reference/use-tab-store), [`useComboboxStore`](https://ariakit.com/reference/use-combobox-store), [`useSelectStore`](https://ariakit.com/reference/use-select-store), etc.), even when an explicit `id` prop was provided. This was causing Next.js build errors with `cacheComponents` enabled.
- Updated dependencies: `@ariakit/react-core@0.4.26`

## 0.4.25

### Clicking outside no longer restores focus to the disclosure element

[`Dialog`](https://ariakit.com/reference/dialog) and components that extend it (such as [`Menu`](https://ariakit.com/reference/menu) and [`Popover`](https://ariakit.com/reference/popover)) no longer restore focus to the disclosure element when the dialog is closed by clicking or right-clicking outside. This aligns with native HTML `<dialog>` and `popover` behavior where trigger buttons don't receive focus when you interact outside.

Focus is still restored normally when the dialog is closed by other means, such as pressing Escape, selecting a menu item, or calling `store.hide()` programmatically. In these cases the disclosure element is now focused with default browser scrolling instead of `preventScroll`.

### Improved Safari focus behavior for buttons, checkboxes, and radio buttons

On Safari, buttons, checkboxes, and radio buttons don't receive focus on mousedown like other browsers. Previously, this was handled by manually focusing the element in a `mousedown` handler. Now, an explicit `tabIndex` attribute is set on these elements in Safari, which causes the browser to focus them natively. This results in more predictable focus behavior and fewer timing-sensitive workarounds.

### Other updates

- Fixed a race condition in [`Dialog`](https://ariakit.org/reference/dialog) where the deferred auto-focus could steal focus from the disclosure element after the dialog was closed.
- Fixed [`formStore.setError()`](https://ariakit.org/reference/use-form-store#seterror) and [`formStore.setFieldTouched()`](https://ariakit.org/reference/use-form-store#setfieldtouched) failing to set values on nested array field paths such as `items.0.name`.
- Fixed [`SelectItem`](https://ariakit.com/reference/select-item) store item `children` property reflecting the [`value`](https://ariakit.com/reference/select-item#value) prop instead of the actual rendered text content.
- Fixed [`MenuButton`](https://ariakit.com/reference/menu-button) to preserve [`accessibleWhenDisabled`](https://ariakit.com/reference/menu-button#accessiblewhendisabled) behavior when composed with a rendered [`Button`](https://ariakit.com/reference/button).
- Fixed [`Menu`](https://ariakit.org/reference/menu) with [`modal`](https://ariakit.org/reference/menu#modal) and [`getPersistentElements`](https://ariakit.org/reference/menu#getpersistentelements) so focusing a persistent [`MenuButton`](https://ariakit.org/reference/menu-button) doesn't immediately move focus back to the menu.
- Fixed [`TabPanel`](https://ariakit.com/reference/tab-panel) not re-evaluating tabbable children when the panel becomes visible.
- Fixed components not dropping their internal `aria-labelledby` when `aria-label` is passed.
- Updated dependencies: `@ariakit/react-core@0.4.25`

## 0.4.24

This release improves React combobox and form reliability, including preserved combobox input and popover scroll position during result updates, more predictable focus behavior after filtering selects on iOS Safari, proper isolation of [`FormRadio`](https://ariakit.org/reference/form-radio) groups inside nested composite widgets, safer handling of explicitly undefined [`id`](https://ariakit.org/reference/select-item#id) props, and better generic typing for [`CheckboxProvider`](https://ariakit.org/reference/checkbox-provider) wrappers.

### Improved `CheckboxProvider` generic typing

This fixes TypeScript errors when wrapping [`CheckboxProvider`](https://ariakit.org/reference/checkbox-provider) in generic React components. Controlled and uncontrolled checkbox group wrappers now type-check correctly without requiring non-null assertions on values such as `defaultValue`.

Before, generic wrappers often needed a non-null assertion to satisfy the provider props:

```tsx {15}
interface CheckboxCardGridProps<T extends string | number> extends Pick<
  Ariakit.CheckboxProviderProps<T>,
  "value" | "setValue" | "defaultValue"
> {}

function CheckboxCardGrid<T extends string | number>({
  value,
  setValue,
  defaultValue,
}: CheckboxCardGridProps<T>) {
  return (
    <CheckboxProvider
      value={value}
      setValue={setValue}
      defaultValue={defaultValue!}
    />
  );
}
```

Now the same wrapper can type-check without the workaround:

```tsx {4}
<CheckboxProvider
  value={value}
  setValue={setValue}
  defaultValue={defaultValue}
/>
```

### Fixed `Combobox` input scroll position resetting

When a [`Combobox`](https://ariakit.org/reference/combobox) input's text overflowed its width, the input's horizontal scroll position reset to the beginning each time the results changed. This happened because the virtual focus mechanism briefly moved DOM focus to the active item and back when [`autoSelect`](https://ariakit.org/reference/combobox#autoselect) was enabled, causing browsers to reset the input's internal `scrollLeft`.

The scroll position is now preserved across these focus transitions.

### Fixed `FormRadio` registering to ancestor composite stores

[`FormRadio`](https://ariakit.org/reference/form-radio) items nested inside components like [`TabPanel`](https://ariakit.org/reference/tab-panel) were incorrectly registering to the tab store, causing arrow keys in the tab list to navigate to radio items instead of other tabs. [`FormRadioGroup`](https://ariakit.org/reference/form-radio-group) now resets the composite context for its children, preventing form radio items from being picked up by unrelated parent stores.

### Other updates

- Fixed [`ComboboxPopover`](https://ariakit.org/reference/combobox-popover) scroll position resetting when items change in multi-select mode (e.g., during infinite scroll).
- Fixed [`SelectItem`](https://ariakit.org/reference/select-item) stealing focus from the combobox input when the selected item reappears after filtering, which dismissed the keyboard on iOS Safari.
- Fixed components crashing with "Maximum call stack size exceeded" when the [`id`](https://ariakit.org/reference/select-item#id) prop is explicitly passed as `undefined`.
- Updated dependencies: `@ariakit/react-core@0.4.24`

## 0.4.23

- Fixed [`ComboboxDisclosure`](https://ariakit.org/reference/combobox-disclosure) so pressing Escape closes [`ComboboxPopover`](https://ariakit.org/reference/combobox-popover) when the popover starts open and the [`Combobox`](https://ariakit.org/reference/combobox) input is auto-focused.
- Updated dependencies: `@ariakit/react-core@0.4.23`

## 0.4.22

- Fixed [`MenuItemRadio`](https://ariakit.org/reference/menu-item-radio) so controlled reset states are reflected correctly by the menu item and [`MenuItemCheck`](https://ariakit.org/reference/menu-item-check).
- Updated dependencies: `@ariakit/react-core@0.4.22`

## 0.4.21

- Fixed an error when trying to reach focusable elements within iframes.
- Fixed issues with React 19 types.
- Updated dependencies: `@ariakit/react-core@0.4.21`

## 0.4.20

- Fixed `RefObject` types for React 19.
- Updated packages to target ES2018 (previously ES2017).
- Updated dependencies: `@ariakit/react-core@0.4.20`

## 0.4.19

- Updated `Array` types to `ReadonlyArray` for better compatibility.
- Fixed the automatic border width on [`PopoverArrow`](https://ariakit.org/reference/popover-arrow) to account for the device pixel ratio.
- Updated dependencies: `@ariakit/react-core@0.4.19`

## 0.4.18

### Improved Combobox performance

Thanks to [@iamakulov](https://github.com/iamakulov), the [Combobox](https://ariakit.org/components/combobox) component now opens ~30% faster by removing unnecessary calls to an internal function that adds global event listeners. See the [pull request](https://github.com/ariakit/ariakit/pull/4860) for more details.

### Other updates

- Improved [`PopoverArrow`](https://ariakit.org/reference/popover-arrow) default appearance when using semi-transparent borders.
- Updated dependencies: `@ariakit/react-core@0.4.18`

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

---

[Previous versions](https://github.com/ariakit/ariakit/blob/main/packages/ariakit-react/CHANGELOG-0314.md)
