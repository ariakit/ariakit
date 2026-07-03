---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fewer renders on mount for focusable elements

[`Focusable`](https://ariakit.com/reference/focusable) detected the rendered element's tag through a post-mount state update that always changed from its initial value, forcing an extra render on mount for every focusable element and every component built on it, such as [`Button`](https://ariakit.com/reference/button), [`CompositeItem`](https://ariakit.com/reference/composite-item), and [`Tab`](https://ariakit.com/reference/tab).

It now tracks only the tag traits that affect its output, seeded from the component's default tag name. The post-mount update bails out whenever the rendered element matches the component's default tag, skipping the extra render for native tags like `button` and `input` as well as `div`-based components such as [`MenuItem`](https://ariakit.com/reference/menu-item), [`ComboboxItem`](https://ariakit.com/reference/combobox-item), and [`Composite`](https://ariakit.com/reference/composite). These components also get their settled attributes straight on the first render and in server-rendered HTML, while custom elements passed through the [`render`](https://ariakit.com/reference/focusable#render) prop are still detected and corrected after mounting.
