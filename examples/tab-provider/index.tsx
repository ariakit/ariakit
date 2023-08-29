import "./style.css";
import * as Ariakit from "@ariakit/react";
import { TabProvider } from "@ariakit/react-core/tab/tab-provider";

export default function Example() {
  const defaultSelectedId = "default-selected-tab";
  return (
    <div className="wrapper">
      <TabProvider defaultSelectedId={defaultSelectedId}>
        <Ariakit.TabList className="tab-list" aria-label="Groceries">
          <Ariakit.Tab className="tab">Fruits</Ariakit.Tab>
          <Ariakit.Tab className="tab" id={defaultSelectedId}>
            Vegetables
          </Ariakit.Tab>
          <Ariakit.Tab className="tab">Meat</Ariakit.Tab>
        </Ariakit.TabList>
        <div className="panels">
          <Ariakit.TabPanel>
            <ul>
              <li>🍎 Apple</li>
              <li>🍇 Grape</li>
              <li>🍊 Orange</li>
            </ul>
          </Ariakit.TabPanel>
          <Ariakit.TabPanel tabId={defaultSelectedId}>
            <ul>
              <li>🥕 Carrot</li>
              <li>🧅 Onion</li>
              <li>🥔 Potato</li>
            </ul>
          </Ariakit.TabPanel>
          <Ariakit.TabPanel>
            <ul>
              <li>🥩 Beef</li>
              <li>🍗 Chicken</li>
              <li>🥓 Pork</li>
            </ul>
          </Ariakit.TabPanel>
        </div>
      </TabProvider>
    </div>
  );
}
