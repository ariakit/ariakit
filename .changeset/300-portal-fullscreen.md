---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

`Portal` with fullscreen elements

This update fixes three fullscreen behaviors in [`Portal`](https://ariakit.com/reference/portal):

- **Nested popups stay visible.** If an element inside a parent portal enters fullscreen, nested portals now render inside that fullscreen element. Before, they rendered outside it and were not visible.

- **Page fullscreen keeps portal containers in place.** Calling `document.documentElement.requestFullscreen()` no longer moves default portal containers from `document.body` to `<html>`.

- **Fullscreen inside a portal no longer throws.** An element inside a portal can enter fullscreen without a `HierarchyRequestError`.

For example, click "Enter fullscreen" below, then click "Quality". The [`Popover`](https://ariakit.com/reference/popover) now opens inside the fullscreen player in the modal [`Dialog`](https://ariakit.com/reference/dialog):

```tsx
const playerRef = useRef<HTMLDivElement>(null);

<Dialog open aria-label="Video">
  <div ref={playerRef}>
    <button onClick={() => playerRef.current?.requestFullscreen()}>
      Enter fullscreen
    </button>
    <PopoverProvider>
      <PopoverDisclosure>Quality</PopoverDisclosure>
      <Popover portal aria-label="Quality">
        <button>High</button>
        <button>Low</button>
      </Popover>
    </PopoverProvider>
  </div>
</Dialog>;
```

These changes apply to all components built on [`Portal`](https://ariakit.com/reference/portal), including [`Dialog`](https://ariakit.com/reference/dialog), [`Popover`](https://ariakit.com/reference/popover), [`Hovercard`](https://ariakit.com/reference/hovercard), [`Menu`](https://ariakit.com/reference/menu), [`Tooltip`](https://ariakit.com/reference/tooltip), [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover), and [`SelectPopover`](https://ariakit.com/reference/select-popover).
