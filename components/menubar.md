---
tags:
  - Menubar
  - Menu
  - Dropdowns
---

# Menubar

<div data-description>

Render a visually persistent menu similar to those found near the top of the window in desktop apps. This component is based on the <a href="https://www.w3.org/WAI/ARIA/apg/patterns/menu/">WAI-ARIA Menubar Pattern</a>.

</div>

<div data-tags></div>

<a href="../examples/menubar/index.tsx" data-playground>Example</a>

<!-- ## Examples

<div data-cards="examples">

- [](/examples/menubar-navigation)

</div> -->

## API

```jsx
useMenubarStore()
useMenubarContext()

<MenubarProvider>
  <Menubar />
</MenubarProvider>
```

## Can I use Menubar for site navigation?

**Short answer**: Yes, but be mindful.

ARIA doesn't specify how you should structure the contents of your site. It just describes how the roles should behave. If you've designed your site navigation to work precisely like a menubar and it's clear to the user, then you can use `Menubar`.

Using ARIA roles is like signing a contract with the user. You're saying, "I'm going to use this role to represent this thing, and you can expect it to work like this". If you don't follow through, you're breaking that contract, and the user will be confused.

In the case of the [`menubar`](https://w3c.github.io/aria/#menubar) role, the user expects being able to use arrow keys to navigate between menu items. Ariakit provides this behavior out of the box.

## Related components

<div data-cards="components">

- [](/components/disclosure)
- [](/components/hovercard)
- [](/components/menu)
- [](/components/popover)
- [](/components/toolbar)
- [](/components/composite)

</div>
