---
"@ariakit/tailwind": patch
---

Layer appearance variants for `ak-outset` elements

The new `ak-outset-*` variants, such as `ak-outset-dark` and `ak-outset-light-high`, match the layer around the parent layer on an element with `ak-outset`. This is the surface behind the element, such as the page under a bar below a selected tab. The regular variants, such as `ak-dark`, keep matching the parent layer, which can have the opposite appearance. An example is a tab that high contrast mode fills with a dark color on a light page.

```html
<div class="ak-layer ak-layer-white">
  <button class="ak-layer ak-layer-black relative">
    Selected tab
    <span
      class="ak-layer ak-layer-contrast ak-outset ak-outset-light:h-[3px] ak-outset-dark:h-[2px] absolute inset-x-0 top-full"
    ></span>
  </button>
</div>
```

Each layer appearance variant has an `ak-outset-*` counterpart, and `not-*` works with them, such as `not-ak-outset-dark`.
