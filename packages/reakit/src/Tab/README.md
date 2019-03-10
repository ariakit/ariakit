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
      <TabList>
        <Tab refId="tab1" {...tab}>
          Tab 1
        </Tab>
        <Tab refId="tab2" disabled {...tab}>
          Tab 2
        </Tab>
        <Tab refId="tab3" {...tab}>
          Tab 3
        </Tab>
      </TabList>
      <TabPanel refId="tab1" {...tab}>
        Tab 1
      </TabPanel>
      <TabPanel refId="tab2" {...tab}>
        Tab 2
      </TabPanel>
      <TabPanel refId="tab3" {...tab}>
        Tab 3
      </TabPanel>
    </>
  );
}
```

```jsx
import { useTabState, Tab, TabList, TabPanel } from "reakit";

function Example() {
  const tab = useTabState({ autoSelect: false, selectedRef: "tab2" });
  return (
    <>
      <TabList>
        <Tab refId="tab1" {...tab}>
          Tab 1
        </Tab>
        <Tab refId="tab2" disabled {...tab}>
          Tab 2
        </Tab>
        <Tab refId="tab3" {...tab}>
          Tab 3
        </Tab>
      </TabList>
      <TabPanel refId="tab1" {...tab}>
        Tab 1
      </TabPanel>
      <TabPanel refId="tab2" {...tab}>
        Tab 2
      </TabPanel>
      <TabPanel refId="tab3" {...tab}>
        Tab 3
      </TabPanel>
    </>
  );
}
```
