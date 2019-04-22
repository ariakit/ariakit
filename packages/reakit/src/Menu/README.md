---
path: /docs/menu
---

# Menu

`Menu` follows the [WAI-ARIA Menu or Menu bar Pattern](https://www.w3.org/TR/wai-aria-practices/#menu). It also includes a `MenuDisclosure` component that follows the [WAI-ARIA Menu Button Pattern](https://www.w3.org/TR/wai-aria-practices/#menubutton).

## Installation

```sh
npm install reakit
```

Learn more in [Get started](/docs/get-started).

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

### Submenu

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
      <DialogBackdrop {...dialog} style={{ background: "transparent" }} />
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

```jsx
import React from "react";
import {
  useMenuState,
  Menu,
  MenuDisclosure,
  MenuItem,
  MenuSeparator,
  StaticMenu,
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
  const menu = useMenuState({ orientation: "horizontal" });
  return (
    <StaticMenu {...menu}>
      <MenuItem {...menu} as={FileMenu} />
      <MenuItem {...menu} as={EditMenu} />
      <MenuItem {...menu} as={ViewMenu} />
    </StaticMenu>
  );
}
```

## Accessibility

- `StaticMenu` and `Menu` have either role `menu` or `menubar` depending on the value of the `orientation` option (when it's `horizontal` it becomes `menubar`).
- `MenuDisclosure` extends the accessibility features of [PopoverDisclosure](/docs/popover#accessibility), which means it sets `aria-haspopup` and `aria-expanded` attributes accordingly.
- `MenuItem` has role `menuitem`.
- `MenuItem` extends the accessibility features of [Rover](/docs/rover), which means it uses the [roving tabindex](https://www.w3.org/TR/wai-aria-practices-1.1/#kbd_roving_tabindex) method to manage focus.
- `MenuItemCheckbox` has role `menuitemcheckbox`.
- `MenuItemRadio` has role `menuitemradio`.
- Pressing <kbd>Enter</kbd> on `MenuDisclosure` opens its menu (or submenu) and places focus on its first item.
- Pressing <kbd>Space</kbd> on `MenuItemCheckbox` changes the state without closing `Menu`.
- Pressing <kbd>Space</kbd> on a `MenuItemRadio` that is not checked, without closing `Menu`, checks the focused `MenuItemRadio` and unchecks any other checked `MenuItemRadio` in the same group.
- Pressing any key that corresponds to a printable character moves focus to the next `MenuItem` in the current `Menu` or `StaticMenu` whose label begins with that printable character.

Learn more in [Accessibility](/docs/accessibility).

## Composition

- `Menu` uses `StaticMenu` and [Popover](/docs/popover).
- `MenuDisclosure` uses [PopoverDisclosure](/docs/popover).
- `MenuGroup` uses [Box](/docs/box).
- `MenuItem` uses [Rover](/docs/rover).
- `MenuItemCheckbox` uses [Checkbox](/docs/checkbox).
- `MenuItemRadio` uses [Radio](/docs/radio).
- `MenuSeparator` uses [Separator](/docs/separator).
- `StaticMenu` uses [Box](/docs/box).

Learn more in [Composition](/docs/composition#props-hooks).

## Props

<!-- Automatically generated -->

### `useMenuState`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>orientation</code>&nbsp;</strong> | <code title="&#34;horizontal&#34; &#124; &#34;vertical&#34; &#124; undefined">&#34;horizontal&#34;&nbsp;&#124;&nbsp;&#34;vertical&#34;&nbsp;&#124;...</code> | Defines the orientation of the rover list. |
| <strong><code>currentId</code>&nbsp;</strong> | <code>string&nbsp;&#124;&nbsp;null</code> | The current focused element ID. |
| <strong><code>loop</code>&nbsp;</strong> | <code>boolean</code> | If enabled:<br>  - Jumps to the first item when moving next from the last item.<br>  - Jumps to the last item when moving previous from the first item. |
| <strong><code>visible</code>&nbsp;</strong> | <code>boolean</code> | Whether it's visible or not. |
| <strong><code>placement</code>&nbsp;</strong> | <code title="&#34;auto-start&#34; &#124; &#34;auto&#34; &#124; &#34;auto-end&#34; &#124; &#34;top-start&#34; &#124; &#34;top&#34; &#124; &#34;top-end&#34; &#124; &#34;right-start&#34; &#124; &#34;right&#34; &#124; &#34;right-end&#34; &#124; &#34;bottom-end&#34; &#124; &#34;bottom&#34; &#124; &#34;bottom-start&#34; &#124; &#34;left-end&#34; &#124; &#34;left&#34; &#124; &#34;left-start&#34;">&#34;auto&#x2011;start&#34;&nbsp;&#124;&nbsp;&#34;auto&#34;&nbsp;&#124;&nbsp;&#34;au...</code> | Actual `placement`. |
| <strong><code>unstable_flip</code>&nbsp;⚠️</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | Whether or not flip the popover. |
| <strong><code>unstable_shift</code>&nbsp;⚠️</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | Whether or not shift the popover. |
| <strong><code>unstable_gutter</code>&nbsp;⚠️</strong> | <code>number&nbsp;&#124;&nbsp;undefined</code> | Offset between the reference and the popover. |
| <strong><code>unstable_values</code>&nbsp;⚠️</strong> | <code>{&nbsp;[x:&nbsp;string]:&nbsp;any;&nbsp;}</code> | Stores the values of radios and checkboxes within the menu. |

### `Menu`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>visible</code>&nbsp;</strong> | <code>boolean</code> | Whether it's visible or not. |
| <strong><code>hide</code>&nbsp;</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Changes the `visible` state to `false` |
| <strong><code>hideOnClickOutside</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | When enabled, user can hide the dialog by clicking outside it. |
| <strong><code>preventBodyScroll</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | When enabled, user can't scroll on body when the dialog is visible. This option doesn't work if the dialog isn't modal. |
| <strong><code>unstable_initialFocusRef</code>&nbsp;⚠️</strong> | <code title="RefObject&#60;HTMLElement&#62; &#124; undefined">RefObject&#60;HTMLElement&#62;&nbsp;&#124;&nbsp;un...</code> | The element that will be focused when the dialog shows. When not set, the first tabbable element within the dialog will be used. `autoFocusOnShow` disables it. |
| <strong><code>unstable_finalFocusRef</code>&nbsp;⚠️</strong> | <code title="RefObject&#60;HTMLElement&#62; &#124; undefined">RefObject&#60;HTMLElement&#62;&nbsp;&#124;&nbsp;un...</code> | The element that will be focused when the dialog hides. When not set, the disclosure component will be used. `autoFocusOnHide` disables it. |
| <strong><code>orientation</code>&nbsp;</strong> | <code title="&#34;horizontal&#34; &#124; &#34;vertical&#34; &#124; undefined">&#34;horizontal&#34;&nbsp;&#124;&nbsp;&#34;vertical&#34;&nbsp;&#124;...</code> | Defines the orientation of the rover list. |
| <strong><code>stops</code>&nbsp;</strong> | <code>Stop[]</code> | A list of element refs and IDs of the roving items. |
| <strong><code>move</code>&nbsp;</strong> | <code>(id:&nbsp;string&nbsp;&#124;&nbsp;null)&nbsp;=&#62;&nbsp;void</code> | Moves focus to a given element ID. |
| <strong><code>next</code>&nbsp;</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Moves focus to the next element. |
| <strong><code>previous</code>&nbsp;</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Moves focus to the previous element. |

### `MenuDisclosure`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>disabled</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | Same as the HTML attribute. |
| <strong><code>focusable</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | When an element is `disabled`, it may still be `focusable`. It works similarly to `readOnly` on form elements. In this case, only `aria-disabled` will be set. |
| <strong><code>visible</code>&nbsp;</strong> | <code>boolean</code> | Whether it's visible or not. |
| <strong><code>toggle</code>&nbsp;</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Toggles the `visible` state |
| <strong><code>unstable_referenceRef</code>&nbsp;⚠️</strong> | <code>RefObject&#60;HTMLElement&nbsp;&#124;&nbsp;null&#62;</code> | The reference element. |
| <strong><code>placement</code>&nbsp;</strong> | <code title="&#34;auto-start&#34; &#124; &#34;auto&#34; &#124; &#34;auto-end&#34; &#124; &#34;top-start&#34; &#124; &#34;top&#34; &#124; &#34;top-end&#34; &#124; &#34;right-start&#34; &#124; &#34;right&#34; &#124; &#34;right-end&#34; &#124; &#34;bottom-end&#34; &#124; &#34;bottom&#34; &#124; &#34;bottom-start&#34; &#124; &#34;left-end&#34; &#124; &#34;left&#34; &#124; &#34;left-start&#34;">&#34;auto&#x2011;start&#34;&nbsp;&#124;&nbsp;&#34;auto&#34;&nbsp;&#124;&nbsp;&#34;au...</code> | Actual `placement`. |
| <strong><code>hide</code>&nbsp;</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Changes the `visible` state to `false` |
| <strong><code>first</code>&nbsp;</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Moves focus to the first element. |
| <strong><code>last</code>&nbsp;</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Moves focus to the last element. |
| <strong><code>show</code>&nbsp;</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Changes the `visible` state to `true` |

### `MenuGroup`

No props to show

### `MenuItem`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>disabled</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | Same as the HTML attribute. |
| <strong><code>focusable</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | When an element is `disabled`, it may still be `focusable`. It works similarly to `readOnly` on form elements. In this case, only `aria-disabled` will be set. |
| <strong><code>orientation</code>&nbsp;</strong> | <code title="&#34;horizontal&#34; &#124; &#34;vertical&#34; &#124; undefined">&#34;horizontal&#34;&nbsp;&#124;&nbsp;&#34;vertical&#34;&nbsp;&#124;...</code> | Defines the orientation of the rover list. |
| <strong><code>currentId</code>&nbsp;</strong> | <code>string&nbsp;&#124;&nbsp;null</code> | The current focused element ID. |
| <strong><code>stops</code>&nbsp;</strong> | <code>Stop[]</code> | A list of element refs and IDs of the roving items. |
| <strong><code>move</code>&nbsp;</strong> | <code>(id:&nbsp;string&nbsp;&#124;&nbsp;null)&nbsp;=&#62;&nbsp;void</code> | Moves focus to a given element ID. |
| <strong><code>next</code>&nbsp;</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Moves focus to the next element. |
| <strong><code>previous</code>&nbsp;</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Moves focus to the previous element. |
| <strong><code>register</code>&nbsp;</strong> | <code title="(id: string, ref: RefObject&#60;HTMLElement&#62;) =&#62; void">(id:&nbsp;string,&nbsp;ref:&nbsp;RefObject...</code> | Registers the element ID and ref in the roving tab index list. |
| <strong><code>unregister</code>&nbsp;</strong> | <code>(id:&nbsp;string)&nbsp;=&#62;&nbsp;void</code> | Unregisters the roving item. |
| <strong><code>first</code>&nbsp;</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Moves focus to the first element. |
| <strong><code>last</code>&nbsp;</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Moves focus to the last element. |
| <strong><code>stopId</code>&nbsp;</strong> | <code>string&nbsp;&#124;&nbsp;undefined</code> | Element ID. |
| <strong><code>placement</code>&nbsp;</strong> | <code title="&#34;auto-start&#34; &#124; &#34;auto&#34; &#124; &#34;auto-end&#34; &#124; &#34;top-start&#34; &#124; &#34;top&#34; &#124; &#34;top-end&#34; &#124; &#34;right-start&#34; &#124; &#34;right&#34; &#124; &#34;right-end&#34; &#124; &#34;bottom-end&#34; &#124; &#34;bottom&#34; &#124; &#34;bottom-start&#34; &#124; &#34;left-end&#34; &#124; &#34;left&#34; &#124; &#34;left-start&#34;">&#34;auto&#x2011;start&#34;&nbsp;&#124;&nbsp;&#34;auto&#34;&nbsp;&#124;&nbsp;&#34;au...</code> | Actual `placement`. |
| <strong><code>hide</code>&nbsp;</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Changes the `visible` state to `false` |

### `MenuItemCheckbox`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>disabled</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | Same as the HTML attribute. |
| <strong><code>focusable</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | When an element is `disabled`, it may still be `focusable`. It works similarly to `readOnly` on form elements. In this case, only `aria-disabled` will be set. |
| <strong><code>value</code>&nbsp;</strong> | <code>any</code> | Checkbox's value is going to be used when multiple checkboxes share the same state. Checking a checkbox with value will add it to the state array. |
| <strong><code>checked</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | Checkbox's checked state. If present, it's used instead of currentValue. |
| <strong><code>orientation</code>&nbsp;</strong> | <code title="&#34;horizontal&#34; &#124; &#34;vertical&#34; &#124; undefined">&#34;horizontal&#34;&nbsp;&#124;&nbsp;&#34;vertical&#34;&nbsp;&#124;...</code> | Defines the orientation of the rover list. |
| <strong><code>currentId</code>&nbsp;</strong> | <code>string&nbsp;&#124;&nbsp;null</code> | The current focused element ID. |
| <strong><code>stops</code>&nbsp;</strong> | <code>Stop[]</code> | A list of element refs and IDs of the roving items. |
| <strong><code>move</code>&nbsp;</strong> | <code>(id:&nbsp;string&nbsp;&#124;&nbsp;null)&nbsp;=&#62;&nbsp;void</code> | Moves focus to a given element ID. |
| <strong><code>next</code>&nbsp;</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Moves focus to the next element. |
| <strong><code>previous</code>&nbsp;</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Moves focus to the previous element. |
| <strong><code>register</code>&nbsp;</strong> | <code title="(id: string, ref: RefObject&#60;HTMLElement&#62;) =&#62; void">(id:&nbsp;string,&nbsp;ref:&nbsp;RefObject...</code> | Registers the element ID and ref in the roving tab index list. |
| <strong><code>unregister</code>&nbsp;</strong> | <code>(id:&nbsp;string)&nbsp;=&#62;&nbsp;void</code> | Unregisters the roving item. |
| <strong><code>first</code>&nbsp;</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Moves focus to the first element. |
| <strong><code>last</code>&nbsp;</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Moves focus to the last element. |
| <strong><code>stopId</code>&nbsp;</strong> | <code>string&nbsp;&#124;&nbsp;undefined</code> | Element ID. |
| <strong><code>placement</code>&nbsp;</strong> | <code title="&#34;auto-start&#34; &#124; &#34;auto&#34; &#124; &#34;auto-end&#34; &#124; &#34;top-start&#34; &#124; &#34;top&#34; &#124; &#34;top-end&#34; &#124; &#34;right-start&#34; &#124; &#34;right&#34; &#124; &#34;right-end&#34; &#124; &#34;bottom-end&#34; &#124; &#34;bottom&#34; &#124; &#34;bottom-start&#34; &#124; &#34;left-end&#34; &#124; &#34;left&#34; &#124; &#34;left-start&#34;">&#34;auto&#x2011;start&#34;&nbsp;&#124;&nbsp;&#34;auto&#34;&nbsp;&#124;&nbsp;&#34;au...</code> | Actual `placement`. |
| <strong><code>hide</code>&nbsp;</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Changes the `visible` state to `false` |
| <strong><code>unstable_values</code>&nbsp;⚠️</strong> | <code>{&nbsp;[x:&nbsp;string]:&nbsp;any;&nbsp;}</code> | Stores the values of radios and checkboxes within the menu. |
| <strong><code>unstable_update</code>&nbsp;⚠️</strong> | <code title="(name: string, value?: any) =&#62; void">(name:&nbsp;string,&nbsp;value?:&nbsp;any)...</code> | Updates checkboxes and radios values within the menu. |
| <strong><code>name</code>&nbsp;</strong> | <code>string</code> | MenuItemCheckbox's name as in `menu.values`. |

### `MenuItemRadio`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>disabled</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | Same as the HTML attribute. |
| <strong><code>focusable</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | When an element is `disabled`, it may still be `focusable`. It works similarly to `readOnly` on form elements. In this case, only `aria-disabled` will be set. |
| <strong><code>orientation</code>&nbsp;</strong> | <code title="&#34;horizontal&#34; &#124; &#34;vertical&#34; &#124; undefined">&#34;horizontal&#34;&nbsp;&#124;&nbsp;&#34;vertical&#34;&nbsp;&#124;...</code> | Defines the orientation of the rover list. |
| <strong><code>currentId</code>&nbsp;</strong> | <code>string&nbsp;&#124;&nbsp;null</code> | The current focused element ID. |
| <strong><code>stops</code>&nbsp;</strong> | <code>Stop[]</code> | A list of element refs and IDs of the roving items. |
| <strong><code>move</code>&nbsp;</strong> | <code>(id:&nbsp;string&nbsp;&#124;&nbsp;null)&nbsp;=&#62;&nbsp;void</code> | Moves focus to a given element ID. |
| <strong><code>next</code>&nbsp;</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Moves focus to the next element. |
| <strong><code>previous</code>&nbsp;</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Moves focus to the previous element. |
| <strong><code>register</code>&nbsp;</strong> | <code title="(id: string, ref: RefObject&#60;HTMLElement&#62;) =&#62; void">(id:&nbsp;string,&nbsp;ref:&nbsp;RefObject...</code> | Registers the element ID and ref in the roving tab index list. |
| <strong><code>unregister</code>&nbsp;</strong> | <code>(id:&nbsp;string)&nbsp;=&#62;&nbsp;void</code> | Unregisters the roving item. |
| <strong><code>first</code>&nbsp;</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Moves focus to the first element. |
| <strong><code>last</code>&nbsp;</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Moves focus to the last element. |
| <strong><code>stopId</code>&nbsp;</strong> | <code>string&nbsp;&#124;&nbsp;undefined</code> | Element ID. |
| <strong><code>currentValue</code>&nbsp;</strong> | <code>any</code> | The `value` attribute of the current checked radio. |
| <strong><code>setValue</code>&nbsp;</strong> | <code>(value:&nbsp;any)&nbsp;=&#62;&nbsp;void</code> | Changes the `currentValue` state. |
| <strong><code>value</code>&nbsp;</strong> | <code>any</code> | Same as the `value` attribute. |
| <strong><code>checked</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | Same as the `checked` attribute. |
| <strong><code>placement</code>&nbsp;</strong> | <code title="&#34;auto-start&#34; &#124; &#34;auto&#34; &#124; &#34;auto-end&#34; &#124; &#34;top-start&#34; &#124; &#34;top&#34; &#124; &#34;top-end&#34; &#124; &#34;right-start&#34; &#124; &#34;right&#34; &#124; &#34;right-end&#34; &#124; &#34;bottom-end&#34; &#124; &#34;bottom&#34; &#124; &#34;bottom-start&#34; &#124; &#34;left-end&#34; &#124; &#34;left&#34; &#124; &#34;left-start&#34;">&#34;auto&#x2011;start&#34;&nbsp;&#124;&nbsp;&#34;auto&#34;&nbsp;&#124;&nbsp;&#34;au...</code> | Actual `placement`. |
| <strong><code>hide</code>&nbsp;</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Changes the `visible` state to `false` |
| <strong><code>unstable_values</code>&nbsp;⚠️</strong> | <code>{&nbsp;[x:&nbsp;string]:&nbsp;any;&nbsp;}</code> | Stores the values of radios and checkboxes within the menu. |
| <strong><code>unstable_update</code>&nbsp;⚠️</strong> | <code title="(name: string, value?: any) =&#62; void">(name:&nbsp;string,&nbsp;value?:&nbsp;any)...</code> | Updates checkboxes and radios values within the menu. |
| <strong><code>name</code>&nbsp;</strong> | <code>string</code> | MenuItemRadio's name as in `menu.values`. |

### `MenuSeparator`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>orientation</code>&nbsp;</strong> | <code title="&#34;horizontal&#34; &#124; &#34;vertical&#34; &#124; undefined">&#34;horizontal&#34;&nbsp;&#124;&nbsp;&#34;vertical&#34;&nbsp;&#124;...</code> | Separator's context orientation. The actual separator's orientation will be flipped based on this prop. So a `"vertical"` orientation means that the separator will have a `"horizontal"` orientation. |

### `StaticMenu`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>orientation</code>&nbsp;</strong> | <code title="&#34;horizontal&#34; &#124; &#34;vertical&#34; &#124; undefined">&#34;horizontal&#34;&nbsp;&#124;&nbsp;&#34;vertical&#34;&nbsp;&#124;...</code> | Defines the orientation of the rover list. |
| <strong><code>stops</code>&nbsp;</strong> | <code>Stop[]</code> | A list of element refs and IDs of the roving items. |
| <strong><code>move</code>&nbsp;</strong> | <code>(id:&nbsp;string&nbsp;&#124;&nbsp;null)&nbsp;=&#62;&nbsp;void</code> | Moves focus to a given element ID. |
| <strong><code>next</code>&nbsp;</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Moves focus to the next element. |
| <strong><code>previous</code>&nbsp;</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Moves focus to the previous element. |
