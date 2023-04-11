import * as Ariakit from "@ariakit/react";
import "./style.css";

export default function Example() {
  const defaultSelectedId = "default-selected-tab";
  const tab = Ariakit.useTabStore({ defaultSelectedId });
  return (
    <div className="wrapper">
      <Ariakit.TabList store={tab} className="tab-list" aria-label="Groceries">
        <Ariakit.Tab className="tab">Fruits</Ariakit.Tab>
        <Ariakit.Tab className="tab" id={defaultSelectedId}>
          Vegetables
        </Ariakit.Tab>
        <Ariakit.Tab className="tab">Meat</Ariakit.Tab>
      </Ariakit.TabList>
      <div className="panels">
        <Ariakit.TabPanel store={tab}>
          <ul>
            <li>🍎 Apple</li>
            <li>🍇 Grape</li>
            <li>🍊 Orange</li>
          </ul>
        </Ariakit.TabPanel>
        <Ariakit.TabPanel store={tab} tabId={defaultSelectedId}>
          <ul>
            <li>🥕 Carrot</li>
            <li>🧅 Onion</li>
            <li>🥔 Potato</li>
          </ul>
        </Ariakit.TabPanel>
        <Ariakit.TabPanel store={tab}>
          <ul>
            <li>🥩 Beef</li>
            <li>🍗 Chicken</li>
            <li>🥓 Pork</li>
          </ul>
        </Ariakit.TabPanel>
      </div>
    </div>
  );
}
