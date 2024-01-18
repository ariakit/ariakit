---
"@ariakit/core": minor
"@ariakit/react-core": minor
"@ariakit/react": minor
---

Improved animation support

This version enhances support for CSS animations and transitions on Ariakit components that use [Disclosure](https://ariakit.org/component/disclosure). This includes [Dialog](https://ariakit.org/components/dialog), [Popover](https://ariakit.org/components/popover), [Combobox](https://ariakit.org/components/combobox), [Select](https://ariakit.org/components/select), [Hovercard](https://ariakit.org/components/hovercard), [Menu](https://ariakit.org/components/menu), and [Tooltip](https://ariakit.org/components/tooltip).

These components now support _enter_ and _leave_ transitions and animations right out of the box, eliminating the need to provide an explicit `animated` prop. If an enter animation is detected, the component will automatically wait for a leave animation to complete before unmounting or hiding itself.

Use the [`[data-enter]`](https://ariakit.org/guide/styling#data-enter) selector for CSS transitions. For CSS animations, use the newly introduced [`[data-open]`](https://ariakit.org/guide/styling#data-open) selector. The [`[data-leave]`](https://ariakit.org/guide/styling#data-leave) selector can be used for both transitions and animations.
