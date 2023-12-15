---
tags:
  - New
  - Menu
  - Combobox
  - VisuallyHidden
  - Concurrent React
  - Search
  - Dropdowns
  - Advanced
  - Abstracted examples
media:
  - type: image
    src: /media/menu-nested-combobox-code-1.jpg
    alt: Screenshot of a snippet of code demonstrating the use of Combobox and Menu components
    width: 800
    height: 600
  - type: image
    src: /media/menu-nested-combobox-hover-intent.png
    alt: A green shape demonstrating the hover intent area of nested menus
    width: 960
    height: 587
---

# Submenu with Combobox

<div data-description>

Nesting Notion-style dropdown menus with search & autocomplete features by combining [Menu](/components/menu) with [Combobox](/components/combobox).

</div>

<div data-tags></div>

<a href="./index.tsx" data-playground>Example</a>

## Components

<div data-cards="components">

- [](/components/menu)
- [](/components/combobox)
- [](/components/visually-hidden)

</div>

<aside data-type="note" title="This is an advanced example">

This example employs sophisticated methods to ensure maximum accessibility across different browsers, devices, and assistive technologies. You can easily copy and paste the provided code into your project and use it as a foundation.

Refer to the documentation below for a deeper understanding of the implementation details. As time progresses, we may introduce additional features to the Ariakit library to further simplify the implementation of this example.

</aside>

## Combining Menu and Combobox

In this example, we've crafted a higher-level abstraction of the [Menu](/components/menu) component. It automatically pairs with a [Combobox](/components/combobox) when certain props are supplied.

To render a dropdown menu with search capabilities, wrap [`MenuProvider`](/reference/menu-provider) with [`ComboboxProvider`](/reference/combobox-provider). Then, use [Combobox](/components/combobox) components like [`Combobox`](/reference/combobox), [`ComboboxList`](/reference/combobox-list), and [`ComboboxItem`](/reference/combobox-item) within the [`Menu`](/reference/menu) component:

```jsx {5-8} "ComboboxProvider"
<ComboboxProvider>
  <MenuProvider>
    <MenuButton />
    <Menu>
      <Combobox />
      <ComboboxList>
        <ComboboxItem />
      </ComboboxList>
    </Menu>
  </MenuProvider>
</ComboboxProvider>
```

We use [`ComboboxList`](/reference/combobox-list) instead of [`ComboboxPopover`](/reference/combobox-popover) because the [`Menu`](/reference/menu) component already functions as a popover.

Explore other examples that use this technique:

<div data-cards>

- [](/examples/menu-combobox)
- [](/examples/select-combobox)

</div>

## Context-based item rendering

As we dynamically render [Combobox](/components/combobox) components whenever specific props are given to our custom `Menu` component, we also need to ascertain whether the item should be rendered as a [`ComboboxItem`](/reference/combobox-item) or a [`MenuItem`](/reference/menu-item).

To achieve this, we just wrap the `Menu` children with a custom `SearchableContext` and read the context value in our custom item component:

```jsx {6-8,15} "SearchableContext"
const SearchableContext = createContext(false);

function Menu({ children, searchable }) {
  return (
    <Ariakit.Menu>
      <SearchableContext.Provider value={searchable}>
        {children}
      </SearchableContext.Provider>
    </Ariakit.Menu>
  );
}

function Item() {
  const searchable = useContext(SearchableContext);
  return searchable ? <Ariakit.ComboboxItem /> : <Ariakit.MenuItem />;
}
```

## Determining the item's checked state

Regardless of whether the item is rendered as a [`ComboboxItem`](/reference/combobox-item) or a [`MenuItem`](/reference/menu-item), we control the checked state of all items using the menu store. This is automatically managed by the [`MenuItemRadio`](/reference/menu-item-radio) component. However, we need to manually link this state with the [`ComboboxItem`](/reference/combobox-item) component.

1. First, to confirm if an item can be checked, we use the [callback version of the `useState` hook](/guide/component-stores#computed-values) from the menu store to check if the menu values already include a state with the same `name` property as the item:

   ```jsx
   const checkable = menu.useState((state) => {
     return (
       props.name != null &&
       props.value != null &&
       state.values[props.name] != null
     );
   });
   ```

2. Next, we can use the same approach to determine if the item is checked:

   ```jsx
   const checked = menu.useState((state) => {
     return (
       props.name != null &&
       props.value != null &&
       state.values[props.name] === props.value
     );
   });
   ```

## Rendering checkable items

If the item is `checkable`, we render a [`MenuItemCheck`](/reference/menu-item-check) as its child. This component is typically a child of the [`MenuItemRadio`](/reference/menu-item-radio) or [`MenuItemCheckbox`](/reference/menu-item-checkbox) components, automatically inferring the [`checked`](/reference/menu-item-check#checked) prop from them. However, we need to manually pass the [`checked`](/reference/menu-item-check#checked) prop in this scenario, as the component might be a child of a [`ComboboxItem`](/reference/combobox-item) component:

```jsx
<MenuItemCheck checked={checked} />
```

If it's a [`ComboboxItem`](/reference/combobox-item), we must update the menu store by calling its [`setValue`](/reference/use-menu-store#setvalue) method when the item gets selected. We can accomplish this by using the [`selectValueOnClick`](/reference/combobox-item#selectvalueonclick) callback prop. This prop will only be invoked when the item has a [`value`](/reference/combobox-item#value):

```jsx
<ComboboxItem
  value={checkable ? props.value : undefined}
  selectValueOnClick={() => {
    menu.setValue(name, value);
    return true;
  }}
/>
```

## Hiding all menus upon item click

The [`MenuItem`](/reference/menu-item) component automatically hides all parent menus when clicked. On the other hand, the [`ComboboxItem`](/reference/combobox-item) component only closes its own popover. To maintain consistent behavior across all items, we can use the [`hideOnClick`](/reference/combobox-item#hideonclick) callback prop to hide all menus when the item is clicked:

```jsx
<ComboboxItem
  hideOnClick={(event) => {
    menu.hideAll();
    return true;
  }}
/>
```

## Rendering nested menus

In the [Anatomy of nested menus](/examples/menu-nested#anatomy-of-nested-menus), it's explained that creating submenus with Ariakit is as straightforward as nesting [Menu](/components/menu) components. You can merge [`MenuButton`](/reference/menu-button) and [`MenuItem`](/reference/menu-item) into one element by using the `render` prop:

```jsx {5-10} "render"
<MenuProvider>
  <MenuButton />
  <Menu>
    <MenuItem />
    <MenuProvider>
      <MenuItem render={<MenuButton />} />
      <Menu>
        <MenuItem />
      </Menu>
    </MenuProvider>
  </Menu>
</MenuProvider>
```

## Showing submenus based on hover intent

<video gif="true" data-large src="/media/menu-nested-combobox-hover-intent.mp4" poster="/media/menu-nested-combobox-hover-intent.png" width="960" height="587"></video>

When nesting [Menu](/components/menu) components, the submenu will automatically open upon hovering over the [`MenuButton`](/reference/menu-button). You can control this behavior with the [`showOnHover`](/reference/menu-button#showonhover) prop, which defaults to `true` in these scenarios.

If the submenu is open and the user moves the mouse towards it, Ariakit will verify if the pointer lies within the _hover intent_ zone. This mechanism guarantees that the submenu doesn't shut when the mouse passes over a different submenu button on the way to the target submenu.

## Testing with screen readers

Given that the list of [`ComboboxItem`](/reference/combobox-item) in this example may contain a mix of checked, unchecked, and non-checkable items, there are several ways we can communicate this to assistive technologies:

### `aria-multiselectable` and `aria-selected`

We could use the [`aria-multiselectable`](https://w3c.github.io/aria/#aria-multiselectable) attribute to indicate that the list supports multiple selections, and the [`aria-selected`](https://w3c.github.io/aria/#aria-selected) attribute for the checked state of each item. As per [MDN](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/option_role#:~:text=All%20selectable%20options%20should%20have%20aria%2Dselected%20match%20their%20state%2C%20true%20when%20selected%20and%20false%20when%20not.%20If%20an%20option%20is%20not%20selectable%2C%20aria%2Dselected%20can%20be%20omitted):

> All selectable options should have `aria-selected` match their state, `true` when selected and `false` when not. **If an option is not selectable, `aria-selected` can be omitted**.

However, most browsers don't support the omission of the `aria-selected` attribute for non-selectable items in a multi-select list. They either announce it as selected or don't differentiate between selectable and non-selectable items.

### `aria-selected` and `aria-checked`

Alternatively, we could use the [`aria-checked`](https://w3c.github.io/aria/#aria-checked) attribute to indicate the checked state of each item. As per the [ARIA spec](https://w3c.github.io/aria/#option), we can use both `aria-selected` and `aria-checked` attributes on the same option if:

> - The meaning and purpose of `aria-selected` is different from the meaning and purpose of `aria-checked` in the user interface.
> - The user interface makes the meaning and purpose of each state apparent.
> - The user interface provides a separate method for controlling each state.

We would use `aria-selected` for the currently focused item, and `aria-checked` to indicate the item's checked state. The user interface would style the focused item with a highlight color, and the checked item with a checkmark. The focused item could be changed using arrow keys, while the checked state could be set using <kbd>Enter</kbd>.

However, while this method works well with NVDA and JAWS, other screen readers seem to have issues:

- VoiceOver doesn't recognize the `aria-checked` attribute. It doesn't announce it at all.
- TalkBack announces the checked state, but incorrectly suggests that a double tap will toggle the state, which isn't true in this case.

### Visually hidden label to the rescue

To ensure that the checked state is consistently communicated to all assistive technologies, we can use a visually hidden label to announce the checked state of each item:

```jsx {3}
<ComboboxItem>
  Yellow
  <VisuallyHidden>{checked ? "checked" : "not checked"}</VisuallyHidden>
  <MenuItemCheck checked={checked} />
</ComboboxItem>
```

This will announce the item as "Yellow checked" or "Yellow not checked" depending on the checked state.

## Related examples

<div data-cards="examples">

- [](/examples/menu-nested)
- [](/examples/menu-combobox)
- [](/examples/select-combobox)
- [](/examples/combobox-multiple)
- [](/examples/combobox-filtering)
- [](/examples/combobox-filtering-integrated)
- [](/examples/menu-item-radio)
- [](/examples/menu-tooltip)

</div>
