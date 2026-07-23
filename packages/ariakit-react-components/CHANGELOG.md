# @ariakit/react-components

## 0.3.4

This version adds explicit scroll element control for collection renderers, custom typeahead labels for composite items, and selected-state rendering for select items. It also improves disabled radio groups, hidden popover performance, nested <kbd>Esc</kbd> handling, dialogs across portals and shadow roots, multi-select combobox form values, typeahead with unmounted options, and composite virtual focus.

### Custom typeahead text for composite items

The new [`typeaheadText`](https://ariakit.com/reference/composite-item#typeaheadtext) prop lets [`CompositeItem`](https://ariakit.com/reference/composite-item) use an explicit label for typeahead matching when its rendered content starts with an emoji or other decoration.

```tsx
<SelectItem typeaheadText="Canada" value="Canada">
  <span aria-hidden>🇨🇦</span> Canada
</SelectItem>
```

Set [`typeaheadText`](https://ariakit.com/reference/composite-item#typeaheadtext) to an empty string to exclude an item from typeahead matching. The prop is also available on these components exported by `@ariakit/react` and built on [`CompositeItem`](https://ariakit.com/reference/composite-item): [`ComboboxItem`](https://ariakit.com/reference/combobox-item), [`FormRadio`](https://ariakit.com/reference/form-radio), [`MenuItem`](https://ariakit.com/reference/menu-item), [`MenuItemCheckbox`](https://ariakit.com/reference/menu-item-checkbox), [`MenuItemRadio`](https://ariakit.com/reference/menu-item-radio), [`Radio`](https://ariakit.com/reference/radio), [`SelectItem`](https://ariakit.com/reference/select-item), [`Tab`](https://ariakit.com/reference/tab), [`ToolbarContainer`](https://ariakit.com/reference/toolbar-container), [`ToolbarInput`](https://ariakit.com/reference/toolbar-input), and [`ToolbarItem`](https://ariakit.com/reference/toolbar-item).

Thanks to [@Dremora](https://github.com/Dremora) for reporting the issue and providing the reproduction, and [@georgekaran](https://github.com/georgekaran) for the investigation and implementation work that informed this solution.

### Skip position updates on hidden popovers

Popovers that stay mounted while closed, such as [`Popover`](https://ariakit.com/reference/popover), [`Tooltip`](https://ariakit.com/reference/tooltip), [`Hovercard`](https://ariakit.com/reference/hovercard), [`Menu`](https://ariakit.com/reference/menu), [`SelectPopover`](https://ariakit.com/reference/select-popover), and [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover), no longer set up position auto-updates while hidden, unless a custom [`updatePosition`](https://ariakit.com/reference/popover#updateposition) callback is provided. Closed popovers no longer keep standing scroll and resize listeners and observers around, and hiding a popover skips a full positioning setup and teardown cycle. This reduces aggregate CPU and rendering work when rapidly showing and hiding popovers, such as when quickly moving across toolbar items with tooltips.

Thanks to [@aledecicco](https://github.com/aledecicco) for reporting the issue.

### `RadioGroup` disables descendant radios

The [`RadioGroup`](https://ariakit.com/reference/radio-group) `disabled` prop now marks the group as disabled and disables descendant [`Radio`](https://ariakit.com/reference/radio) components, including radios rendered as custom elements.

```tsx
<RadioGroup disabled>
  <Radio value="Apple" />
  <Radio value="Orange" />
</RadioGroup>
```

Thanks to [@kripod](https://github.com/kripod) for reporting the issue.

### New `SelectItemSelected` component

The new [`SelectItemSelected`](https://ariakit.com/reference/select-item-selected) value component exposes whether the closest [`SelectItem`](https://ariakit.com/reference/select-item) is selected through a required function child.

```tsx
<SelectItem value="Apple">
  <SelectItemSelected>
    {(selected) => (selected ? <CheckIcon /> : null)}
  </SelectItemSelected>
  Apple
</SelectItem>
```

Thanks to [@jonrimmer](https://github.com/jonrimmer) for proposing the feature, and [@georgekaran](https://github.com/georgekaran) for the investigation and implementation work that informed this solution.

### Explicit scroll elements for collection renderers

Collection renderers, including `CompositeRenderer` and `SelectRenderer`, now accept a `scrollElement` prop. It accepts an element, a React ref, a resolver function, or `null` to disable viewport-driven rendering.

Use this prop when the scrolling ancestor cannot be detected automatically, such as when an `overflow: auto` element does not overflow until asynchronous items are loaded:

```tsx
const scrollElementRef = useRef<HTMLDivElement>(null);

<div ref={scrollElementRef} className="scroller">
  <SelectRenderer scrollElement={scrollElementRef} items={items}>
    {(item) => <SelectItem key={item.id} {...item} />}
  </SelectRenderer>
</div>;
```

Nested renderers using the same store inherit an explicitly provided scroll element unless they provide their own. If neither a renderer nor a same-store ancestor provides a value, the renderer detects its closest scrolling ancestor.

Thanks to [@ItaiYosephi](https://github.com/ItaiYosephi) for reporting the issue, providing the video and StackBlitz reproduction, and proposing an explicit scroller prop.

### Handling <kbd>Esc</kbd> in nested widgets

The [`Dialog`](https://ariakit.com/reference/dialog) component and components that inherit its default <kbd>Esc</kbd> handling, including [`Popover`](https://ariakit.com/reference/popover), [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover), and [`SelectPopover`](https://ariakit.com/reference/select-popover), now let descendants call `event.stopPropagation()` on <kbd>Esc</kbd> without hiding the enclosing component. This allows a nested widget to dismiss itself first.

```tsx
<Dialog>
  <input
    onKeyDown={(event) => {
      if (event.key !== "Escape") return;
      if (!suggestionsOpen) return;
      event.stopPropagation();
      closeSuggestions();
    }}
  />
</Dialog>
```

When the component handles an <kbd>Esc</kbd> event from its React subtree, it also stops the event at its boundary. This keeps an enclosing third-party React dialog with a bubble handler open while the Ariakit component closes.

When it handles <kbd>Esc</kbd> through the document fallback, such as when focus is on its disclosure, it stops the event at `document` before it reaches `window` bubble listeners.

An ancestor capture handler that stops <kbd>Esc</kbd> before it reaches the component owns the event. If [`hideOnEscape`](https://ariakit.com/reference/dialog#hideonescape) runs before such a handler, it can call `event.stopPropagation()` to keep the event from reaching it.

Thanks to [@boaz-wiz](https://github.com/boaz-wiz) for reporting the issue.

### Other updates

- Fixed multi-selectable [`Combobox`](https://ariakit.com/reference/combobox) components to submit selected values to forms when a `name` is provided. Thanks to [@cloud-walker](https://github.com/cloud-walker) and [@georgekaran](https://github.com/georgekaran).
- Fixed [`Composite`](https://ariakit.com/reference/composite) and derived widgets such as [`SelectList`](https://ariakit.com/reference/select-list) to clear stale focus-visible state and warn in development when virtual focus is used with a non-focusable composite element. Thanks to [@ItaiYosephi](https://github.com/ItaiYosephi).
- Fixed [`Dialog`](https://ariakit.com/reference/dialog) and components built on it, such as [`Popover`](https://ariakit.com/reference/popover) and [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover), so interacting with elements returned by [`getPersistentElements`](https://ariakit.com/reference/dialog#getpersistentelements) across open shadow roots no longer closes the component before it receives focus.
- Fixed sibling modal [`Dialog`](https://ariakit.com/reference/dialog) components and modal components built on them, such as [`Popover`](https://ariakit.com/reference/popover) and [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover), rendered in their default portals so opening them in the same render no longer made each other inert. Thanks to [@yishayhaz](https://github.com/yishayhaz) and [@gonzoblasco](https://github.com/gonzoblasco).
- Fixed collection store [`item`](https://ariakit.com/reference/use-collection-store#item) lookups to resolve controlled items added after store creation when no live item is registered. This allows [`Select`](https://ariakit.com/reference/select) typeahead to update its value while options are unmounted. Thanks to [@georgekaran](https://github.com/georgekaran).
- Updated dependencies: `@ariakit/components@0.1.8`, `@ariakit/utils@0.1.5`, `@ariakit/react-store@0.1.8`, `@ariakit/react-utils@0.2.3`, `@ariakit/store@0.1.7`

## 0.3.3

- Fixed published packages omitting their build output. Thanks to [@shahednasser](https://github.com/shahednasser).
- Updated dependencies: `@ariakit/components@0.1.7`, `@ariakit/react-store@0.1.7`, `@ariakit/react-utils@0.2.2`, `@ariakit/store@0.1.6`

## 0.3.2

This version adds React Compiler-compatible form hooks and side-specific popover overflow padding, improves store and component performance, and refines modal scroll locking and native button markup. It also includes fixes for Korean IME focus, controlled `NaN` values, and focus-visible styling.

### Modal scroll locks use `scrollbar-gutter`

The [`Dialog`](https://ariakit.com/reference/dialog) component now locks page scroll in supporting browsers by setting `scrollbar-gutter: stable` and hiding overflow on the `html` element when [`preventBodyScroll`](https://ariakit.com/reference/dialog#preventbodyscroll) is enabled. This applies to [`modal`](https://ariakit.com/reference/dialog#modal) dialogs by default and to components built on [`Dialog`](https://ariakit.com/reference/dialog), including [`Popover`](https://ariakit.com/reference/popover), [`Hovercard`](https://ariakit.com/reference/hovercard), [`Tooltip`](https://ariakit.com/reference/tooltip), [`Menu`](https://ariakit.com/reference/menu), [`SelectPopover`](https://ariakit.com/reference/select-popover), and [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover).

Pages that already set `scrollbar-gutter: stable` or `overflow-y: scroll` on `html` no longer shift when a modal opens, and Ariakit restores inline `html` overflow styles when it closes.

Fixed headers no longer need `--scrollbar-width` in browsers that support `scrollbar-gutter`:

```css
.header {
  position: fixed;
  padding-inline-end: 16px;
}
```

The `--scrollbar-width` CSS variable is now only defined in the fallback path for browsers without `scrollbar-gutter` support. If you still target those browsers, keep a length fallback when using the variable inside `calc()`:

```css
.header {
  padding-inline-end: calc(16px + var(--scrollbar-width, 0px));
}
```

Thanks to [@mirka](https://github.com/mirka) for reporting the issue, and [@benrodrs](https://github.com/benrodrs) for documenting a workaround that informed this solution.

### Added `useFormValue`, `useFormValidate`, and `useFormSubmit`

The new [`useFormValue`](https://ariakit.com/reference/use-form-value), [`useFormValidate`](https://ariakit.com/reference/use-form-validate), and [`useFormSubmit`](https://ariakit.com/reference/use-form-submit) hooks replace the matching [`useFormStore`](https://ariakit.com/reference/use-form-store) methods with top-level hook calls that are compatible with the React Compiler:

```tsx
const value = useFormValue(form, form.names.email);

useFormSubmit(form, async (state) => {
  // ...
});
```

### Keyed object store subscriptions

The `useStoreStateObject` hook now accepts selector dependency keys, so selectors skip unrelated store updates while receiving the complete store state at runtime. The key list must include every store key a selector reads, or its result may stay stale.

```ts
const values = useStoreStateObject(store, ["value"], {
  value: "value",
  valueLength: (state) => state.value.length,
});
```

### Keyed store subscriptions

The [`useStoreState`](https://ariakit.com/reference/use-store-state) hook now accepts selector dependency keys, so selectors skip unrelated store updates while receiving the complete store state at runtime. The key list must include every store key a selector reads, or its result may stay stale.

```ts
const isEmpty = useStoreState(store, ["value"], (state) => !state.value);
```

React components now use keyed selector subscriptions internally.

### Added support for side-specific `overflowPadding`

The [`overflowPadding`](https://ariakit.com/reference/popover#overflowpadding) prop now accepts a number or an object with independent `top`, `right`, `bottom`, and `left` values. This applies to [`Popover`](https://ariakit.com/reference/popover) and components built on it, including [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover), [`SelectPopover`](https://ariakit.com/reference/select-popover), `CompositeOverflow`, [`Hovercard`](https://ariakit.com/reference/hovercard), [`Menu`](https://ariakit.com/reference/menu), and [`Tooltip`](https://ariakit.com/reference/tooltip):

```tsx
<ComboboxPopover overflowPadding={{ top: 24, right: 32, left: 16 }} />
```

When [`overflowPadding`](https://ariakit.com/reference/popover#overflowpadding) is an object, the [`--popover-overflow-padding`](https://ariakit.com/guide/styling#--popover-overflow-padding) CSS variable uses the larger of the horizontal `left` and `right` values, treating omitted sides as `0`.

Thanks to [@mririgoyen](https://github.com/mririgoyen) for reporting the issue, and [@georgekaran](https://github.com/georgekaran) for providing the approach that informed this solution.

### Native button markup includes the final type

Default native [`Button`](https://ariakit.com/reference/button) and [`Command`](https://ariakit.com/reference/command) components now include `type="button"` in their initial markup. Refs and server-rendered markup observe the final type without waiting for post-mount reconciliation, keeping hydration consistent.

This also applies to [`ComboboxCancel`](https://ariakit.com/reference/combobox-cancel), [`ComboboxDisclosure`](https://ariakit.com/reference/combobox-disclosure), [`CompositeItem`](https://ariakit.com/reference/composite-item), `CompositeOverflowDisclosure`, [`DialogDisclosure`](https://ariakit.com/reference/dialog-disclosure), [`DialogDismiss`](https://ariakit.com/reference/dialog-dismiss), [`Disclosure`](https://ariakit.com/reference/disclosure), [`FormPush`](https://ariakit.com/reference/form-push), [`FormRemove`](https://ariakit.com/reference/form-remove), [`HovercardDisclosure`](https://ariakit.com/reference/hovercard-disclosure), [`HovercardDismiss`](https://ariakit.com/reference/hovercard-dismiss), [`MenuButton`](https://ariakit.com/reference/menu-button), [`MenuDismiss`](https://ariakit.com/reference/menu-dismiss), [`PopoverDisclosure`](https://ariakit.com/reference/popover-disclosure), [`PopoverDismiss`](https://ariakit.com/reference/popover-dismiss), [`Select`](https://ariakit.com/reference/select), [`SelectDismiss`](https://ariakit.com/reference/select-dismiss), [`Tab`](https://ariakit.com/reference/tab), and [`ToolbarItem`](https://ariakit.com/reference/toolbar-item) when they render their default native button.

### Other updates

- Improved React component mount performance by 12–21% in browser benchmarks.
- Reduced React store subscription overhead by skipping listeners when setter callbacks are absent and reading four related [`DisclosureContent`](https://ariakit.com/reference/disclosure-content) state values through one subscription, including in [`TabPanel`](https://ariakit.com/reference/tab-panel) and [`Dialog`](https://ariakit.com/reference/dialog) components.
- Improved store performance across targeted benchmarks, reaching up to 49× the previous throughput.
- Deprecated the [`useValue`](https://ariakit.com/reference/use-form-store#usevalue), [`useValidate`](https://ariakit.com/reference/use-form-store#usevalidate), and [`useSubmit`](https://ariakit.com/reference/use-form-store#usesubmit) methods of [`useFormStore`](https://ariakit.com/reference/use-form-store) in favor of the new top-level form hooks.
- Fixed [`Combobox`](https://ariakit.com/reference/combobox) with [`autoSelect`](https://ariakit.com/reference/combobox#autoselect) moving focus between Korean IME composition steps. Thanks to [@flex-kwoncheol](https://github.com/flex-kwoncheol).
- Fixed controlled `NaN` values from unnecessarily firing setter callbacks in React stores, including [`useCheckboxStore`](https://ariakit.com/reference/use-checkbox-store) and [`useRadioStore`](https://ariakit.com/reference/use-radio-store).
- Fixed [`Focusable`](https://ariakit.com/reference/focusable) and components built on it, such as [`Button`](https://ariakit.com/reference/button), to clear focus-visible styling when [`focusable`](https://ariakit.com/reference/focusable#focusable-1) becomes `false`.
- Fixed store subscriptions to respond consistently to updates made with `NaN` keys.
- Updated dependencies: `@ariakit/react-store@0.1.6`, `@ariakit/components@0.1.6`, `@ariakit/store@0.1.5`, `@ariakit/react-utils@0.2.1`

## 0.3.1

### Faster keyboard navigation on composite widgets

Moving through items with arrow keys no longer re-renders the [`Composite`](https://ariakit.com/reference/composite) component itself when using roving tabindex.

This reduces the scripting cost of each keystroke on large collections and benefits everything built on composite widgets, such as [`Menu`](https://ariakit.com/reference/menu), [`Combobox`](https://ariakit.com/reference/combobox), [`Toolbar`](https://ariakit.com/reference/toolbar), and [`Tab`](https://ariakit.com/reference/tab).

### Fixed `Command` stuck pressed state when losing focus mid-press

When rendering a non-native element (such as `render={<div />}`), the [`Command`](https://ariakit.com/reference/command) component — and components built on it, such as [`Button`](https://ariakit.com/reference/button), [`Checkbox`](https://ariakit.com/reference/checkbox), [`CompositeItem`](https://ariakit.com/reference/composite-item), and their derivatives — now clears its pressed state (`data-active`) when the element loses focus while <kbd>Space</kbd> is held, mirroring how native buttons cancel the Space activation when they lose focus before the keyup.

Additionally, a Space keyup bubbling up from a focused child no longer dispatches a synthetic click on the element, and calling `event.preventDefault()` in a custom `onKeyUp` handler no longer leaves the element stuck looking pressed.

### `PopoverArrow` box-shadow ring detection

Fixed [`PopoverArrow`](https://ariakit.com/reference/popover-arrow), including components built on it such as [`TooltipArrow`](https://ariakit.com/reference/tooltip-arrow), [`MenuArrow`](https://ariakit.com/reference/menu-arrow), and [`HovercardArrow`](https://ariakit.com/reference/hovercard-arrow), to draw the popover's box-shadow ring for any positive ring width. Previously, widths whose text contained the digit 0, such as `10px` or `0.5px` from the Tailwind `ring-[10px]` and `ring-[0.5px]` utilities, were not detected, and the arrow rendered with no stroke at all.

The arrow stroke now also matches the ring color instead of the popover's inherited text color, so the arrow blends into the outline. This includes `inset` rings and rings without an explicit color, which default to `currentColor` following CSS.

### Radio `onChange` event on arrow-key selection

Selecting a native [`Radio`](https://ariakit.com/reference/radio) or [`FormRadio`](https://ariakit.com/reference/form-radio) with arrow keys now delivers a real `change` event with `event.target.checked` already set to `true`, matching pointer and Space selection. Previously, the handler received the focus event while `checked` was still `false`, which silently broke handlers gated on `event.target.checked`.

Since arrow-key selection now replays the browser's native activation, `onClick` handlers also fire when a native radio is selected with arrow keys, matching native radio group behavior.

### Other updates

- Improved the performance of the composite store's [`next`](https://ariakit.com/reference/use-composite-store#next), [`previous`](https://ariakit.com/reference/use-composite-store#previous), [`up`](https://ariakit.com/reference/use-composite-store#up), and [`down`](https://ariakit.com/reference/use-composite-store#down) functions, which now scan the rendered items without copying arrays in the most common cases.
- Fixed [`ComboboxItemValue`](https://ariakit.com/reference/combobox-item-value) highlighting the wrong characters for item values whose Unicode normalization changes the string length, such as Hangul, kana with dakuten, and decomposed (NFD) strings. Matching remains diacritic-insensitive, and the `data-user-value` spans now cover exactly the matched characters without detaching combining marks from their base letters.
- Fixed [`CompositeItem`](https://ariakit.com/reference/composite-item) and components built on it, such as [`Tab`](https://ariakit.com/reference/tab) and [`SelectItem`](https://ariakit.com/reference/select-item), crashing the app with a "Maximum update depth exceeded" error when a `NaN` value was passed to the `aria-posinset` or `aria-setsize` props. The `useStoreStateObject` hook now compares snapshot values with `Object.is`, so the fix also covers any direct consumer of that hook.
- Fixed [`CompositeItem`](https://ariakit.com/reference/composite-item) crashing with `Cannot access 'rowId' before initialization` when rendered inside a [`CompositeRow`](https://ariakit.com/reference/composite-row) — or a derived row component such as [`SelectRow`](https://ariakit.com/reference/select-row) or [`ComboboxRow`](https://ariakit.com/reference/combobox-row) — that receives the `aria-posinset` prop.
- Fixed [`CompositeItem`](https://ariakit.com/reference/composite-item) and components based on it, such as [`SelectItem`](https://ariakit.com/reference/select-item) and [`ComboboxItem`](https://ariakit.com/reference/combobox-item), leaving DOM focus stuck on the item with virtual focus enabled when the item received focus before the composite element was available, instead of redirecting focus to the composite element.
- Fixed [`Dialog`](https://ariakit.com/reference/dialog) and components built on it such as [`Popover`](https://ariakit.com/reference/popover) and [`Menu`](https://ariakit.com/reference/menu) hiding on close before the [`backdrop`](https://ariakit.com/reference/dialog#backdrop) element's exit transition ends: the backdrop's fade-out was skipped entirely when only the backdrop was animated, and cut short when its transition was longer than the panel's.
- Fixed [`Dialog`](https://ariakit.com/reference/dialog), including components built on it such as [`Popover`](https://ariakit.com/reference/popover) and [`Menu`](https://ariakit.com/reference/menu), so focusing, clicking, or right-clicking elements returned by [`getPersistentElements`](https://ariakit.com/reference/dialog#getpersistentelements) no longer closes the dialog before it has received focus, such as when it's rendered with [`autoFocusOnShow`](https://ariakit.com/reference/dialog#autofocusonshow) set to `false`.
- Fixed [`PopoverArrow`](https://ariakit.com/reference/popover-arrow) — including arrows built on it such as [`MenuArrow`](https://ariakit.com/reference/menu-arrow) and [`TooltipArrow`](https://ariakit.com/reference/tooltip-arrow) — detaching from the anchor in RTL contexts when the popover flips or otherwise changes placement while open.
- Fixed [`Portal`](https://ariakit.com/reference/portal), including components built on it such as [`Tooltip`](https://ariakit.com/reference/tooltip) and [`Popover`](https://ariakit.com/reference/popover), to avoid leaking duplicate portal containers in React development StrictMode.
- Fixed [`Portal`](https://ariakit.com/reference/portal), including components built on it such as [`Dialog`](https://ariakit.com/reference/dialog) and [`Popover`](https://ariakit.com/reference/popover), destroying and recreating the portal node when the [`portalRef`](https://ariakit.com/reference/portal#portalref) prop changes identity, such as when passing an inline callback. The ref now re-fires against the same portal node, so the portal content is no longer remounted on parent re-renders.
- Fixed the [`focusOnMove`](https://ariakit.com/reference/composite#focusonmove) prop being ignored on [`SelectList`](https://ariakit.com/reference/select-list) and components built on it such as [`SelectPopover`](https://ariakit.com/reference/select-popover).
- Fixed arrow keys on a closed [`Select`](https://ariakit.com/reference/select) freezing the page when multiple [`SelectItem`](https://ariakit.com/reference/select-item) components without a [`value`](https://ariakit.com/reference/select-item#value) prop follow the active item, and moving to an item without a [`value`](https://ariakit.com/reference/select-item#value) when exactly one follows it. Items without a [`value`](https://ariakit.com/reference/select-item#value) are now skipped correctly, including when [`focusLoop`](https://ariakit.com/reference/select-provider#focusloop) wraps around the list.
- Fixed [`TabPanel`](https://ariakit.com/reference/tab-panel) not updating its own `tabindex` when a single panel is reused with a dynamic [`tabId`](https://ariakit.com/reference/tab-panel#tabid) pointing to the selected tab. The tabbable-children check now re-runs when the [`tabId`](https://ariakit.com/reference/tab-panel#tabid) changes, so the panel joins the tab sequence when the newly selected tab's content has no tabbable elements and leaves it when the content has one.
- Fixed [`Tab`](https://ariakit.com/reference/tab) not becoming the active item on the first [`setSelectedId`](https://ariakit.com/reference/use-tab-store#setselectedid-1) call after a [`SelectPopover`](https://ariakit.com/reference/select-popover) or [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover) containing the tabs opens or toggles.
- Fixed [`ToolbarContainer`](https://ariakit.com/reference/toolbar-container) so composing Enter keydowns in nested text fields don't cancel IME commits or move focus back to the container.
- Updated dependencies: `@ariakit/components@0.1.5`, `@ariakit/react-store@0.1.5`

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
