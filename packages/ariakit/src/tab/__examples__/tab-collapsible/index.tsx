import { useRef } from "react";
import { Tab, TabList, TabPanel, useTabState } from "ariakit/tab";
import tabs from "./data";
import TabPopover from "./tab-popover";
import useCollapsibleList from "./use-collapsible-list";
import "./style.css";

const list = Object.keys(tabs);

export default function Example() {
  const tab = useTabState({ orientation: "both" });
  const ref = useRef<HTMLDivElement>(null);
  const gap = 8;
  const [visible, hidden] = useCollapsibleList({ state: tab, list, ref, gap });

  const renderItem = (item: string) => (
    <Tab key={item} id={item} manual className="tab">
      {item}
    </Tab>
  );

  return (
    <div className="wrapper">
      <TabList
        ref={ref}
        state={tab}
        style={{ display: "flex", gap }}
        className="tab-list"
      >
        {visible.map(renderItem)}
        {!!hidden.length && (
          <TabPopover title={`+${hidden.length}`}>
            {hidden.map(renderItem)}
          </TabPopover>
        )}
      </TabList>
      <TabPanel state={tab} tabId={tab.selectedId} className="tab-panel">
        {tab.selectedId && (
          <pre>
            <code>{tabs[tab.selectedId]}</code>
          </pre>
        )}
      </TabPanel>
    </div>
  );
}
