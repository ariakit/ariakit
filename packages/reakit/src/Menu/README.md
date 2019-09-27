---
path: /docs/menu/
---

# Menu

Accessible `Menu` component that follows the [WAI-ARIA Menu or Menu bar Pattern](https://www.w3.org/TR/wai-aria-practices/#menu). It also includes a `MenuDisclosure` component that follows the [WAI-ARIA Menu Button Pattern](https://www.w3.org/TR/wai-aria-practices/#menubutton).

<carbon-ad></carbon-ad>

## Installation

```sh
npm install reakit
```

Learn more in [Get started](/docs/get-started/).

## Usage

```jsx
import {
  useMenuState,
  Menu,
  MenuItem,
  MenuDisclosure,
  MenuSeparator
} from "reakit/Menu";

function Example() {
  const menu = useMenuState();
  return (
    <>
      <MenuDisclosure {...menu}>Preferences</MenuDisclosure>
      <Menu {...menu} aria-label="Preferences">
        <MenuItem {...menu}>Settings</MenuItem>
        <MenuItem {...menu} disabled>
          Extensions
        </MenuItem>
        <MenuSeparator {...menu} />
        <MenuItem {...menu}>Keyboard shortcuts</MenuItem>
      </Menu>
    </>
  );
}
```

### Menu actions

You can use either `onClick` or `href` props on `MenuItem` to define menu actions.

<!-- eslint-disable no-console -->

```jsx
import {
  useMenuState,
  Menu,
  MenuItem,
  MenuDisclosure,
  MenuSeparator
} from "reakit/Menu";

function Example() {
  const menu = useMenuState();

  return (
    <>
      <MenuDisclosure {...menu}>Menu</MenuDisclosure>
      <Menu {...menu} aria-label="Example">
        <MenuItem
          {...menu}
          onClick={() => {
            menu.hide();
            console.log("clicked on button");
          }}
        >
          Button
        </MenuItem>
        <MenuItem {...menu} as="a" href="#" onClick={menu.hide}>
          Link
        </MenuItem>
      </Menu>
    </>
  );
}
```

### Initial focus

When opening `Menu`, focus is usually set on the first `MenuItem`. You can set the initial focus to be the menu container itself by just passing `tabIndex={0}` to it. This will be ignored if the menu is opened by using arrow keys.

```jsx
import { useMenuState, Menu, MenuItem, MenuDisclosure } from "reakit/Menu";

function Example() {
  const menu = useMenuState();
  return (
    <>
      <MenuDisclosure {...menu}>Preferences</MenuDisclosure>
      <Menu {...menu} tabIndex={0} aria-label="Preferences">
        <MenuItem {...menu}>Settings</MenuItem>
        <MenuItem {...menu}>Extensions</MenuItem>
        <MenuItem {...menu}>Keyboard shortcuts</MenuItem>
      </Menu>
    </>
  );
}
```

Alternatively, you can define another element to get the initial focus with React hooks:

```jsx
import React from "react";
import { Button } from "reakit/Button";
import { useMenuState, Menu, MenuItem, MenuDisclosure } from "reakit/Menu";

function Example() {
  const menu = useMenuState();
  const ref = React.useRef();

  React.useEffect(() => {
    if (menu.visible) {
      ref.current.focus();
    }
  }, [menu.visible]);

  return (
    <>
      <MenuDisclosure {...menu}>Preferences</MenuDisclosure>
      <Menu {...menu} aria-label="Preferences">
        <MenuItem {...menu}>Settings</MenuItem>
        <MenuItem {...menu} ref={ref}>
          Extensions
        </MenuItem>
        <MenuItem {...menu}>Keyboard shortcuts</MenuItem>
      </Menu>
    </>
  );
}
```

### Submenu

`Menu` can be used independently or nested within another one.

```jsx
import React from "react";
import {
  useMenuState,
  Menu,
  MenuItem,
  MenuDisclosure,
  MenuSeparator
} from "reakit/Menu";

const PreferencesMenu = React.forwardRef((props, ref) => {
  const menu = useMenuState();
  return (
    <>
      <MenuDisclosure ref={ref} {...menu} {...props}>
        Preferences
      </MenuDisclosure>
      <Menu {...menu} aria-label="Preferences">
        <MenuItem {...menu}>Settings</MenuItem>
        <MenuItem {...menu} disabled>
          Extensions
        </MenuItem>
        <MenuSeparator {...menu} />
        <MenuItem {...menu}>Keyboard shortcuts</MenuItem>
      </Menu>
    </>
  );
});

function Example() {
  const menu = useMenuState();
  return (
    <>
      <MenuDisclosure {...menu}>Code</MenuDisclosure>
      <Menu {...menu} aria-label="Code">
        <MenuItem {...menu}>About Visual Studio Code</MenuItem>
        <MenuItem {...menu}>Check for Updates...</MenuItem>
        <MenuSeparator {...menu} />
        <MenuItem {...menu} as={PreferencesMenu} />
      </Menu>
    </>
  );
}
```

### Menu with dialog

Reakit is built with composition in mind! You can compose any other component with `Menu`. You can nest [Dialog](/docs/dialog/)s inside it by using the same approach described on [Submenu](#submenu).

```jsx
import React from "react";
import { Button } from "reakit/Button";
import {
  useDialogState,
  Dialog,
  DialogDisclosure,
  DialogBackdrop
} from "reakit/Dialog";
import {
  useMenuState,
  Menu,
  MenuItem,
  MenuDisclosure,
  MenuSeparator
} from "reakit/Menu";

const UpdatesDialog = React.forwardRef((props, ref) => {
  const dialog = useDialogState();
  return (
    <>
      <DialogDisclosure ref={ref} {...dialog} {...props}>
        Check for Updates...
      </DialogDisclosure>
      <Dialog {...dialog} aria-label="Check for Updates">
        <p>There are currently no updates available.</p>
        <Button onClick={dialog.hide}>OK</Button>
      </Dialog>
    </>
  );
});

function Example() {
  const menu = useMenuState();
  return (
    <>
      <MenuDisclosure {...menu}>Code</MenuDisclosure>
      <Menu {...menu} aria-label="Code">
        <MenuItem {...menu}>About Visual Studio Code</MenuItem>
        <MenuItem {...menu} as={UpdatesDialog} />
        <MenuSeparator {...menu} />
        <MenuItem {...menu}>Preferences</MenuItem>
      </Menu>
    </>
  );
}
```

### Menu bar

You can combine multiple `Menu`s to compose a `MenuBar` by using the same approach described on [Submenu](#submenu). Each `Menu` can be used separately or in combination with others.

```jsx
import React from "react";
import {
  useMenuState,
  useMenuBarState,
  Menu,
  MenuDisclosure,
  MenuItem,
  MenuSeparator,
  MenuBar,
  MenuGroup,
  MenuItemCheckbox,
  MenuItemRadio
} from "reakit/Menu";

// OPEN RECENT
const OpenRecentMenu = React.forwardRef((props, ref) => {
  const menu = useMenuState();
  return (
    <>
      <MenuDisclosure ref={ref} {...menu} {...props}>
        Open Recent
      </MenuDisclosure>
      <Menu {...menu} aria-label="Open Recent">
        <MenuItem {...menu}>Reopen Closed Editor</MenuItem>
        <MenuSeparator {...menu} />
        <MenuItem {...menu}>More...</MenuItem>
        <MenuSeparator {...menu} />
        <MenuItem {...menu}>Clear Recently Opened</MenuItem>
      </Menu>
    </>
  );
});

// FILE
const FileMenu = React.forwardRef((props, ref) => {
  const menu = useMenuState();
  return (
    <>
      <MenuDisclosure ref={ref} {...menu} {...props}>
        File
      </MenuDisclosure>
      <Menu {...menu} aria-label="File">
        <MenuItem {...menu}>New File</MenuItem>
        <MenuItem {...menu}>New Window</MenuItem>
        <MenuSeparator {...menu} />
        <MenuItem {...menu}>Open...</MenuItem>
        <MenuItem {...menu}>Open Workspace...</MenuItem>
        <MenuItem {...menu} as={OpenRecentMenu} />
      </Menu>
    </>
  );
});

// EDIT
const EditMenu = React.forwardRef((props, ref) => {
  const menu = useMenuState();
  return (
    <>
      <MenuDisclosure ref={ref} {...menu} {...props}>
        Edit
      </MenuDisclosure>
      <Menu {...menu} aria-label="Edit">
        <MenuItem {...menu}>Undo</MenuItem>
        <MenuItem {...menu}>Redo</MenuItem>
        <MenuSeparator {...menu} />
        <MenuItem {...menu}>Cut</MenuItem>
        <MenuItem {...menu}>Copy</MenuItem>
        <MenuItem {...menu}>Paste</MenuItem>
      </Menu>
    </>
  );
});

// VIEW
const ViewMenu = React.forwardRef((props, ref) => {
  const menu = useMenuState();
  return (
    <>
      <MenuDisclosure ref={ref} {...menu} {...props}>
        View
      </MenuDisclosure>
      <Menu {...menu} aria-label="View">
        <MenuGroup {...menu}>
          <MenuItemRadio {...menu} name="windows" value="explorer">
            Explorer
          </MenuItemRadio>
          <MenuItemRadio {...menu} name="windows" value="search">
            Search
          </MenuItemRadio>
          <MenuItemRadio {...menu} name="windows" value="debug">
            Debug
          </MenuItemRadio>
          <MenuItemRadio {...menu} name="windows" value="extensions">
            Extensions
          </MenuItemRadio>
        </MenuGroup>
        <MenuSeparator {...menu} />
        <MenuItemCheckbox {...menu} name="toggles" value="word-wrap">
          Toggle Word Wrap
        </MenuItemCheckbox>
        <MenuItemCheckbox {...menu} name="toggles" value="minimap">
          Toggle Minimap
        </MenuItemCheckbox>
        <MenuItemCheckbox {...menu} name="toggles" value="breadcrumbs">
          Toggle Breadcrumbs
        </MenuItemCheckbox>
      </Menu>
    </>
  );
});

function Example() {
  const menu = useMenuBarState({ orientation: "horizontal" });
  return (
    <MenuBar {...menu}>
      <MenuItem {...menu} as={FileMenu} />
      <MenuItem {...menu} as={EditMenu} />
      <MenuItem {...menu} as={ViewMenu} />
    </MenuBar>
  );
}
```

### Abstracting

You can build your own `Menu` component with a different API on top of Reakit.

```jsx
import React from "react";
import {
  useMenuState,
  Menu as BaseMenu,
  MenuItem,
  MenuDisclosure
} from "reakit/Menu";

function Menu({ disclosure, items, ...props }) {
  const menu = useMenuState();
  return (
    <>
      <MenuDisclosure {...menu}>
        {disclosureProps =>
          React.cloneElement(React.Children.only(disclosure), disclosureProps)
        }
      </MenuDisclosure>
      <BaseMenu {...menu} {...props}>
        {items.map((item, i) => (
          <MenuItem {...menu} key={i}>
            {itemProps =>
              React.cloneElement(React.Children.only(item), itemProps)
            }
          </MenuItem>
        ))}
      </BaseMenu>
    </>
  );
}

function Example() {
  return (
    <Menu
      aria-label="Custom menu"
      disclosure={<button>Custom menu</button>}
      items={[
        <button>Custom item 1</button>,
        <button>Custom item 2</button>,
        <button>Custom item 3</button>
      ]}
    />
  );
}
```

## Accessibility

- `MenuBar` and `Menu` have either role `menu` or `menubar` depending on the value of the `orientation` option (when it's `horizontal` it becomes `menubar`).
- `MenuDisclosure` extends the accessibility features of [PopoverDisclosure](/docs/popover/#accessibility), which means it sets `aria-haspopup` and `aria-expanded` attributes accordingly.
- `MenuItem` has role `menuitem`.
- `MenuItem` extends the accessibility features of [Rover](/docs/rover/), which means it uses the [roving tabindex](https://www.w3.org/TR/wai-aria-practices-1.1/#kbd_roving_tabindex) method to manage focus.
- `MenuItemCheckbox` has role `menuitemcheckbox`.
- `MenuItemRadio` has role `menuitemradio`.
- Pressing <kbd>Enter</kbd> on `MenuDisclosure` opens its menu (or submenu) and places focus on its first item.
- Pressing <kbd>Space</kbd> on `MenuItemCheckbox` changes the state without closing `Menu`.
- Pressing <kbd>Space</kbd> on a `MenuItemRadio` that is not checked, without closing `Menu`, checks the focused `MenuItemRadio` and unchecks any other checked `MenuItemRadio` in the same group.
- Pressing any key that corresponds to a printable character moves focus to the next `MenuItem` in the current `Menu` or `MenuBar` whose label begins with that printable character.

Learn more in [Accessibility](/docs/accessibility/).

## Composition

- `Menu` uses `MenuBar` and [Popover](/docs/popover/).
- `MenuDisclosure` uses [PopoverDisclosure](/docs/popover/).
- `MenuGroup` uses [Box](/docs/box/).
- `MenuItem` uses [Rover](/docs/rover/).
- `MenuItemCheckbox` uses [Checkbox](/docs/checkbox/).
- `MenuItemRadio` uses [Radio](/docs/radio/).
- `MenuSeparator` uses [Separator](/docs/separator/).
- `MenuBar` uses [Box](/docs/box/).

Learn more in [Composition](/docs/composition/#props-hooks).

## Props

<!-- Automatically generated -->

### `useMenuBarState`

- **`orientation`**
  <code>&#34;horizontal&#34; | &#34;vertical&#34; | undefined</code>

  Defines the orientation of the rover list.

- **`currentId`**
  <code>string | null</code>

  The current focused element ID.

- **`loop`**
  <code>boolean</code>

  If enabled:
  - Jumps to the first item when moving next from the last item.
  - Jumps to the last item when moving previous from the first item.

- **`unstable_values`** <span title="Experimental">⚠️</span>
  <code>{ [x: string]: any; }</code>

  Stores the values of radios and checkboxes within the menu.

### `useMenuState`

- **`orientation`**
  <code>&#34;horizontal&#34; | &#34;vertical&#34; | undefined</code>

  Defines the orientation of the rover list.

- **`currentId`**
  <code>string | null</code>

  The current focused element ID.

- **`loop`**
  <code>boolean</code>

  If enabled:
  - Jumps to the first item when moving next from the last item.
  - Jumps to the last item when moving previous from the first item.

- **`unstable_values`** <span title="Experimental">⚠️</span>
  <code>{ [x: string]: any; }</code>

  Stores the values of radios and checkboxes within the menu.

- **`visible`**
  <code>boolean</code>

  Whether it's visible or not.

- **`unstable_animated`** <span title="Experimental">⚠️</span>
  <code>number | boolean</code>

  If `true`, `animating` will be set to `true` when `visible` changes.
It'll wait for `stopAnimation` to be called or a CSS transition ends.
If it's a number, `stopAnimation` will be called automatically after
given milliseconds.

- **`placement`**
  <code title="&#34;auto-start&#34; | &#34;auto&#34; | &#34;auto-end&#34; | &#34;top-start&#34; | &#34;top&#34; | &#34;top-end&#34; | &#34;right-start&#34; | &#34;right&#34; | &#34;right-end&#34; | &#34;bottom-end&#34; | &#34;bottom&#34; | &#34;bottom-start&#34; | &#34;left-end&#34; | &#34;left&#34; | &#34;left-start&#34;">&#34;auto-start&#34; | &#34;auto&#34; | &#34;auto-end&#34; | &#34;top-start...</code>

  Actual `placement`.

- **`unstable_fixed`** <span title="Experimental">⚠️</span>
  <code>boolean | undefined</code>

  Whether or not the popover should have `position` set to `fixed`.

- **`unstable_flip`** <span title="Experimental">⚠️</span>
  <code>boolean | undefined</code>

  Flip the popover's placement when it starts to overlap its reference
element.

- **`unstable_shift`** <span title="Experimental">⚠️</span>
  <code>boolean | undefined</code>

  Shift popover on the start or end of its reference element.

- **`gutter`**
  <code>number | undefined</code>

  Offset between the reference and the popover.

- **`unstable_preventOverflow`** <span title="Experimental">⚠️</span>
  <code>boolean | undefined</code>

  Prevents popover from being positioned outside the boundary.

- **`unstable_boundariesElement`** <span title="Experimental">⚠️</span>
  <code>&#34;scrollParent&#34; | &#34;viewport&#34; | &#34;window&#34; | undefined</code>

  Boundaries element used by `preventOverflow`.

### `Menu`

- **`modal`**
  <code>boolean | undefined</code>

  Toggles Dialog's `modal` state.
  - Non-modal: `preventBodyScroll` doesn't work and focus is free.
  - Modal: `preventBodyScroll` is automatically enabled, focus is
trapped within the dialog and the dialog is rendered within a `Portal`
by default.

- **`hideOnClickOutside`**
  <code>boolean | undefined</code>

  When enabled, user can hide the dialog by clicking outside it.

- **`preventBodyScroll`**
  <code>boolean | undefined</code>

  When enabled, user can't scroll on body when the dialog is visible.
This option doesn't work if the dialog isn't modal.

- **`unstable_initialFocusRef`** <span title="Experimental">⚠️</span>
  <code>RefObject&#60;HTMLElement&#62; | undefined</code>

  The element that will be focused when the dialog shows.
When not set, the first tabbable element within the dialog will be used.

- **`unstable_finalFocusRef`** <span title="Experimental">⚠️</span>
  <code>RefObject&#60;HTMLElement&#62; | undefined</code>

  The element that will be focused when the dialog hides.
When not set, the disclosure component will be used.

- **`unstable_portal`** <span title="Experimental">⚠️</span>
  <code>boolean | undefined</code>

  Whether or not the dialog should be rendered within `Portal`.
It's `true` by default if `modal` is `true`.

- **`unstable_orphan`** <span title="Experimental">⚠️</span>
  <code>boolean | undefined</code>

  Whether or not the dialog should be a child of its parent.
Opening a nested orphan dialog will close its parent dialog if
`hideOnClickOutside` is set to `true` on the parent.
It will be set to `false` if `modal` is `false`.

<details><summary>12 state props</summary>

> These props are returned by the state hook. You can spread them into this component (`{...state}`) or pass them separately. You can also provide these props from your own state logic.

- **`visible`**
  <code>boolean</code>

  Whether it's visible or not.

- **`unstable_animated`** <span title="Experimental">⚠️</span>
  <code>number | boolean</code>

  If `true`, `animating` will be set to `true` when `visible` changes.
It'll wait for `stopAnimation` to be called or a CSS transition ends.
If it's a number, `stopAnimation` will be called automatically after
given milliseconds.

- **`unstable_stopAnimation`** <span title="Experimental">⚠️</span>
  <code>() =&#62; void</code>

  Stops animation. It's called automatically if there's a CSS transition.
It's called after given milliseconds if `animated` is a number.

- **`hide`**
  <code>() =&#62; void</code>

  Changes the `visible` state to `false`

- **`placement`**
  <code title="&#34;auto-start&#34; | &#34;auto&#34; | &#34;auto-end&#34; | &#34;top-start&#34; | &#34;top&#34; | &#34;top-end&#34; | &#34;right-start&#34; | &#34;right&#34; | &#34;right-end&#34; | &#34;bottom-end&#34; | &#34;bottom&#34; | &#34;bottom-start&#34; | &#34;left-end&#34; | &#34;left&#34; | &#34;left-start&#34;">&#34;auto-start&#34; | &#34;auto&#34; | &#34;auto-end&#34; | &#34;top-start...</code>

  Actual `placement`.

- **`first`**
  <code>() =&#62; void</code>

  Moves focus to the first element.

- **`last`**
  <code>() =&#62; void</code>

  Moves focus to the last element.

- **`orientation`**
  <code>&#34;horizontal&#34; | &#34;vertical&#34; | undefined</code>

  Defines the orientation of the rover list.

- **`stops`**
  <code>Stop[]</code>

  A list of element refs and IDs of the roving items.

- **`move`**
  <code>(id: string | null) =&#62; void</code>

  Moves focus to a given element ID.

- **`next`**
  <code>() =&#62; void</code>

  Moves focus to the next element.

- **`previous`**
  <code>() =&#62; void</code>

  Moves focus to the previous element.

</details>

### `MenuArrow`

- **`size`**
  <code>string | number | undefined</code>

  Arrow's size

<details><summary>1 state props</summary>

> These props are returned by the state hook. You can spread them into this component (`{...state}`) or pass them separately. You can also provide these props from your own state logic.

- **`placement`**
  <code title="&#34;auto-start&#34; | &#34;auto&#34; | &#34;auto-end&#34; | &#34;top-start&#34; | &#34;top&#34; | &#34;top-end&#34; | &#34;right-start&#34; | &#34;right&#34; | &#34;right-end&#34; | &#34;bottom-end&#34; | &#34;bottom&#34; | &#34;bottom-start&#34; | &#34;left-end&#34; | &#34;left&#34; | &#34;left-start&#34;">&#34;auto-start&#34; | &#34;auto&#34; | &#34;auto-end&#34; | &#34;top-start...</code>

  Actual `placement`.

</details>

### `MenuBar`

<details><summary>5 state props</summary>

> These props are returned by the state hook. You can spread them into this component (`{...state}`) or pass them separately. You can also provide these props from your own state logic.

- **`orientation`**
  <code>&#34;horizontal&#34; | &#34;vertical&#34; | undefined</code>

  Defines the orientation of the rover list.

- **`stops`**
  <code>Stop[]</code>

  A list of element refs and IDs of the roving items.

- **`move`**
  <code>(id: string | null) =&#62; void</code>

  Moves focus to a given element ID.

- **`next`**
  <code>() =&#62; void</code>

  Moves focus to the next element.

- **`previous`**
  <code>() =&#62; void</code>

  Moves focus to the previous element.

</details>

### `MenuDisclosure`

- **`disabled`**
  <code>boolean | undefined</code>

  Same as the HTML attribute.

- **`focusable`**
  <code>boolean | undefined</code>

  When an element is `disabled`, it may still be `focusable`. It works
similarly to `readOnly` on form elements. In this case, only
`aria-disabled` will be set.

<details><summary>8 state props</summary>

> These props are returned by the state hook. You can spread them into this component (`{...state}`) or pass them separately. You can also provide these props from your own state logic.

- **`visible`**
  <code>boolean</code>

  Whether it's visible or not.

- **`toggle`**
  <code>() =&#62; void</code>

  Toggles the `visible` state

- **`unstable_referenceRef`** <span title="Experimental">⚠️</span>
  <code>RefObject&#60;HTMLElement | null&#62;</code>

  The reference element.

- **`hide`**
  <code>() =&#62; void</code>

  Changes the `visible` state to `false`

- **`placement`**
  <code title="&#34;auto-start&#34; | &#34;auto&#34; | &#34;auto-end&#34; | &#34;top-start&#34; | &#34;top&#34; | &#34;top-end&#34; | &#34;right-start&#34; | &#34;right&#34; | &#34;right-end&#34; | &#34;bottom-end&#34; | &#34;bottom&#34; | &#34;bottom-start&#34; | &#34;left-end&#34; | &#34;left&#34; | &#34;left-start&#34;">&#34;auto-start&#34; | &#34;auto&#34; | &#34;auto-end&#34; | &#34;top-start...</code>

  Actual `placement`.

- **`first`**
  <code>() =&#62; void</code>

  Moves focus to the first element.

- **`last`**
  <code>() =&#62; void</code>

  Moves focus to the last element.

- **`show`**
  <code>() =&#62; void</code>

  Changes the `visible` state to `true`

</details>

### `MenuGroup`

No props to show

### `MenuItem`

- **`disabled`**
  <code>boolean | undefined</code>

  Same as the HTML attribute.

- **`focusable`**
  <code>boolean | undefined</code>

  When an element is `disabled`, it may still be `focusable`. It works
similarly to `readOnly` on form elements. In this case, only
`aria-disabled` will be set.

- **`stopId`**
  <code>string | undefined</code>

  Element ID.

<details><summary>14 state props</summary>

> These props are returned by the state hook. You can spread them into this component (`{...state}`) or pass them separately. You can also provide these props from your own state logic.

- **`orientation`**
  <code>&#34;horizontal&#34; | &#34;vertical&#34; | undefined</code>

  Defines the orientation of the rover list.

- **`unstable_moves`** <span title="Experimental">⚠️</span>
  <code>number</code>

  Stores the number of moves that have been made by calling `move`, `next`,
`previous`, `first` or `last`.

- **`currentId`**
  <code>string | null</code>

  The current focused element ID.

- **`first`**
  <code>() =&#62; void</code>

  Moves focus to the first element.

- **`last`**
  <code>() =&#62; void</code>

  Moves focus to the last element.

- **`stops`**
  <code>Stop[]</code>

  A list of element refs and IDs of the roving items.

- **`move`**
  <code>(id: string | null) =&#62; void</code>

  Moves focus to a given element ID.

- **`next`**
  <code>() =&#62; void</code>

  Moves focus to the next element.

- **`previous`**
  <code>() =&#62; void</code>

  Moves focus to the previous element.

- **`register`**
  <code>(id: string, ref: RefObject&#60;HTMLElement&#62;) =&#62; void</code>

  Registers the element ID and ref in the roving tab index list.

- **`unregister`**
  <code>(id: string) =&#62; void</code>

  Unregisters the roving item.

- **`visible`**
  <code>boolean</code>

  Whether it's visible or not.

- **`placement`**
  <code title="&#34;auto-start&#34; | &#34;auto&#34; | &#34;auto-end&#34; | &#34;top-start&#34; | &#34;top&#34; | &#34;top-end&#34; | &#34;right-start&#34; | &#34;right&#34; | &#34;right-end&#34; | &#34;bottom-end&#34; | &#34;bottom&#34; | &#34;bottom-start&#34; | &#34;left-end&#34; | &#34;left&#34; | &#34;left-start&#34;">&#34;auto-start&#34; | &#34;auto&#34; | &#34;auto-end&#34; | &#34;top-start...</code>

  Actual `placement`.

- **`hide`**
  <code>() =&#62; void</code>

  Changes the `visible` state to `false`

</details>

### `MenuItemCheckbox`

- **`disabled`**
  <code>boolean | undefined</code>

  Same as the HTML attribute.

- **`focusable`**
  <code>boolean | undefined</code>

  When an element is `disabled`, it may still be `focusable`. It works
similarly to `readOnly` on form elements. In this case, only
`aria-disabled` will be set.

- **`value`**
  <code>any</code>

  Checkbox's value is going to be used when multiple checkboxes share the
same state. Checking a checkbox with value will add it to the state
array.

- **`checked`**
  <code>boolean | undefined</code>

  Checkbox's checked state. If present, it's used instead of `state`.

- **`stopId`**
  <code>string | undefined</code>

  Element ID.

- **`name`**
  <code>string</code>

  MenuItemCheckbox's name as in `menu.values`.

<details><summary>18 state props</summary>

> These props are returned by the state hook. You can spread them into this component (`{...state}`) or pass them separately. You can also provide these props from your own state logic.

- **`state`**
  <code>boolean | any[] | &#34;indeterminate&#34;</code>

  Stores the state of the checkbox.
If checkboxes that share this state have defined a `value` prop, it's
going to be an array.

- **`setState`**
  <code title="(value: SetStateAction&#60;boolean | any[] | &#34;indeterminate&#34;&#62;) =&#62; void">(value: SetStateAction&#60;boolean | any[] | &#34;indet...</code>

  Sets `state`.

- **`orientation`**
  <code>&#34;horizontal&#34; | &#34;vertical&#34; | undefined</code>

  Defines the orientation of the rover list.

- **`unstable_moves`** <span title="Experimental">⚠️</span>
  <code>number</code>

  Stores the number of moves that have been made by calling `move`, `next`,
`previous`, `first` or `last`.

- **`currentId`**
  <code>string | null</code>

  The current focused element ID.

- **`first`**
  <code>() =&#62; void</code>

  Moves focus to the first element.

- **`last`**
  <code>() =&#62; void</code>

  Moves focus to the last element.

- **`stops`**
  <code>Stop[]</code>

  A list of element refs and IDs of the roving items.

- **`move`**
  <code>(id: string | null) =&#62; void</code>

  Moves focus to a given element ID.

- **`next`**
  <code>() =&#62; void</code>

  Moves focus to the next element.

- **`previous`**
  <code>() =&#62; void</code>

  Moves focus to the previous element.

- **`register`**
  <code>(id: string, ref: RefObject&#60;HTMLElement&#62;) =&#62; void</code>

  Registers the element ID and ref in the roving tab index list.

- **`unregister`**
  <code>(id: string) =&#62; void</code>

  Unregisters the roving item.

- **`visible`**
  <code>boolean</code>

  Whether it's visible or not.

- **`placement`**
  <code title="&#34;auto-start&#34; | &#34;auto&#34; | &#34;auto-end&#34; | &#34;top-start&#34; | &#34;top&#34; | &#34;top-end&#34; | &#34;right-start&#34; | &#34;right&#34; | &#34;right-end&#34; | &#34;bottom-end&#34; | &#34;bottom&#34; | &#34;bottom-start&#34; | &#34;left-end&#34; | &#34;left&#34; | &#34;left-start&#34;">&#34;auto-start&#34; | &#34;auto&#34; | &#34;auto-end&#34; | &#34;top-start...</code>

  Actual `placement`.

- **`hide`**
  <code>() =&#62; void</code>

  Changes the `visible` state to `false`

- **`unstable_values`** <span title="Experimental">⚠️</span>
  <code>{ [x: string]: any; }</code>

  Stores the values of radios and checkboxes within the menu.

- **`unstable_update`** <span title="Experimental">⚠️</span>
  <code>(name: string, value?: any) =&#62; void</code>

  Updates checkboxes and radios values within the menu.

</details>

### `MenuItemRadio`

- **`disabled`**
  <code>boolean | undefined</code>

  Same as the HTML attribute.

- **`focusable`**
  <code>boolean | undefined</code>

  When an element is `disabled`, it may still be `focusable`. It works
similarly to `readOnly` on form elements. In this case, only
`aria-disabled` will be set.

- **`stopId`**
  <code>string | undefined</code>

  Element ID.

- **`value`**
  <code>any</code>

  Same as the `value` attribute.

- **`checked`**
  <code>boolean | undefined</code>

  Same as the `checked` attribute.

- **`name`**
  <code>string</code>

  MenuItemRadio's name as in `menu.values`.

<details><summary>18 state props</summary>

> These props are returned by the state hook. You can spread them into this component (`{...state}`) or pass them separately. You can also provide these props from your own state logic.

- **`orientation`**
  <code>&#34;horizontal&#34; | &#34;vertical&#34; | undefined</code>

  Defines the orientation of the rover list.

- **`currentId`**
  <code>string | null</code>

  The current focused element ID.

- **`first`**
  <code>() =&#62; void</code>

  Moves focus to the first element.

- **`last`**
  <code>() =&#62; void</code>

  Moves focus to the last element.

- **`stops`**
  <code>Stop[]</code>

  A list of element refs and IDs of the roving items.

- **`move`**
  <code>(id: string | null) =&#62; void</code>

  Moves focus to a given element ID.

- **`next`**
  <code>() =&#62; void</code>

  Moves focus to the next element.

- **`previous`**
  <code>() =&#62; void</code>

  Moves focus to the previous element.

- **`unstable_moves`** <span title="Experimental">⚠️</span>
  <code>number</code>

  Stores the number of moves that have been made by calling `move`, `next`,
`previous`, `first` or `last`.

- **`register`**
  <code>(id: string, ref: RefObject&#60;HTMLElement&#62;) =&#62; void</code>

  Registers the element ID and ref in the roving tab index list.

- **`unregister`**
  <code>(id: string) =&#62; void</code>

  Unregisters the roving item.

- **`state`**
  <code>any</code>

  The `value` attribute of the current checked radio.

- **`setState`**
  <code>(value: any) =&#62; void</code>

  Sets `state`.

- **`visible`**
  <code>boolean</code>

  Whether it's visible or not.

- **`placement`**
  <code title="&#34;auto-start&#34; | &#34;auto&#34; | &#34;auto-end&#34; | &#34;top-start&#34; | &#34;top&#34; | &#34;top-end&#34; | &#34;right-start&#34; | &#34;right&#34; | &#34;right-end&#34; | &#34;bottom-end&#34; | &#34;bottom&#34; | &#34;bottom-start&#34; | &#34;left-end&#34; | &#34;left&#34; | &#34;left-start&#34;">&#34;auto-start&#34; | &#34;auto&#34; | &#34;auto-end&#34; | &#34;top-start...</code>

  Actual `placement`.

- **`hide`**
  <code>() =&#62; void</code>

  Changes the `visible` state to `false`

- **`unstable_values`** <span title="Experimental">⚠️</span>
  <code>{ [x: string]: any; }</code>

  Stores the values of radios and checkboxes within the menu.

- **`unstable_update`** <span title="Experimental">⚠️</span>
  <code>(name: string, value?: any) =&#62; void</code>

  Updates checkboxes and radios values within the menu.

</details>

### `MenuSeparator`

<details><summary>1 state props</summary>

> These props are returned by the state hook. You can spread them into this component (`{...state}`) or pass them separately. You can also provide these props from your own state logic.

- **`orientation`**
  <code>&#34;horizontal&#34; | &#34;vertical&#34; | undefined</code>

  Separator's orientation.

</details>
