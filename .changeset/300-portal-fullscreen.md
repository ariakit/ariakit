---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

`Portal` with fullscreen elements

A nested [`Portal`](https://ariakit.com/reference/portal) now renders inside the fullscreen element when that element is inside its parent portal, such as a [`Popover`](https://ariakit.com/reference/popover) with [`portal`](https://ariakit.com/reference/popover#portal) inside a fullscreen video player in a modal [`Dialog`](https://ariakit.com/reference/dialog). Before, the nested portal rendered outside the fullscreen element, so its content was not visible.

[`Portal`](https://ariakit.com/reference/portal) now also renders inside the fullscreen element when that element is inside an open shadow root, such as a video player in a web component that renders a React app. Before, the portal element moved into the shadow host, which doesn't render it without a `<slot>`, so its content was not visible.

[`Portal`](https://ariakit.com/reference/portal) no longer moves its portal element into an `<iframe>` element when the iframe is the fullscreen element, such as while a video inside the iframe is in fullscreen. Before, the move reset the scroll position of an open popup.

[`Portal`](https://ariakit.com/reference/portal) no longer moves its portal element from `document.body` to the `<html>` element when the page itself enters fullscreen, such as with `document.documentElement.requestFullscreen()`.

[`Portal`](https://ariakit.com/reference/portal) no longer throws a `HierarchyRequestError` when an element inside it enters fullscreen.

These changes apply to all components built on [`Portal`](https://ariakit.com/reference/portal), including [`Dialog`](https://ariakit.com/reference/dialog), [`Popover`](https://ariakit.com/reference/popover), [`Hovercard`](https://ariakit.com/reference/hovercard), [`Menu`](https://ariakit.com/reference/menu), [`Tooltip`](https://ariakit.com/reference/tooltip), [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover), and [`SelectPopover`](https://ariakit.com/reference/select-popover).
