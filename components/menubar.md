---
tags:
  - Menu
  - Dropdowns
---

# Menubar

<div data-description>

Access a set of commands within a menu bar or dropdown menu. This component is based on the <a href="https://www.w3.org/WAI/ARIA/apg/patterns/menu/">WAI-ARIA Menu Pattern</a> and the <a href="https://www.w3.org/WAI/ARIA/apg/patterns/menubutton/">WAI-ARIA Menu Button Pattern</a>.

</div>

<div data-tags></div>

<a href="../examples/menubar/index.tsx" data-playground>Example</a>

## Examples

<div data-cards="examples">

- [](/examples/menu-nested)
- [](/examples/menu-item-checkbox)
- [](/examples/menu-framer-motion)
- [](/examples/menu-tooltip)

</div>

## API

```jsx
useMenubarStore()
useMenubarContext()

<MenubarProvider>
  <Menubar />
</MenubarProvider>
```

## Can I use MenuBar for site navigation?

**Short answer**: Yes, but you probably shouldn't.

ARIA doesn't specify how you should structure the contents of your site. It just describes how the roles should behave. If you've designed your site navigation to work precisely like a menu bar and it's clear to the user (e.g., your app looks like a desktop application), then you can use `MenuBar`.

Using ARIA roles is like signing a contract with the user. You're saying, "I'm going to use this role to represent this thing, and you can expect it to work like this". If you don't follow through, you're breaking that contract, and the user will be confused.

In the case of the [`menubar`](https://w3c.github.io/aria/#menubar) role, the user expects the whole component to work as a single tab stop. The <kbd>Tab</kbd> key will focus on the first item in the menu bar. Pressing <kbd>Tab</kbd> again will focus on the next tabbable element outside the menu bar. Inside the menu bar, the user expects to be able to use the arrow keys to navigate between menu items. Ariakit provides this behavior out of the box.

## Related components

<div data-cards="components">

- [](/components/button)
- [](/components/checkbox)
- [](/components/popover)
- [](/components/radio)
- [](/components/select)
- [](/components/composite)

</div>
