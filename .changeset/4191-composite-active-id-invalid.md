---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Accessible composite widgets with invalid `activeId`

We've improved the logic for composite widgets such as [Tabs](https://ariakit.org/components/tab) and [Toolbar](https://ariakit.org/components/toolbar) when the [`activeId`](https://ariakit.org/reference/composite-provider#activeid) state points to an element that is disabled or missing from the DOM. This can happen if an item is dynamically removed, disabled, or lazily rendered, potentially making the composite widget inaccessible to keyboard users.

Now, when the [`activeId`](https://ariakit.org/reference/composite-provider#activeid) state is invalid, all composite items will remain tabbable, enabling users to <kbd>Tab</kbd> into the composite widget. Once a composite item receives focus or the element referenced by the [`activeId`](https://ariakit.org/reference/composite-provider#activeid) state becomes available, the roving tabindex behavior is restored.
