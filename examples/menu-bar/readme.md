---
tags:
  - Menu
  - Dropdowns
  - Abstracted examples
---

# MenuBar

<div data-description>

Rendering a visually persistent menu similar to those found near the top of the window in desktop applications. This example is based on the <a href="https://www.w3.org/WAI/ARIA/apg/patterns/menu/">WAI-ARIA Menu Bar Pattern</a>.

</div>

<div data-tags></div>

<a href="./index.tsx" data-playground>Example</a>

## Can I use MenuBar for site navigation?

**Short answer**: Yes, but you probably shouldn't.

ARIA doesn't specify how you should structure the contents of your site. It just describes how the roles should behave. If you've designed your site navigation to work precisely like a menu bar and it's clear to the user (e.g., your app looks like a desktop application), then you can use `MenuBar`.

Using ARIA roles is like signing a contract with the user. You're saying, "I'm going to use this role to represent this thing, and you can expect it to work like this". If you don't follow through, you're breaking that contract, and the user will be confused.

In the case of the [`menubar`](https://w3c.github.io/aria/#menubar) role, the user expects the whole component to work as a single tab stop. The <kbd>Tab</kbd> key will focus on the first item in the menu bar. Pressing <kbd>Tab</kbd> again will focus on the next tabbable element outside the menu bar. Inside the menu bar, the user expects to be able to use the arrow keys to navigate between menu items. Ariakit provides this behavior out of the box.
