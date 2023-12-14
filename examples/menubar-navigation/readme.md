---
tags:
  - New
  - Menubar
  - Menu
  - Portal
  - Animated
  - CSS transitions
  - Advanced
  - Abstracted examples
media:
  - type: image
    src: /videos/menubar-navigation-hover-intent.jpg
    alt: A green shape demonstrating the hover intent area of the menubar navigation menu
    width: 960
    height: 540
---

# Navigation Menubar

<div data-description>

Using [Menubar](/components/menubar), [Menu](/components/menu), and [Portal](/components/portal) to create an accessible, tabbable navigation menu widget with links and menu buttons that expand on hover and focus.

</div>

<div data-tags></div>

<a href="./index.tsx" data-playground>Example</a>

## Components

<div data-cards="components">

- [](/components/menubar)
- [](/components/menu)
- [](/components/portal)

</div>

## Focusing on menubar items with <kbd>Tab</kbd>

[Menubar](/components/menubar) widgets typically represent a single tab stop on the page. In other words, users can navigate to the first item _within_ the menubar by pressing <kbd>Tab</kbd>, and then move to the next tabbable element _outside_ the menubar by pressing <kbd>Tab</kbd> again. The arrow keys allow navigation through items within the menubar.

Still, users commonly expect navigation lists to be tabbable. To uphold this expectation, we use the [`tabbable`](/reference/menu-item#tabbable) prop on [`MenuItem`](/reference/menu-item) to make the menu items tabbable.

<aside data-type="note" title="Tab order is preserved from the anchor position in the DOM">

Despite using the [`portal`](/reference/menu#portal) prop on [`Menu`](/reference/menu), the tab order remains intact. Meaning, pressing <kbd>Tab</kbd> from a menubar item shifts focus to the first item within the menu popup, not the next menubar item. This functionality is due to the [`preserveTabOrder`](/reference/menu#preservetaborder) and [`preserveTabOrderAnchor`](/reference/menu#preservetaborderanchor) props automatically set on [`Menu`](/reference/menu).

</aside>

## Rendering a single menu

In this example, we're rendering a single [`Menu`](/reference/menu) along with the [`MenuArrow`](/reference/menu-arrow) component, taking advantage of Ariakit's capability to let multiple [`MenuButton`](/reference/menu-button) components control the same menu.

To accomplish this:

1. We can link multiple menu stores to one parent store. We do this by passing the store provided by the parent [`MenuProvider`](/reference/menu-provider) to the [`store`](/reference/use-menu-store#store) prop on [`useMenuStore`](/reference/use-menu-store):

   ```jsx
   function Parent({ children }) {
     return (
       // Provides the parent menu store
       <MenuProvider>
         <Child />
         <Child />
         <Child />
         <Menu />
       </MenuProvider>
     );
   }

   function Child() {
     const parentStore = useMenuContext();
     // Now the parent and child menu states are synced
     const menu = useMenuStore({ store: parentStore });
   }
   ```

2. When a menu controlled by multiple [`MenuButton`](/reference/menu-button) components is open, the `anchorElement` state will indicate the button that initiated the behavior. This automatically adjusts the position of the [`Menu`](/reference/menu) component and the tab order in relation to the menu button.

   This also means that we can use the `anchorElement` state to determine the `open` state of the child menu:

   ```js
   const open = menu.useState(
     (state) => state.mounted && state.anchorElement === button,
   );
   ```

3. Finally, if the child menu is open, we can render the [`Portal`](/reference/portal) component to append the menu items to the parent [`Menu`](/reference/menu) component using the [`portalElement`](/reference/portal#portalelement) prop:

   ```jsx
   const parentMenu = menu.useState("contentElement");

   if (open) {
     return <Portal portalElement={parentMenu}>{children}</Portal>;
   }
   ```

## Applying CSS transitions to the menu

Since we're [rendering a single menu](#rendering-a-single-menu), we can easily apply a CSS transition to the menu wrapper element when its position is adjusted relative to the active menu button.

By verifying whether the menu element has a [`data-enter`](/guide/styling#data-enter) attribute, which is only applied when the menu is open and ready for the enter transition, we can prevent transitioning the menu when it's initially rendered, prior to its proper placement:

```css
.menu-wrapper:has([data-enter]) {
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
```

## Showing menus on hover

To display the menu when hovering over the menubar items, we can use the [`showOnHover`](/reference/menu-button#showonhover) prop on [`MenuButton`](/reference/menu-button).

This feature is driven by the [Hovercard](/components/hovercard) module, which takes _hover intent_ into account and determines whether the user is moving the cursor towards the menu:

<video gif="true" playbackrate="0.5" data-large src="/videos/menubar-navigation-hover-intent.mp4" poster="/videos/menubar-navigation-hover-intent.jpg" width="960" height="540"></video>

## Showing menus on focus

For this navigation menu, we want to expand menus whenever the menubar items gain keyboard focus. This is the keyboard behavior equivalent to displaying menus on hover.

The reason is that it might not be clear to sighted keyboard users that the menu items can expand, or what the keyboard shortcut to do so is. We might have menubar items that are both expandable with arrow keys and link to a page when pressing <kbd>Enter</kbd>.

To achieve this, we can use the [`onFocusVisible`](/reference/menu-button#onfocusvisible) prop on [`MenuButton`](/reference/menu-button) to display the menu whenever the menubar item gains keyboard focus. Given that we're manually showing a menu with multiple possible anchors and disclosure buttons, we should also set the `anchorElement` and `disclosureElement` states:

```jsx
<MenuButton
  onFocusVisible={(event) => {
    menu.setDisclosureElement(event.currentTarget);
    menu.setAnchorElement(event.currentTarget);
    menu.show();
  }}
/>
```

## Related examples

<div data-cards="examples">

- [](/examples/menu-nested)
- [](/examples/menu-framer-motion)
- [](/examples/menu-slide)

</div>
```
