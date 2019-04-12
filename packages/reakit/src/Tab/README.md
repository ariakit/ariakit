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

## Usage

```jsx
import { useTabState, Tab, TabList, TabPanel } from "reakit";

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

```jsx
import { useTabState, Tab, TabList, TabPanel } from "reakit";

function Example() {
  const tab = useTabState({
    orientation: "vertical",
    manual: true,
    selectedId: "tab2"
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

## Props

<!-- Automatically generated -->

### `useTabState`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>orientation</code>&nbsp;</strong> | <code title="&#34;horizontal&#34; &#124; &#34;vertical&#34; &#124; undefined">&#34;horizontal&#34;&nbsp;&#124;&nbsp;&#34;vertical&#34;&nbsp;&#124;...</code> | Defines the orientation of the rover list. |
| <strong><code>unstable_stops</code>&nbsp;⚠️</strong> | <code>Stop[]</code> | A list of element refs and IDs of the roving items. |
| <strong><code>currentId</code>&nbsp;</strong> | <code>string&nbsp;&#124;&nbsp;null</code> | The current focused element ID. |
| <strong><code>loop</code>&nbsp;</strong> | <code>boolean</code> | If enabled, the next item after the last one will be the first one. |
| <strong><code>selectedId</code>&nbsp;</strong> | <code>string&nbsp;&#124;&nbsp;null</code> | TODO: Description |
| <strong><code>manual</code>&nbsp;</strong> | <code>boolean</code> | TODO: Description |

### `Tab`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>disabled</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | Same as the HTML attribute. |
| <strong><code>focusable</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | When an element is `disabled`, it may still be `focusable`. In this case, only `aria-disabled` will be set. |
| <strong><code>orientation</code>&nbsp;</strong> | <code title="&#34;horizontal&#34; &#124; &#34;vertical&#34; &#124; undefined">&#34;horizontal&#34;&nbsp;&#124;&nbsp;&#34;vertical&#34;&nbsp;&#124;...</code> | Defines the orientation of the rover list. |
| <strong><code>unstable_stops</code>&nbsp;⚠️</strong> | <code>Stop[]</code> | A list of element refs and IDs of the roving items. |
| <strong><code>currentId</code>&nbsp;</strong> | <code>string&nbsp;&#124;&nbsp;null</code> | The current focused element ID. |
| <strong><code>unstable_register</code>&nbsp;⚠️</strong> | <code title="(id: string, ref: RefObject&#60;HTMLElement&#62;) =&#62; void">(id:&nbsp;string,&nbsp;ref:&nbsp;RefObject...</code> | Registers the element ID and ref in the roving tab index list. |
| <strong><code>unstable_unregister</code>&nbsp;⚠️</strong> | <code>(id:&nbsp;string)&nbsp;=&#62;&nbsp;void</code> | Unregisters the roving item. |
| <strong><code>move</code>&nbsp;</strong> | <code>(id:&nbsp;string&nbsp;&#124;&nbsp;null)&nbsp;=&#62;&nbsp;void</code> | Moves focus onto a given element ID. |
| <strong><code>next</code>&nbsp;</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Moves focus onto the next element. |
| <strong><code>previous</code>&nbsp;</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Moves focus onto the previous element. |
| <strong><code>first</code>&nbsp;</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Moves focus onto the first element. |
| <strong><code>last</code>&nbsp;</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Moves focus onto the last element. |
| <strong><code>stopId</code>&nbsp;</strong> | <code>string&nbsp;&#124;&nbsp;undefined</code> | Element ID. |
| <strong><code>manual</code>&nbsp;</strong> | <code>boolean</code> | TODO: Description |
| <strong><code>selectedId</code>&nbsp;</strong> | <code>string&nbsp;&#124;&nbsp;null</code> | TODO: Description |
| <strong><code>select</code>&nbsp;</strong> | <code>(id:&nbsp;string&nbsp;&#124;&nbsp;null)&nbsp;=&#62;&nbsp;void</code> | TODO: Description |

### `TabList`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>orientation</code>&nbsp;</strong> | <code title="&#34;horizontal&#34; &#124; &#34;vertical&#34; &#124; undefined">&#34;horizontal&#34;&nbsp;&#124;&nbsp;&#34;vertical&#34;&nbsp;&#124;...</code> | Defines the orientation of the rover list. |

### `TabPanel`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>visible</code>&nbsp;</strong> | <code>boolean</code> | Whether it's visible or not. |
| <strong><code>selectedId</code>&nbsp;</strong> | <code>string&nbsp;&#124;&nbsp;null</code> | TODO: Description |
| <strong><code>stopId</code>&nbsp;</strong> | <code>string</code> | TODO: Description |
