import { Tab, TabList, TabPanel, useTabState } from "ariakit/tab";
import "./style.css";

export default function Example() {
  const defaultSelectedId = "default-selected-tab";
  const tab = useTabState({ defaultSelectedId });
  return (
    <div className="wrapper">
      <TabList state={tab} className="tab-list" aria-label="Groceries">
        <Tab className="tab" id={defaultSelectedId}>
          Fruits
        </Tab>
        <Tab className="tab">Vegetables</Tab>
        <Tab className="tab">Meat</Tab>
      </TabList>
      <TabPanel state={tab} tabId={defaultSelectedId}>
        <ul>
          <li>🍎 Apple</li>
          <li>🍇 Grape</li>
          <li>🍊 Orange</li>
        </ul>
      </TabPanel>
      <TabPanel state={tab}>
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
  );
}
