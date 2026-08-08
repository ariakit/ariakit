# @ariakit/components

## 0.1.10

### Composite element state

Composite stores now expose the [`compositeElement`](https://ariakit.com/reference/use-composite-store) state and [`setCompositeElement`](https://ariakit.com/reference/use-composite-store#setcompositeelement) method. The new [`compositeElementInFocusOrder`](https://ariakit.com/reference/composite-provider#compositeelementinfocusorder) option controls whether arrow key navigation can move focus to the composite element:

```tsx
<CompositeProvider compositeElementInFocusOrder>
  <Composite>
    <CompositeItem>Item 1</CompositeItem>
    <CompositeItem>Item 2</CompositeItem>
  </Composite>
</CompositeProvider>
```

These APIs are also available on stores for [`Combobox`](https://ariakit.com/reference/combobox), [`Menu`](https://ariakit.com/reference/menu), [`Menubar`](https://ariakit.com/reference/menubar), [`Radio`](https://ariakit.com/reference/radio), [`Select`](https://ariakit.com/reference/select), [`Tab`](https://ariakit.com/reference/tab), and [`Toolbar`](https://ariakit.com/reference/toolbar) widgets.

### Other updates

- Fixed composite widgets scrolling the page while their popup was still being positioned, which affects [`Combobox`](https://ariakit.com/reference/combobox), [`Select`](https://ariakit.com/reference/select) and [`Menu`](https://ariakit.com/reference/menu). The page still moves when that is the only way to bring the item into view, such as a popup taller than the viewport.
- Updated dependencies: `@ariakit/utils@0.1.6`, `@ariakit/store@0.1.8`

## 0.1.9

### New Combobox Select components

Added [`ComboboxSelect`](https://ariakit.com/reference/combobox-select), [`ComboboxSelectLabel`](https://ariakit.com/reference/combobox-select-label), [`ComboboxSelectArrow`](https://ariakit.com/reference/combobox-select-arrow), [`ComboboxInput`](https://ariakit.com/reference/combobox-input), [`ComboboxSelectedValue`](https://ariakit.com/reference/combobox-selected-value), [`ComboboxItemSelected`](https://ariakit.com/reference/combobox-item-selected), [`ComboboxDismiss`](https://ariakit.com/reference/combobox-dismiss), and [`ComboboxHeading`](https://ariakit.com/reference/combobox-heading). Together, these APIs let standard and filterable selects use one Combobox store:

```tsx
<ComboboxProvider>
  <ComboboxSelectLabel>Favorite fruit</ComboboxSelectLabel>
  <ComboboxSelect />
  <ComboboxPopover>
    <ComboboxLabel>Search fruits</ComboboxLabel>
    <ComboboxInput />
    <ComboboxList>
      <ComboboxItem value="Apple" />
      <ComboboxItem value="Banana" />
    </ComboboxList>
  </ComboboxPopover>
</ComboboxProvider>
```

For filterable selects, the Combobox store now distinguishes the text in the input from its [`selectedValue`](https://ariakit.com/reference/combobox-provider#selectedvalue) state. Use [`inputValue`](https://ariakit.com/reference/combobox-provider#inputvalue), [`defaultInputValue`](https://ariakit.com/reference/combobox-provider#defaultinputvalue), and [`setInputValue`](https://ariakit.com/reference/combobox-provider#setinputvalue) to control this text, [`resetInputValue`](https://ariakit.com/reference/use-combobox-store#resetinputvalue) to restore its initial value, and [`ComboboxInputValue`](https://ariakit.com/reference/combobox-input-value) to read it from the component tree.

The Combobox store also gained the [`selectOnMove`](https://ariakit.com/reference/combobox-provider#selectonmove) option, which selects the active item while moving through the list with the popover open. It now exposes the `inputElement`, `labelElement`, `selectElement`, and `selectLabelElement` state, along with their respective setters.

To make keyboard selection previews easy to cancel, [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover) now supports a [`resetOnEscape`](https://ariakit.com/reference/combobox-popover#resetonescape) prop. It defaults to [`selectOnMove`](https://ariakit.com/reference/combobox-provider#selectonmove) and restores the selected value captured before the first item movement when the popover accepts Escape and its cancelable close event isn't prevented. Selection changes made before any item movement become part of the value Escape restores.

Filterable selects built with these APIs are also more efficient. In a 243-option benchmark, restoring the full list after clearing the filter with one Combobox store reduced scripting time by 50% and total time by 43% compared with separate Select and Combobox stores.

Thanks to [@lessp](https://github.com/lessp) for reporting the performance issue, [@patrikholcak](https://github.com/patrikholcak) for investigating it, and [@georgekaran](https://github.com/georgekaran) for providing the workaround and investigating the shared Combobox and Select behavior.

### Other updates

- Fixed [`PopoverDisclosure`](https://ariakit.com/reference/popover-disclosure) so it no longer overrides a separate [`PopoverAnchor`](https://ariakit.com/reference/popover-anchor) as the popover positioning anchor. Thanks to [@bengry](https://github.com/bengry).

## 0.1.8

### Custom typeahead text for composite items

The new [`typeaheadText`](https://ariakit.com/reference/composite-item#typeaheadtext) prop lets [`CompositeItem`](https://ariakit.com/reference/composite-item) use an explicit label for typeahead matching when its rendered content starts with an emoji or other decoration.

```tsx
<SelectItem typeaheadText="Canada" value="Canada">
  <span aria-hidden>🇨🇦</span> Canada
</SelectItem>
```

Set [`typeaheadText`](https://ariakit.com/reference/composite-item#typeaheadtext) to an empty string to exclude an item from typeahead matching. The prop is also available on these components exported by `@ariakit/react` and built on [`CompositeItem`](https://ariakit.com/reference/composite-item): [`ComboboxItem`](https://ariakit.com/reference/combobox-item), [`FormRadio`](https://ariakit.com/reference/form-radio), [`MenuItem`](https://ariakit.com/reference/menu-item), [`MenuItemCheckbox`](https://ariakit.com/reference/menu-item-checkbox), [`MenuItemRadio`](https://ariakit.com/reference/menu-item-radio), [`Radio`](https://ariakit.com/reference/radio), [`SelectItem`](https://ariakit.com/reference/select-item), [`Tab`](https://ariakit.com/reference/tab), [`ToolbarContainer`](https://ariakit.com/reference/toolbar-container), [`ToolbarInput`](https://ariakit.com/reference/toolbar-input), and [`ToolbarItem`](https://ariakit.com/reference/toolbar-item).

Thanks to [@Dremora](https://github.com/Dremora) for reporting the issue and providing the reproduction, and [@georgekaran](https://github.com/georgekaran) for the investigation and implementation work that informed this solution.

### Other updates

- Fixed collection store [`item`](https://ariakit.com/reference/use-collection-store#item) lookups to resolve controlled items added after store creation when no live item is registered. This allows [`Select`](https://ariakit.com/reference/select) typeahead to update its value while options are unmounted. Thanks to [@georgekaran](https://github.com/georgekaran).
- Updated dependencies: `@ariakit/utils@0.1.5`, `@ariakit/store@0.1.7`

## 0.1.7

- Fixed published packages omitting their build output. Thanks to [@shahednasser](https://github.com/shahednasser).
- Updated dependencies: `@ariakit/store@0.1.6`

## 0.1.6

- Improved store performance across targeted benchmarks, reaching up to 49× the previous throughput.
- Updated dependencies: `@ariakit/store@0.1.5`

## 0.1.5

- Improved the performance of the composite store's [`next`](https://ariakit.com/reference/use-composite-store#next), [`previous`](https://ariakit.com/reference/use-composite-store#previous), [`up`](https://ariakit.com/reference/use-composite-store#up), and [`down`](https://ariakit.com/reference/use-composite-store#down) functions, which now scan the rendered items without copying arrays in the most common cases.
- Fixed [`Tab`](https://ariakit.com/reference/tab) not becoming the active item on the first [`setSelectedId`](https://ariakit.com/reference/use-tab-store#setselectedid-1) call after a [`SelectPopover`](https://ariakit.com/reference/select-popover) or [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover) containing the tabs opens or toggles.

## 0.1.4

This version improves form store behavior by making generated field name paths more resilient to symbol probes and keeping form submission and validation from stalling in background tabs.

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

- Fixed [`useFormStore`](https://ariakit.com/reference/use-form-store) to ignore `__proto__` and `constructor` path segments in field names, preventing form state objects from being corrupted through prototype replacement.
- Improved public JSDoc comments for component and store options.
- Fixed menubar and menu bar stores to reflect navigation updates immediately before initialization.
- Updated dependencies: `@ariakit/utils@0.1.4`, `@ariakit/store@0.1.4`

## 0.1.3

- Added an associated panel lookup to [`useTabStore`](https://ariakit.com/reference/use-tab-store), improving [`Tab`](https://ariakit.com/reference/tab) performance when resolving controlled panels.
- Fixed [`useFormStore`](https://ariakit.com/reference/use-form-store) nested value updates so path segments like `-1`, `Infinity`, and `NaN` are treated as object keys instead of array indexes.
- Updated dependencies: `@ariakit/utils@0.1.3`, `@ariakit/store@0.1.3`

## 0.1.2

- Documented that [`removeValue`](https://ariakit.com/reference/use-form-store#removevalue) preserves array length by replacing removed items with `null`.
- Fixed runtime `process.env.NODE_ENV` checks in published package output, including test-only behavior and development warnings.
- Fixed [`Tab`](https://ariakit.com/reference/tab) to move focus to the selected tab after a controlled [`selectedId`](https://ariakit.com/reference/tab-provider#selectedid) update while a tab has DOM focus.
- Updated dependencies: `@ariakit/store@0.1.2`, `@ariakit/utils@0.1.2`

## 0.1.1

- Release artifacts now include npm trusted publishing provenance.
- Updated dependencies: `@ariakit/utils@0.1.1`, `@ariakit/store@0.1.1`

## 0.1.0

### Added component packages

The internal component packages are now available under these names:

- `@ariakit/components`
- `@ariakit/react-components`
- `@ariakit/solid-components`

### Other updates

- Updated dependencies: `@ariakit/utils@0.1.0`, `@ariakit/store@0.1.0`

## 0.0.0

Initial release.
