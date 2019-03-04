---
path: /components/tab
---

# Tab

## Usage

```jsx
import { useTabState, Tab, TabList, TabPanel } from "reakit";

function Example() {
  const tab = useTabState({ activeIndex: 0 })
  return (
    <>
      <TabList>
        <Tab tabId="tab1" {...tab}>Tab 1</Tab>
        <Tab tabId="tab2" {...tab}>Tab 2</Tab>
        <Tab tabId="tab3" {...tab}>Tab 3</Tab>
      </TabList>
      <TabPanel tabId="tab1" {...tab}>Tab 1</TabPanel>
      <TabPanel tabId="tab2" {...tab}>Tab 2</TabPanel>
      <TabPanel tabId="tab3" {...tab}>Tab 3</TabPanel>
    </>
  );
}
```
