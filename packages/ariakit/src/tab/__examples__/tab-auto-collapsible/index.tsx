import { useRef } from "react";
import {
  CompositeOverflow,
  CompositeOverflowDisclosure,
  useCompositeOverflowState,
} from "ariakit";
import { Tab, TabList, TabPanel, useTabState } from "ariakit/tab";
import tabs from "./data";
import useCollapsibleList from "./use-collapsible-list";
import "./style.css";

const list = Object.keys(tabs);

export default function Example() {
  const tab = useTabState({
    defaultSelectedId: "button.js",
    orientation: "both",
  });
  const overflow = useCompositeOverflowState({ placement: "bottom-end" });
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
          <>
            <CompositeOverflowDisclosure state={overflow} className="tab">
              +{hidden.length}
            </CompositeOverflowDisclosure>
            <CompositeOverflow state={overflow} className="popover">
              {hidden.map(renderItem)}
            </CompositeOverflow>
          </>
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
