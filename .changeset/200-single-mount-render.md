---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fewer renders on mount for focusable elements

[`Focusable`](https://ariakit.com/reference/focusable) detected the rendered element's tag after mounting and stored the raw tag name in state, which always changed from its initial value and forced an extra render for every focusable element — and therefore for every component built on it, such as [`Button`](https://ariakit.com/reference/button), [`CompositeItem`](https://ariakit.com/reference/composite-item), and [`Tab`](https://ariakit.com/reference/tab).

It now tracks only the tag traits that affect its output — whether the element is natively tabbable and whether it supports the `disabled` attribute — seeded from each component's default tag name. The post-mount state update bails out whenever the rendered element matches the component's default tag, skipping the extra render. This covers native tags like `button` and `input` as well as `div`-based components such as [`MenuItem`](https://ariakit.com/reference/menu-item), [`ComboboxItem`](https://ariakit.com/reference/combobox-item), [`Composite`](https://ariakit.com/reference/composite), and [`Dialog`](https://ariakit.com/reference/dialog).

Components that render their default tag also get their settled attributes straight on the first render and in server-rendered HTML — for example, the `disabled` attribute is no longer briefly applied to elements that don't support it. Rendering a different element through the [`render`](https://ariakit.com/reference/focusable#render) prop still works: the tag is detected after mounting and the props are corrected accordingly, so the one-time detection render now applies to custom tags rather than to the component's default tag.
