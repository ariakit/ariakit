import { Tab, TabList, TabPanel, useTabStore } from "@ariakit/react";
import "./style.css";

export default function Example() {
  const defaultSelectedId = "default-selected-tab";
  const tab = useTabStore({ defaultSelectedId });
  return (
    <div className="wrapper">
      <TabList store={tab} className="tab-list" aria-label="Groceries">
        <Tab className="tab">Fruits</Tab>
        <Tab className="tab" id={defaultSelectedId}>
          Vegetables
        </Tab>
        <Tab className="tab">Meat</Tab>
      </TabList>
      <div className="panels">
        <TabPanel store={tab}>
          <ul>
            <li>🍎 Apple</li>
            <li>🍇 Grape</li>
            <li>🍊 Orange</li>
          </ul>
        </TabPanel>
        <TabPanel store={tab} tabId={defaultSelectedId}>
          <ul>
            <li>🥕 Carrot</li>
            <li>🧅 Onion</li>
            <li>🥔 Potato</li>
          </ul>
        </TabPanel>
        <TabPanel store={tab}>
          <ul>
            <li>🥩 Beef</li>
            <li>🍗 Chicken</li>
            <li>🥓 Pork</li>
          </ul>
        </TabPanel>
      </div>
    </div>
  );
}
