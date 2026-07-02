---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`TabPanel`](https://ariakit.com/reference/tab-panel) not updating its own `tabindex` when a single panel is reused with a dynamic [`tabId`](https://ariakit.com/reference/tab-panel#tabid) pointing to the selected tab. The tabbable-children check now re-runs when the [`tabId`](https://ariakit.com/reference/tab-panel#tabid) changes, so the panel joins the tab sequence when the newly selected tab's content has no tabbable elements and leaves it when the content has one.
