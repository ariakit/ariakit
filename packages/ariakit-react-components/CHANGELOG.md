# @ariakit/react-components

## 0.3.0

This version removes an internal dialog tree helper that was exposed through a deep import path, and improves form handling and composite separator behavior in React components.

Please review the brief notes following the **BREAKING** labels on each update to determine if any changes are needed in your code.

### Removed `disableTreeOutside` from `dialog/utils/disable-tree`

**BREAKING** if you import `disableTreeOutside` from `@ariakit/react-components/dialog/utils/disable-tree`.

The helper was intended for internal dialog tree management and is no longer used now that modal [`Dialog`](https://ariakit.com/reference/dialog) components mark and disable outside elements in a single tree walk.

Before:

```ts
import { disableTreeOutside } from "@ariakit/react-components/dialog/utils/disable-tree";
```

After:

```ts
// No public replacement import is available.
```

### Composite separators honor explicit orientation

Fixed [`CompositeSeparator`](https://ariakit.com/reference/composite-separator) to honor an explicit `orientation` prop instead of always using the composite store-derived default. This also fixes components built on it, including [`ToolbarSeparator`](https://ariakit.com/reference/toolbar-separator), [`MenuSeparator`](https://ariakit.com/reference/menu-separator), [`SelectSeparator`](https://ariakit.com/reference/select-separator), and [`ComboboxSeparator`](https://ariakit.com/reference/combobox-separator).

### `form.names.*` paths no longer crash on symbol access

Fixed [`useFormStore`](https://ariakit.com/reference/use-form-store) [`names`](https://ariakit.com/reference/use-form-store#names) values throwing `Cannot convert a Symbol value to a string` when an absent symbol key was read from them. This happened whenever something probed a symbol on a raw name — most notably when React reads `Symbol.iterator` to reconcile a name rendered as a React child, but also `Object.prototype.toString.call(name)` and `Array.from(name)`.

Absent symbol keys now resolve to `undefined`, matching plain-object semantics, so those probes degrade gracefully. The documented string coercion keeps working, so coerce a name before rendering or inspecting it outside Ariakit props:

```tsx
<p>This field submits as {`${form.names.email}`}.</p>
```

### Form submission no longer stalls while the tab is hidden

[`useFormStore`](https://ariakit.com/reference/use-form-store)'s [`submit`](https://ariakit.com/reference/use-form-store#submit) and [`validate`](https://ariakit.com/reference/use-form-store#validate) no longer stall while the document is hidden — for example, when auto-saving a draft on `visibilitychange`.

They previously awaited a `requestAnimationFrame`, which browsers pause in background tabs, so the submission only completed once the tab was brought back to the foreground.

### Other updates

- Added `getVisuallyHiddenStyle` to `@ariakit/react-components/visually-hidden/visually-hidden` for reusing the same styles as [`VisuallyHidden`](https://ariakit.com/reference/visually-hidden).
- Fixed `CollectionRenderer`, `CompositeRenderer`, and `SelectRenderer` to position measured virtualized items correctly when `gap` is combined with `paddingStart` or `padding`.
- Fixed [`ComboboxDisclosure`](https://ariakit.com/reference/combobox-disclosure) to honor `event.preventDefault()` in `onMouseDown` before moving focus to the [`Combobox`](https://ariakit.com/reference/combobox) input.
- Fixed [`ComboboxItem`](https://ariakit.com/reference/combobox-item) so non-paste Ctrl/Cmd character shortcuts preserve focus and the combobox value when virtual focus is disabled, while paste shortcuts still route to the input.
- Fixed [`ComboboxItemValue`](https://ariakit.com/reference/combobox-item-value) so overlapping user input matches are rendered without duplicated text.
- Fixed [`Combobox`](https://ariakit.com/reference/combobox) inline autocomplete so decomposed Unicode input no longer produces misspelled completion values.
- Fixed [`Composite`](https://ariakit.com/reference/composite) keyboard paging and [`Combobox`](https://ariakit.com/reference/combobox) scroll behavior for elements rendered inside a same-origin iframe.
- Fixed offscreen [`CompositeItem`](https://ariakit.com/reference/composite-item) placeholders to omit internal option props from the DOM while relying on `aria-disabled` instead of the native `disabled` attribute.
- Fixed [`Composite`](https://ariakit.com/reference/composite) base-element arrow key navigation in RTL composites, including components built on it such as [`Toolbar`](https://ariakit.com/reference/toolbar) and [`TabList`](https://ariakit.com/reference/tab-list).
- Improved [`FormControl`](https://ariakit.com/reference/form-control) and components built on it, such as [`FormInput`](https://ariakit.com/reference/form-input), [`FormCheckbox`](https://ariakit.com/reference/form-checkbox), and [`FormRadio`](https://ariakit.com/reference/form-radio), to avoid redundant form store subscriptions and item lookups while fields update.
- Fixed [`Form`](https://ariakit.com/reference/form) stealing focus into an invalid field when its items changed after a successful submission with [`resetOnSubmit`](https://ariakit.com/reference/form#resetonsubmit) set to `false`, so [`autoFocusOnSubmit`](https://ariakit.com/reference/form#autofocusonsubmit) again focuses the first invalid field only as a result of a failed submission.
- Fixed [`FormPush`](https://ariakit.com/reference/form-push) to focus the newly added field when pushing into arrays with existing values or arrays that start empty.
- Fixed [`useFormStore`](https://ariakit.com/reference/use-form-store) to ignore `__proto__` and `constructor` path segments in field names, preventing form state objects from being corrupted through prototype replacement.
- Fixed [`Form`](https://ariakit.com/reference/form) to focus the first invalid field in document order when invalid fields mount out of registration order.
- Added `@ariakit/react-components/form/utils` with form array field name helpers.
- Fixed nested [`Hovercard`](https://ariakit.com/reference/hovercard) components so pressing Escape closes the topmost card even when focus is on another element. This also applies to components built on [`Dialog`](https://ariakit.com/reference/dialog).
- Fixed [`Hovercard`](https://ariakit.com/reference/hovercard) so it stays open when hovering content rendered inside an open shadow root. This also applies to components built on it, such as [`Tooltip`](https://ariakit.com/reference/tooltip) and [`Menu`](https://ariakit.com/reference/menu).
- Fixed text field detection for elements rendered inside same-origin iframes. This fixes [`Composite`](https://ariakit.com/reference/composite) keyboard navigation for iframe text fields, including components built on it such as [`Toolbar`](https://ariakit.com/reference/toolbar), and prevents [`Command`](https://ariakit.com/reference/command) and [`Combobox`](https://ariakit.com/reference/combobox) from treating iframe text fields as non-text fields.
- Improved public JSDoc comments for component and store options.
- Reduced extra [`Menu`](https://ariakit.com/reference/menu) renders when menu items re-register without changing the initial focus target.
- Fixed [`MenuItemCheckbox`](https://ariakit.com/reference/menu-item-checkbox) to initialize boolean fields from [`defaultChecked`](https://ariakit.com/reference/menu-item-checkbox#defaultchecked) and controlled [`checked`](https://ariakit.com/reference/menu-item-checkbox#checked) props when the menu store has no default value.
- Fixed menubar and menu bar stores to reflect navigation updates immediately before initialization.
- Fixed a portaled [`Popover`](https://ariakit.com/reference/popover) or [`Dialog`](https://ariakit.com/reference/dialog) not receiving focus when reopened while a non-focusable element (such as a `display: none` file input) comes before the first focusable element in its content. This also fixes [`FormLabel`](https://ariakit.com/reference/form-label) focusing such a hidden element instead of the visible control.
- Fixed [`RadioGroup`](https://ariakit.com/reference/radio-group) so tabbing back into a group focuses the checked [`Radio`](https://ariakit.com/reference/radio) after another unchecked [`Radio`](https://ariakit.com/reference/radio) has received focus.
- Fixed React package sourcemaps so generated mappings account for the `"use client"` directive.
- Fixed [`SelectPopover`](https://ariakit.com/reference/select-popover) typeahead to skip disabled offscreen [`SelectItem`](https://ariakit.com/reference/select-item) placeholders.
- Fixed virtualized `CompositeRenderer` and `SelectRenderer` to report correct `aria-setsize` and `aria-posinset` values when grouped items are followed by standalone items.
- Fixed `TagInput` so IME composition text is not split into tags before the user commits the composed value.
- Fixed `TagInput` string delimiters with regex metacharacters so they're matched literally and don't freeze, throw, or fail to split tags.
- Fixed `TagListLabel` types so unsupported composite and focusable options are no longer accepted.
- Fixed standalone `TagRemove` buttons so they are no longer hidden from assistive technologies. The built-in remove icon is now limited to tag chips, so standalone usage should provide its own visible content or rendered icon.
- Fixed [`ToolbarContainer`](https://ariakit.com/reference/toolbar-container) so pressing <kbd>Backspace</kbd> or <kbd>Delete</kbd> on a focused container with an empty text field no longer steals focus from the field on the next typed character.
- Updated dependencies: `@ariakit/react-utils@0.2.0`, `@ariakit/utils@0.1.4`, `@ariakit/components@0.1.4`, `@ariakit/store@0.1.4`, `@ariakit/react-store@0.1.4`

## 0.2.0

### Removed `isValidElement` from `dialog/utils/walk-tree-outside`

**BREAKING** if you import `isValidElement` from `@ariakit/react-components/dialog/utils/walk-tree-outside`.

The helper was intended for internal dialog tree walking and has been removed from the public subpath exports to avoid confusion with React's `isValidElement`.

Before:

```ts
import { isValidElement } from "@ariakit/react-components/dialog/utils/walk-tree-outside";
```

After:

```ts
// No public replacement import is available.
```

### Improved `Dialog` performance

Opening a modal [`Dialog`](https://ariakit.com/reference/dialog) now marks and disables the elements outside the dialog in a single tree walk instead of two, tracks the dialog state with fewer store subscriptions, and finds the initial focus target without checking every tabbable element inside the dialog.

The scroll lock, the backdrop z-index synchronization, and the root-dialog bookkeeping also moved from passive effects to the layout phase, removing several forced style recalculations and layouts from the open path and applying the scroll lock before the dialog is first painted.

This also benefits components built on top of [`Dialog`](https://ariakit.com/reference/dialog), such as [`Popover`](https://ariakit.com/reference/popover), [`Menu`](https://ariakit.com/reference/menu), and [`SelectPopover`](https://ariakit.com/reference/select-popover).

### Fixed cross-oriented nested group sizing in virtualized renderers

`CollectionRenderer`, `CompositeRenderer`, and `SelectRenderer` reserved the wrong amount of space for a nested group whose `orientation` runs perpendicular to the parent — for example, a horizontal group inside a vertical list.

The group's children were summed along their own axis (their widths) and that sum was reserved as the group's height, leaving a large empty gap after the group and inflating the scroll size. The group is now measured along the parent's axis, from the rendered element or the largest child extent, instead of being summed from the children's cross-axis extents.

### Fixed `DisclosureContent` over-waiting to unmount with mixed transitions and animations

[`DisclosureContent`](https://ariakit.com/reference/disclosure-content) (and components built on top of it, such as [`Dialog`](https://ariakit.com/reference/dialog) and [`Popover`](https://ariakit.com/reference/popover)) could keep [`unmountOnHide`](https://ariakit.com/reference/disclosure-content#unmountonhide) content mounted longer than necessary when a transition and an animation were both applied and the longest delay and longest duration belonged to different properties.

The unmount timeout is now the longest per-property end time (`delay + duration`) across the transitions and animations, instead of the longest delay added to the longest duration, which could overestimate the real end time and keep [`unmountOnHide`](https://ariakit.com/reference/disclosure-content#unmountonhide) content mounted longer than necessary. A leftover `duration` or `delay` with no matching transition or animation (such as an `animation-duration` while `animation-name` is `none`) is also ignored now.

### Offscreen item placeholders omit internal props

Fixed offscreen [`SelectItem`](https://ariakit.com/reference/select-item) and [`ComboboxItem`](https://ariakit.com/reference/combobox-item) elements to avoid passing item and focus props to inactive placeholder DOM nodes.

Inactive offscreen placeholders rely on `aria-disabled`. Custom render elements own any native `disabled` state they need.

### Other updates

- Improved virtual collection rendering performance.
- Added an associated panel lookup to [`useTabStore`](https://ariakit.com/reference/use-tab-store), improving [`Tab`](https://ariakit.com/reference/tab) performance when resolving controlled panels.
- Improved [`TooltipAnchor`](https://ariakit.com/reference/tooltip-anchor) to avoid re-rendering default description tooltip anchors when the tooltip content id changes.
- Updated [`VisuallyHidden`](https://ariakit.com/reference/visually-hidden) to hide content with the modern `clip-path: inset(50%)` technique instead of the deprecated `clip` property. The same technique now applies to the other elements Ariakit hides visually, such as the [`Select`](https://ariakit.com/reference/select) value mirror and the [`Dialog`](https://ariakit.com/reference/dialog) dismiss button.
- Fixed [`CheckboxCheck`](https://ariakit.com/reference/checkbox-check) to avoid passing invalid function children to React while unchecked.
- Fixed virtualized `CompositeRenderer` and `SelectRenderer` (and the underlying `CollectionRenderer`) leaking a `ResizeObserver` and detached item nodes when `itemSize` is not set. Items that stop being rendered are now unobserved, and the observer is disconnected when the renderer unmounts.
- Fixed the [`ComboboxGroup`](https://ariakit.com/reference/combobox-group) development error message to name the correct component.
- Improved [`ComboboxItemValue`](https://ariakit.com/reference/combobox-item-value) rendering performance.
- Fixed [`Command`](https://ariakit.com/reference/command) and the components that build on it, such as [`Button`](https://ariakit.com/reference/button), staying stuck in the active (`data-active`) state when the Space key is released while the Meta key is held, or after the element becomes disabled between keydown and keyup.
- Fixed `CompositeRenderer` to keep the active item's generated ancestor rendered in virtualized composite widgets.
- Fixed [`CompositeTypeahead`](https://ariakit.com/reference/composite-typeahead) so typeahead text from one composite no longer affects another composite rendered on the same page.
- Fixed [`Dialog`](https://ariakit.com/reference/dialog) cleanup so stale nested dialog effects no longer restore page accessibility state while a newer effect is active.
- Fixed [`Dialog`](https://ariakit.com/reference/dialog) to reset outside-interaction focus tracking when reused dialogs reopen.
- Fixed [`FormPush`](https://ariakit.com/reference/form-push) and [`FormRemove`](https://ariakit.com/reference/form-remove) incorrectly matching sibling array fields whose names share a prefix (for example `tags` and `tags2`) and throwing when a field name contained regular expression special characters.
- Fixed [`useFormStore`](https://ariakit.com/reference/use-form-store) nested value updates so path segments like `-1`, `Infinity`, and `NaN` are treated as object keys instead of array indexes.
- Improved [`Hovercard`](https://ariakit.com/reference/hovercard) so nested hovercards no longer reinstall document mousemove listeners when they mount or unmount.
- Fixed [`MenuItemRadio`](https://ariakit.com/reference/menu-item-radio) to avoid forwarding the `defaultChecked` prop to rendered elements.
- Fixed [`Popover`](https://ariakit.com/reference/popover) to ignore stale async positioning updates after a newer positioning effect has started.
- Fixed merged refs in React components and [`Portal`](https://ariakit.com/reference/portal) to preserve React 19 callback ref cleanup functions while still detaching refs that don't return a cleanup.
- Fixed `SelectRenderer` and `CompositeRenderer` to apply explicit `orientation` props to the rendered item layout.
- Updated dependencies: `@ariakit/utils@0.1.3`, `@ariakit/components@0.1.3`, `@ariakit/react-utils@0.1.3`, `@ariakit/store@0.1.3`, `@ariakit/react-store@0.1.3`

## 0.1.2

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

### Updated `PopoverArrow` to use computed colors directly

[`PopoverArrow`](https://ariakit.com/reference/popover-arrow) and its siblings ([`MenuArrow`](https://ariakit.com/reference/menu-arrow), [`TooltipArrow`](https://ariakit.com/reference/tooltip-arrow), [`HovercardArrow`](https://ariakit.com/reference/hovercard-arrow)) now set `fill` and `stroke` directly from the popover content's computed `background-color` and `border-color`, removing the previous `var(--ak-layer, …)` and `var(--ak-edge, …)` wrappers. Style the arrow with CSS if you need custom theming.

### Other updates

- Fixed [`Button`](https://ariakit.com/reference/button) to preserve React form pending state when submitted with the keyboard.
- Fixed the offscreen [`CollectionItem`](https://ariakit.com/reference/collection-item) invariant message for missing `offscreenRoot` props.
- Fixed [`Dialog`](https://ariakit.com/reference/dialog) to preserve closing animations when using [`unmountOnHide`](https://ariakit.com/reference/dialog#unmountonhide) with the controlled [`open`](https://ariakit.com/reference/dialog#open) and [`onClose`](https://ariakit.com/reference/dialog#onclose) props and no explicit store.
- Documented that [`removeValue`](https://ariakit.com/reference/use-form-store#removevalue) preserves array length by replacing removed items with `null`.
- Fixed runtime `process.env.NODE_ENV` checks in published package output, including test-only behavior and development warnings.
- Fixed rendering many [`Menu`](https://ariakit.com/reference/menu) components on the same page potentially causing a "Maximum update depth exceeded" error. [`MenuItem`](https://ariakit.com/reference/menu-item) elements now register only while the menu is visible, instead of registering on mount even while it's hidden.
- Fixed [`Tab`](https://ariakit.com/reference/tab) to move focus to the selected tab after a controlled [`selectedId`](https://ariakit.com/reference/tab-provider#selectedid) update while a tab has DOM focus.
- Fixed [`TooltipProvider`](https://ariakit.com/reference/tooltip-provider) to avoid a re-entrant loop when multiple tooltips are forced open at the same time.
- Updated dependencies: `@ariakit/store@0.1.2`, `@ariakit/utils@0.1.2`, `@ariakit/components@0.1.2`, `@ariakit/react-store@0.1.2`, `@ariakit/react-utils@0.1.2`

## 0.1.1

- Release artifacts now include npm trusted publishing provenance.
- Updated dependencies: `@ariakit/utils@0.1.1`, `@ariakit/store@0.1.1`, `@ariakit/components@0.1.1`, `@ariakit/react-utils@0.1.1`, `@ariakit/react-store@0.1.1`

## 0.1.0

### Added component packages

The internal component packages are now available under these names:

- `@ariakit/components`
- `@ariakit/react-components`
- `@ariakit/solid-components`

### Other updates

- Fixed [`Menu`](https://ariakit.com/reference/menu) to respect the [`autoFocusOnShow`](https://ariakit.com/reference/menu#autofocusonshow) prop when set to `false` or when a callback returns `false`, while still allowing arrow keys to move focus into an already-open menu.
- Updated dependencies: `@ariakit/components@0.1.0`, `@ariakit/utils@0.1.0`, `@ariakit/store@0.1.0`, `@ariakit/react-utils@0.1.0`, `@ariakit/react-store@0.1.0`

## 0.0.0

Initial release.
