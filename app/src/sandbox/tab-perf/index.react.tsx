import * as Ariakit from "@ariakit/react";
import { useState } from "react";
import "./style.css";

const tabCount = 200;
const tabs = Array.from({ length: tabCount }, (_, index) => {
  const number = index + 1;
  return { id: `tab-${number}`, label: `Tab ${number}` };
});

function TabFixture() {
  return (
    <Ariakit.TabProvider defaultSelectedId="tab-1">
      <Ariakit.TabList aria-label="Items" className="tab-list">
        {tabs.map((tab) => (
          <Ariakit.Tab key={tab.id} id={tab.id} className="tab">
            {tab.label}
          </Ariakit.Tab>
        ))}
      </Ariakit.TabList>
      <div className="panels">
        {tabs.map((tab) => (
          <Ariakit.TabPanel key={tab.id} tabId={tab.id} className="panel">
            Content for {tab.label}
          </Ariakit.TabPanel>
        ))}
      </div>
    </Ariakit.TabProvider>
  );
}

export default function Example() {
  const [mounted, setMounted] = useState(false);
  return (
    <div className="root">
      <Ariakit.Button className="button" onClick={() => setMounted(true)}>
        Mount tabs
      </Ariakit.Button>
      {mounted ? <TabFixture /> : null}
    </div>
  );
}
