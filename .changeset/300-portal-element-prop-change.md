---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Custom portal containers kept in place

When [`portalElement`](https://ariakit.com/reference/portal#portalelement) changes from an element to `null`, [`Portal`](https://ariakit.com/reference/portal) now leaves that element in its original location. Only the portal content moves to the default container in `document.body`. Before, the custom element also moved to `document.body`.

For example, undocking these notes now leaves the dock in place:

```tsx
const [docked, setDocked] = useState(true);
const [dock, setDock] = useState<HTMLDivElement | null>(null);

<section>
  <button onClick={() => setDocked(false)}>Undock notes</button>
  <div ref={setDock} />
  <Portal portalElement={docked ? dock : null}>
    <p>Notes</p>
  </Portal>
</section>;
```

This applies to all components built on [`Portal`](https://ariakit.com/reference/portal), including [`Dialog`](https://ariakit.com/reference/dialog), [`Popover`](https://ariakit.com/reference/popover), [`Hovercard`](https://ariakit.com/reference/hovercard), [`Menu`](https://ariakit.com/reference/menu), [`Tooltip`](https://ariakit.com/reference/tooltip), [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover), and [`SelectPopover`](https://ariakit.com/reference/select-popover).
