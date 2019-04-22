---
path: /docs/tab
redirect_from:
  - /components/tabs
  - /components/tabs/tabscontainer
  - /components/tabs/tabsnext
  - /components/tabs/tabspanel
  - /components/tabs/tabsprevious
  - /components/tabs/tabstab
---

# Tab

`Tab` follows the [WAI-ARIA Tabs Pattern](https://www.w3.org/TR/wai-aria-practices/#tabpanel). It's a component that, when activated, display a `TabPanel`.

## Installation

```sh
npm install reakit
```

Learn more in [Get started](/docs/get-started).

## Usage

```jsx
import { useTabState, Tab, TabList, TabPanel } from "reakit/Tab";

function Example() {
  const tab = useTabState();
  return (
    <>
      <TabList {...tab}>
        <Tab stopId="tab1" {...tab}>
          Tab 1
        </Tab>
        <Tab stopId="tab2" disabled {...tab}>
          Tab 2
        </Tab>
        <Tab stopId="tab3" {...tab}>
          Tab 3
        </Tab>
      </TabList>
      <TabPanel stopId="tab1" {...tab}>
        Tab 1
      </TabPanel>
      <TabPanel stopId="tab2" {...tab}>
        Tab 2
      </TabPanel>
      <TabPanel stopId="tab3" {...tab}>
        Tab 3
      </TabPanel>
    </>
  );
}
```

### Vertical tabs with manual activation

```jsx
import { useTabState, Tab, TabList, TabPanel } from "reakit/Tab";

function Example() {
  const tab = useTabState({
    orientation: "vertical",
    manual: true,
    selectedId: "tab3"
  });
  return (
    <div style={{ display: "flex" }}>
      <TabList {...tab}>
        <Tab stopId="tab1" {...tab}>
          Tab 1
        </Tab>
        <Tab stopId="tab2" disabled {...tab}>
          Tab 2
        </Tab>
        <Tab stopId="tab3" {...tab}>
          Tab 3
        </Tab>
      </TabList>
      <TabPanel stopId="tab1" {...tab}>
        Tab 1
      </TabPanel>
      <TabPanel stopId="tab2" {...tab}>
        Tab 2
      </TabPanel>
      <TabPanel stopId="tab3" {...tab}>
        Tab 3
      </TabPanel>
    </div>
  );
}
```

## Accessibility

- `Tab` has role `tab`.
- `Tab` has `aria-controls` referring to its associated `TabPanel`.
- The selected `Tab` has `aria-selected` set to `true` and all other `Tab`s have it set to `false`.
- `Tab` extends the accessibility features of [Rover](/docs/rover#accessibility).
- `TabList` has role `tablist`.
- `TabList` has `aria-orientation` set to `vertical` or `horizontal` based on the value of the `orientation` option.
- `TabPanel` has role `tabpanel`.
- `TabPanel` has `aria-labelledby` referring to its associated `Tab`.

Learn more in [Accessibility](/docs/accessibility).

## Composition

- `Tab` uses [Rover](/docs/rover).
- `TabList` uses [Box](/docs/box).
- `TabPanel` uses [Hidden](/docs/hidden).

Learn more in [Composition](/docs/composition#props-hooks).

## Props

<!-- Automatically generated -->

### `useTabState`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>orientation</code>&nbsp;</strong> | <code title="&#34;horizontal&#34; &#124; &#34;vertical&#34; &#124; undefined">&#34;horizontal&#34;&nbsp;&#124;&nbsp;&#34;vertical&#34;&nbsp;&#124;...</code> | Defines the orientation of the rover list. |
| <strong><code>stops</code>&nbsp;</strong> | <code>Stop[]</code> | A list of element refs and IDs of the roving items. |
| <strong><code>currentId</code>&nbsp;</strong> | <code>string&nbsp;&#124;&nbsp;null</code> | The current focused element ID. |
| <strong><code>loop</code>&nbsp;</strong> | <code>boolean</code> | If enabled:<br>  - Jumps to the first item when moving next from the last item.<br>  - Jumps to the last item when moving previous from the first item. |
| <strong><code>selectedId</code>&nbsp;</strong> | <code>string&nbsp;&#124;&nbsp;null</code> | The current selected tab's `stopId`. |
| <strong><code>manual</code>&nbsp;</strong> | <code>boolean</code> | Whether the tab selection should be manual. |

### `Tab`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>disabled</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | Same as the HTML attribute. |
| <strong><code>focusable</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | When an element is `disabled`, it may still be `focusable`. It works similarly to `readOnly` on form elements. In this case, only `aria-disabled` will be set. |
| <strong><code>orientation</code>&nbsp;</strong> | <code title="&#34;horizontal&#34; &#124; &#34;vertical&#34; &#124; undefined">&#34;horizontal&#34;&nbsp;&#124;&nbsp;&#34;vertical&#34;&nbsp;&#124;...</code> | Defines the orientation of the rover list. |
| <strong><code>stops</code>&nbsp;</strong> | <code>Stop[]</code> | A list of element refs and IDs of the roving items. |
| <strong><code>currentId</code>&nbsp;</strong> | <code>string&nbsp;&#124;&nbsp;null</code> | The current focused element ID. |
| <strong><code>register</code>&nbsp;</strong> | <code title="(id: string, ref: RefObject&#60;HTMLElement&#62;) =&#62; void">(id:&nbsp;string,&nbsp;ref:&nbsp;RefObject...</code> | Registers the element ID and ref in the roving tab index list. |
| <strong><code>unregister</code>&nbsp;</strong> | <code>(id:&nbsp;string)&nbsp;=&#62;&nbsp;void</code> | Unregisters the roving item. |
| <strong><code>move</code>&nbsp;</strong> | <code>(id:&nbsp;string&nbsp;&#124;&nbsp;null)&nbsp;=&#62;&nbsp;void</code> | Moves focus to a given element ID. |
| <strong><code>next</code>&nbsp;</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Moves focus to the next element. |
| <strong><code>previous</code>&nbsp;</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Moves focus to the previous element. |
| <strong><code>first</code>&nbsp;</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Moves focus to the first element. |
| <strong><code>last</code>&nbsp;</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Moves focus to the last element. |
| <strong><code>stopId</code>&nbsp;</strong> | <code>string&nbsp;&#124;&nbsp;undefined</code> | Element ID. |
| <strong><code>manual</code>&nbsp;</strong> | <code>boolean</code> | Whether the tab selection should be manual. |
| <strong><code>selectedId</code>&nbsp;</strong> | <code>string&nbsp;&#124;&nbsp;null</code> | The current selected tab's `stopId`. |
| <strong><code>select</code>&nbsp;</strong> | <code>(id:&nbsp;string&nbsp;&#124;&nbsp;null)&nbsp;=&#62;&nbsp;void</code> | Selects a tab by its `stopId`. |

### `TabList`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>orientation</code>&nbsp;</strong> | <code title="&#34;horizontal&#34; &#124; &#34;vertical&#34; &#124; undefined">&#34;horizontal&#34;&nbsp;&#124;&nbsp;&#34;vertical&#34;&nbsp;&#124;...</code> | Defines the orientation of the rover list. |

### `TabPanel`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>visible</code>&nbsp;</strong> | <code>boolean</code> | Whether it's visible or not. |
| <strong><code>selectedId</code>&nbsp;</strong> | <code>string&nbsp;&#124;&nbsp;null</code> | The current selected tab's `stopId`. |
| <strong><code>stopId</code>&nbsp;</strong> | <code>string</code> | Tab's `stopId`. |
