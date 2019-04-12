---
path: /docs/menu
---

# Menu

## Usage

```jsx
import React from "react";
import {
  useMenuState,
  Menu,
  MenuDisclosure,
  MenuItem,
  MenuSeparator,
  MenuItemCheckbox,
  mergeProps
} from "reakit";

const Menu1 = React.forwardRef((props, ref) => {
  const menu = useMenuState();
  return (
    <>
      <MenuDisclosure {...props} {...menu} ref={ref}>
        Item 3
      </MenuDisclosure>
      <Menu {...menu}>
        <MenuItemCheckbox {...menu} name="accept">
          Accept
        </MenuItemCheckbox>
        <MenuItemCheckbox {...menu} name="fruits" value="apple">
          Apple
        </MenuItemCheckbox>
        <MenuItemCheckbox {...menu} name="fruits" value="orange">
          Orange
        </MenuItemCheckbox>
        <MenuSeparator {...menu} />
        <MenuItem {...menu}>Item 1</MenuItem>
        <MenuItem {...menu}>Item 2</MenuItem>
      </Menu>
    </>
  );
});

function Example() {
  const menu = useMenuState();
  return (
    <div style={{ margin: 150 }}>
      <MenuDisclosure {...menu}>disclosure</MenuDisclosure>
      <Menu aria-label="menu" {...menu}>
        <MenuItem {...menu}>Item 1</MenuItem>
        <MenuItem {...menu}>Item 2</MenuItem>
        <MenuItem {...menu}>{props => <Menu1 {...props} />}</MenuItem>
      </Menu>
    </div>
  );
}
```

```jsx
import React from "react";
import {
  useMenuState,
  Menu,
  MenuDisclosure,
  MenuItem,
  MenuSeparator,
  StaticMenu,
  MenuItemCheckbox,
  MenuItemRadio,
  mergeProps
} from "reakit";

const Menu1 = React.forwardRef((props, ref) => {
  const menu = useMenuState({ unstable_values: { language: "css" } });
  return (
    <>
      <MenuDisclosure {...props} {...menu} ref={ref}>
        Ghi
      </MenuDisclosure>
      <Menu {...menu}>
        <MenuItem {...menu}>Jkl</MenuItem>
        <MenuItem {...menu}>Jkld</MenuItem>
        <MenuItem {...menu}>Mno</MenuItem>
        <MenuItemRadio {...menu} name="language" value="html">
          HTML
        </MenuItemRadio>
        <MenuItemRadio {...menu} name="language" value="js">
          JS
        </MenuItemRadio>
        <MenuItemRadio {...menu} name="language" value="css">
          CSS
        </MenuItemRadio>
      </Menu>
    </>
  );
});

const Menu2 = React.forwardRef((props, ref) => {
  const menu = useMenuState();
  return (
    <>
      <MenuDisclosure {...props} {...menu} ref={ref}>
        Pqr
      </MenuDisclosure>
      <Menu {...menu}>
        <MenuItem {...menu}>Stu</MenuItem>
        <MenuItem {...menu}>Vwx</MenuItem>
        <MenuItem {...menu}>{p => <Menu1 {...p} />}</MenuItem>
        <MenuItemCheckbox {...menu} name="accept">
          Accept
        </MenuItemCheckbox>
        <MenuItemCheckbox {...menu} name="fruits" value="apple">
          Apple
        </MenuItemCheckbox>
        <MenuItemCheckbox {...menu} name="fruits" value="orange">
          Orange
        </MenuItemCheckbox>
      </Menu>
    </>
  );
});

function Example() {
  const menu = useMenuState({ orientation: "horizontal" });
  return (
    <div style={{ margin: 150 }}>
      <StaticMenu aria-label="menu" {...menu}>
        <MenuItem {...menu}>Abc</MenuItem>
        <MenuItem {...menu}>Def</MenuItem>
        <MenuSeparator {...menu} />
        <MenuItem {...menu}>{props => <Menu1 {...props} />}</MenuItem>
        <MenuItem {...menu}>{props => <Menu2 {...props} />}</MenuItem>
        <MenuItem {...menu}>Ded</MenuItem>
      </StaticMenu>
    </div>
  );
}
```

## Props

<!-- Automatically generated -->

### `useMenuState`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>orientation</code>&nbsp;</strong> | <code title="&#34;horizontal&#34; &#124; &#34;vertical&#34; &#124; undefined">&#34;horizontal&#34;&nbsp;&#124;&nbsp;&#34;vertical&#34;&nbsp;&#124;...</code> | Defines the orientation of the rover list. |
| <strong><code>unstable_currentId</code>&nbsp;⚠️</strong> | <code>string&nbsp;&#124;&nbsp;null</code> | The current focused element ID. |
| <strong><code>unstable_loop</code>&nbsp;⚠️</strong> | <code>boolean</code> | If enabled, the next item after the last one will be the first one. |
| <strong><code>visible</code>&nbsp;</strong> | <code>boolean</code> | Whether it's visible or not. |
| <strong><code>placement</code>&nbsp;</strong> | <code title="&#34;auto-start&#34; &#124; &#34;auto&#34; &#124; &#34;auto-end&#34; &#124; &#34;top-start&#34; &#124; &#34;top&#34; &#124; &#34;top-end&#34; &#124; &#34;right-start&#34; &#124; &#34;right&#34; &#124; &#34;right-end&#34; &#124; &#34;bottom-end&#34; &#124; &#34;bottom&#34; &#124; &#34;bottom-start&#34; &#124; &#34;left-end&#34; &#124; &#34;left&#34; &#124; &#34;left-start&#34;">&#34;auto&#x2011;start&#34;&nbsp;&#124;&nbsp;&#34;auto&#34;&nbsp;&#124;&nbsp;&#34;au...</code> | Actual `placement`. |
| <strong><code>unstable_flip</code>&nbsp;⚠️</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | Whether or not flip the popover. |
| <strong><code>unstable_shift</code>&nbsp;⚠️</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | Whether or not shift the popover. |
| <strong><code>unstable_gutter</code>&nbsp;⚠️</strong> | <code>number&nbsp;&#124;&nbsp;undefined</code> | Offset between the reference and the popover. |
| <strong><code>unstable_values</code>&nbsp;⚠️</strong> | <code>{&nbsp;[x:&nbsp;string]:&nbsp;any;&nbsp;}</code> | TODO: Description |

### `Menu`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>visible</code>&nbsp;</strong> | <code>boolean</code> | Whether it's visible or not. |
| <strong><code>hide</code>&nbsp;</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Changes the `visible` state to `false` |
| <strong><code>modal</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | Toggles Dialog's `modal` state.<br>  - Non-modal: `preventBodyScroll` doesn't work and focus is free.<br>  - Modal: `preventBodyScroll` is automatically enabled and focus is trapped within the dialog. |
| <strong><code>hideOnEsc</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | When enabled, user can hide the dialog by pressing `Escape`. |
| <strong><code>hideOnClickOutside</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | When enabled, user can hide the dialog by clicking outside it. |
| <strong><code>preventBodyScroll</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | When enabled, user can't scroll on body when the dialog is visible. This option doesn't work if the dialog isn't modal. |
| <strong><code>unstable_initialFocusRef</code>&nbsp;⚠️</strong> | <code title="RefObject&#60;HTMLElement&#62; &#124; undefined">RefObject&#60;HTMLElement&#62;&nbsp;&#124;&nbsp;un...</code> | The element that will be focused when the dialog shows. When not set, the first tabbable element within the dialog will be used. `autoFocusOnShow` disables it. |
| <strong><code>unstable_finalFocusRef</code>&nbsp;⚠️</strong> | <code title="RefObject&#60;HTMLElement&#62; &#124; undefined">RefObject&#60;HTMLElement&#62;&nbsp;&#124;&nbsp;un...</code> | The element that will be focused when the dialog hides. When not set, the disclosure component will be used. `autoFocusOnHide` disables it. |
| <strong><code>unstable_popoverRef</code>&nbsp;⚠️</strong> | <code>RefObject&#60;HTMLElement&nbsp;&#124;&nbsp;null&#62;</code> | The popover element. |
| <strong><code>orientation</code>&nbsp;</strong> | <code title="&#34;horizontal&#34; &#124; &#34;vertical&#34; &#124; undefined">&#34;horizontal&#34;&nbsp;&#124;&nbsp;&#34;vertical&#34;&nbsp;&#124;...</code> | Defines the orientation of the rover list. |
| <strong><code>unstable_stops</code>&nbsp;⚠️</strong> | <code>Stop[]</code> | A list of element refs and IDs of the roving items. |
| <strong><code>unstable_move</code>&nbsp;⚠️</strong> | <code>(id:&nbsp;string&nbsp;&#124;&nbsp;null)&nbsp;=&#62;&nbsp;void</code> | Moves focus onto a given element ID. |

### `MenuDisclosure`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>disabled</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | Same as the HTML attribute. |
| <strong><code>focusable</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | When an element is `disabled`, it may still be `focusable`. In this case, only `aria-disabled` will be set. |
| <strong><code>visible</code>&nbsp;</strong> | <code>boolean</code> | Whether it's visible or not. |
| <strong><code>toggle</code>&nbsp;</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Toggles the `visible` state |
| <strong><code>unstable_referenceRef</code>&nbsp;⚠️</strong> | <code>RefObject&#60;HTMLElement&nbsp;&#124;&nbsp;null&#62;</code> | The reference element. |
| <strong><code>placement</code>&nbsp;</strong> | <code title="&#34;auto-start&#34; &#124; &#34;auto&#34; &#124; &#34;auto-end&#34; &#124; &#34;top-start&#34; &#124; &#34;top&#34; &#124; &#34;top-end&#34; &#124; &#34;right-start&#34; &#124; &#34;right&#34; &#124; &#34;right-end&#34; &#124; &#34;bottom-end&#34; &#124; &#34;bottom&#34; &#124; &#34;bottom-start&#34; &#124; &#34;left-end&#34; &#124; &#34;left&#34; &#124; &#34;left-start&#34;">&#34;auto&#x2011;start&#34;&nbsp;&#124;&nbsp;&#34;auto&#34;&nbsp;&#124;&nbsp;&#34;au...</code> | Actual `placement`. |
| <strong><code>hide</code>&nbsp;</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Changes the `visible` state to `false` |
| <strong><code>unstable_first</code>&nbsp;⚠️</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Moves focus onto the first element. |
| <strong><code>unstable_last</code>&nbsp;⚠️</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Moves focus onto the last element. |
| <strong><code>show</code>&nbsp;</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Changes the `visible` state to `true` |

### `MenuGroup`

No props to show

### `MenuItem`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>disabled</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | Same as the HTML attribute. |
| <strong><code>focusable</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | When an element is `disabled`, it may still be `focusable`. In this case, only `aria-disabled` will be set. |
| <strong><code>orientation</code>&nbsp;</strong> | <code title="&#34;horizontal&#34; &#124; &#34;vertical&#34; &#124; undefined">&#34;horizontal&#34;&nbsp;&#124;&nbsp;&#34;vertical&#34;&nbsp;&#124;...</code> | Defines the orientation of the rover list. |
| <strong><code>unstable_currentId</code>&nbsp;⚠️</strong> | <code>string&nbsp;&#124;&nbsp;null</code> | The current focused element ID. |
| <strong><code>unstable_stops</code>&nbsp;⚠️</strong> | <code>Stop[]</code> | A list of element refs and IDs of the roving items. |
| <strong><code>unstable_move</code>&nbsp;⚠️</strong> | <code>(id:&nbsp;string&nbsp;&#124;&nbsp;null)&nbsp;=&#62;&nbsp;void</code> | Moves focus onto a given element ID. |
| <strong><code>unstable_register</code>&nbsp;⚠️</strong> | <code title="(id: string, ref: RefObject&#60;HTMLElement&#62;) =&#62; void">(id:&nbsp;string,&nbsp;ref:&nbsp;RefObject...</code> | Registers the element ID and ref in the roving tab index list. |
| <strong><code>unstable_unregister</code>&nbsp;⚠️</strong> | <code>(id:&nbsp;string)&nbsp;=&#62;&nbsp;void</code> | Unregisters the roving item. |
| <strong><code>unstable_next</code>&nbsp;⚠️</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Moves focus onto the next element. |
| <strong><code>unstable_previous</code>&nbsp;⚠️</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Moves focus onto the previous element. |
| <strong><code>unstable_first</code>&nbsp;⚠️</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Moves focus onto the first element. |
| <strong><code>unstable_last</code>&nbsp;⚠️</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Moves focus onto the last element. |
| <strong><code>stopId</code>&nbsp;</strong> | <code>string&nbsp;&#124;&nbsp;undefined</code> | Element ID. |
| <strong><code>placement</code>&nbsp;</strong> | <code title="&#34;auto-start&#34; &#124; &#34;auto&#34; &#124; &#34;auto-end&#34; &#124; &#34;top-start&#34; &#124; &#34;top&#34; &#124; &#34;top-end&#34; &#124; &#34;right-start&#34; &#124; &#34;right&#34; &#124; &#34;right-end&#34; &#124; &#34;bottom-end&#34; &#124; &#34;bottom&#34; &#124; &#34;bottom-start&#34; &#124; &#34;left-end&#34; &#124; &#34;left&#34; &#124; &#34;left-start&#34;">&#34;auto&#x2011;start&#34;&nbsp;&#124;&nbsp;&#34;auto&#34;&nbsp;&#124;&nbsp;&#34;au...</code> | Actual `placement`. |
| <strong><code>hide</code>&nbsp;</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Changes the `visible` state to `false` |

### `MenuItemCheckbox`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>disabled</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | Same as the HTML attribute. |
| <strong><code>focusable</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | When an element is `disabled`, it may still be `focusable`. In this case, only `aria-disabled` will be set. |
| <strong><code>currentValue</code>&nbsp;</strong> | <code title="boolean &#124; any[] &#124; &#34;indeterminate&#34;">boolean&nbsp;&#124;&nbsp;any[]&nbsp;&#124;&nbsp;&#34;indeterm...</code> | Stores the state of the checkbox. If checkboxes that share this state have defined a `value` prop, it's going to be an array. |
| <strong><code>setValue</code>&nbsp;</strong> | <code title="(value: SetStateAction&#60;boolean &#124; any[] &#124; &#34;indeterminate&#34;&#62;) =&#62; void">(value:&nbsp;SetStateAction&#60;bool...</code> | Sets `currentValue`. |
| <strong><code>value</code>&nbsp;</strong> | <code>any</code> | Checkbox's value is going to be used when multiple checkboxes share the same state. Checking a checkbox with value will add it to the state array. |
| <strong><code>checked</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | Checkbox's checked state. If present, it's used instead of currentValue. |
| <strong><code>orientation</code>&nbsp;</strong> | <code title="&#34;horizontal&#34; &#124; &#34;vertical&#34; &#124; undefined">&#34;horizontal&#34;&nbsp;&#124;&nbsp;&#34;vertical&#34;&nbsp;&#124;...</code> | Defines the orientation of the rover list. |
| <strong><code>unstable_currentId</code>&nbsp;⚠️</strong> | <code>string&nbsp;&#124;&nbsp;null</code> | The current focused element ID. |
| <strong><code>unstable_stops</code>&nbsp;⚠️</strong> | <code>Stop[]</code> | A list of element refs and IDs of the roving items. |
| <strong><code>unstable_move</code>&nbsp;⚠️</strong> | <code>(id:&nbsp;string&nbsp;&#124;&nbsp;null)&nbsp;=&#62;&nbsp;void</code> | Moves focus onto a given element ID. |
| <strong><code>unstable_register</code>&nbsp;⚠️</strong> | <code title="(id: string, ref: RefObject&#60;HTMLElement&#62;) =&#62; void">(id:&nbsp;string,&nbsp;ref:&nbsp;RefObject...</code> | Registers the element ID and ref in the roving tab index list. |
| <strong><code>unstable_unregister</code>&nbsp;⚠️</strong> | <code>(id:&nbsp;string)&nbsp;=&#62;&nbsp;void</code> | Unregisters the roving item. |
| <strong><code>unstable_next</code>&nbsp;⚠️</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Moves focus onto the next element. |
| <strong><code>unstable_previous</code>&nbsp;⚠️</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Moves focus onto the previous element. |
| <strong><code>unstable_first</code>&nbsp;⚠️</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Moves focus onto the first element. |
| <strong><code>unstable_last</code>&nbsp;⚠️</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Moves focus onto the last element. |
| <strong><code>stopId</code>&nbsp;</strong> | <code>string&nbsp;&#124;&nbsp;undefined</code> | Element ID. |
| <strong><code>placement</code>&nbsp;</strong> | <code title="&#34;auto-start&#34; &#124; &#34;auto&#34; &#124; &#34;auto-end&#34; &#124; &#34;top-start&#34; &#124; &#34;top&#34; &#124; &#34;top-end&#34; &#124; &#34;right-start&#34; &#124; &#34;right&#34; &#124; &#34;right-end&#34; &#124; &#34;bottom-end&#34; &#124; &#34;bottom&#34; &#124; &#34;bottom-start&#34; &#124; &#34;left-end&#34; &#124; &#34;left&#34; &#124; &#34;left-start&#34;">&#34;auto&#x2011;start&#34;&nbsp;&#124;&nbsp;&#34;auto&#34;&nbsp;&#124;&nbsp;&#34;au...</code> | Actual `placement`. |
| <strong><code>hide</code>&nbsp;</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Changes the `visible` state to `false` |
| <strong><code>unstable_values</code>&nbsp;⚠️</strong> | <code>{&nbsp;[x:&nbsp;string]:&nbsp;any;&nbsp;}</code> | TODO: Description |
| <strong><code>unstable_update</code>&nbsp;⚠️</strong> | <code title="(name: string, value?: any) =&#62; void">(name:&nbsp;string,&nbsp;value?:&nbsp;any)...</code> | TODO: Description |
| <strong><code>name</code>&nbsp;</strong> | <code>string</code> | TODO: Description |

### `MenuItemRadio`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>disabled</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | Same as the HTML attribute. |
| <strong><code>focusable</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | When an element is `disabled`, it may still be `focusable`. In this case, only `aria-disabled` will be set. |
| <strong><code>orientation</code>&nbsp;</strong> | <code title="&#34;horizontal&#34; &#124; &#34;vertical&#34; &#124; undefined">&#34;horizontal&#34;&nbsp;&#124;&nbsp;&#34;vertical&#34;&nbsp;&#124;...</code> | Defines the orientation of the rover list. |
| <strong><code>unstable_currentId</code>&nbsp;⚠️</strong> | <code>string&nbsp;&#124;&nbsp;null</code> | The current focused element ID. |
| <strong><code>unstable_stops</code>&nbsp;⚠️</strong> | <code>Stop[]</code> | A list of element refs and IDs of the roving items. |
| <strong><code>unstable_move</code>&nbsp;⚠️</strong> | <code>(id:&nbsp;string&nbsp;&#124;&nbsp;null)&nbsp;=&#62;&nbsp;void</code> | Moves focus onto a given element ID. |
| <strong><code>unstable_register</code>&nbsp;⚠️</strong> | <code title="(id: string, ref: RefObject&#60;HTMLElement&#62;) =&#62; void">(id:&nbsp;string,&nbsp;ref:&nbsp;RefObject...</code> | Registers the element ID and ref in the roving tab index list. |
| <strong><code>unstable_unregister</code>&nbsp;⚠️</strong> | <code>(id:&nbsp;string)&nbsp;=&#62;&nbsp;void</code> | Unregisters the roving item. |
| <strong><code>unstable_next</code>&nbsp;⚠️</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Moves focus onto the next element. |
| <strong><code>unstable_previous</code>&nbsp;⚠️</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Moves focus onto the previous element. |
| <strong><code>unstable_first</code>&nbsp;⚠️</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Moves focus onto the first element. |
| <strong><code>unstable_last</code>&nbsp;⚠️</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Moves focus onto the last element. |
| <strong><code>stopId</code>&nbsp;</strong> | <code>string&nbsp;&#124;&nbsp;undefined</code> | Element ID. |
| <strong><code>currentValue</code>&nbsp;</strong> | <code>any</code> | The `value` attribute of the current checked radio. |
| <strong><code>setValue</code>&nbsp;</strong> | <code>(value:&nbsp;any)&nbsp;=&#62;&nbsp;void</code> | Changes the `currentValue` state. |
| <strong><code>value</code>&nbsp;</strong> | <code>any</code> | Same as the `value` attribute. |
| <strong><code>checked</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | Same as the `checked` attribute. |
| <strong><code>placement</code>&nbsp;</strong> | <code title="&#34;auto-start&#34; &#124; &#34;auto&#34; &#124; &#34;auto-end&#34; &#124; &#34;top-start&#34; &#124; &#34;top&#34; &#124; &#34;top-end&#34; &#124; &#34;right-start&#34; &#124; &#34;right&#34; &#124; &#34;right-end&#34; &#124; &#34;bottom-end&#34; &#124; &#34;bottom&#34; &#124; &#34;bottom-start&#34; &#124; &#34;left-end&#34; &#124; &#34;left&#34; &#124; &#34;left-start&#34;">&#34;auto&#x2011;start&#34;&nbsp;&#124;&nbsp;&#34;auto&#34;&nbsp;&#124;&nbsp;&#34;au...</code> | Actual `placement`. |
| <strong><code>hide</code>&nbsp;</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Changes the `visible` state to `false` |
| <strong><code>unstable_values</code>&nbsp;⚠️</strong> | <code>{&nbsp;[x:&nbsp;string]:&nbsp;any;&nbsp;}</code> | TODO: Description |
| <strong><code>unstable_update</code>&nbsp;⚠️</strong> | <code title="(name: string, value?: any) =&#62; void">(name:&nbsp;string,&nbsp;value?:&nbsp;any)...</code> | TODO: Description |
| <strong><code>name</code>&nbsp;</strong> | <code>string</code> | TODO: Description |

### `MenuSeparator`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>orientation</code>&nbsp;</strong> | <code title="&#34;horizontal&#34; &#124; &#34;vertical&#34; &#124; undefined">&#34;horizontal&#34;&nbsp;&#124;&nbsp;&#34;vertical&#34;&nbsp;&#124;...</code> | Separator's context orientation. The actual separator's oriention will be flipped based on this prop. So a `"vertical"` orientation means that the separator will have a `"horizontal"` orientation. |

### `StaticMenu`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>orientation</code>&nbsp;</strong> | <code title="&#34;horizontal&#34; &#124; &#34;vertical&#34; &#124; undefined">&#34;horizontal&#34;&nbsp;&#124;&nbsp;&#34;vertical&#34;&nbsp;&#124;...</code> | Defines the orientation of the rover list. |
| <strong><code>unstable_stops</code>&nbsp;⚠️</strong> | <code>Stop[]</code> | A list of element refs and IDs of the roving items. |
| <strong><code>unstable_move</code>&nbsp;⚠️</strong> | <code>(id:&nbsp;string&nbsp;&#124;&nbsp;null)&nbsp;=&#62;&nbsp;void</code> | Moves focus onto a given element ID. |
