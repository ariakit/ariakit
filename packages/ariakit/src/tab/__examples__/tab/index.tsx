import { Tab, TabList, TabPanel, useTabState } from "ariakit/tab";
import "./style.css";

export default function Example() {
  const defaultSelectedId = "default-selected-tab";
  const tab = useTabState({ defaultSelectedId });
  return (
    <div className="wrapper">
      <TabList state={tab} className="tab-list" aria-label="Groceries">
        <Tab className="tab">Fruits</Tab>
        <Tab className="tab" id={defaultSelectedId}>
          Vegetables
        </Tab>
        <Tab className="tab">Meat</Tab>
      </TabList>
      <div className="panels">
        <TabPanel state={tab}>
          <ul>
            <li>🍎 Apple</li>
            <li>🍇 Grape</li>
            <li>🍊 Orange</li>
          </ul>
        </TabPanel>
        <TabPanel state={tab} tabId={defaultSelectedId}>
          <ul>
            <li>🥕 Carrot</li>
            <li>🧅 Onion</li>
            <li>🥔 Potato</li>
          </ul>
        </TabPanel>
        <TabPanel state={tab}>
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
