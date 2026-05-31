# @ariakit/react-components

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
