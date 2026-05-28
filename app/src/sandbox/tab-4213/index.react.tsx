import * as ak from "@ariakit/react";
import { useEffect, useState } from "react";

export default function Example() {
  const [selectedTab, setSelectedTab] = useState<string | null | undefined>(
    "fruits",
  );
  const tab = ak.useTabStore({
    selectedId: selectedTab,
    setSelectedId: setSelectedTab,
  });
  const activeId = ak.useStoreState(tab, "activeId");
  const renderedItems = ak.useStoreState(tab, "renderedItems");

  useEffect(() => {
    if (selectedTab !== "vegetables") return;
    const timeout = setTimeout(() => setSelectedTab("meat"), 100);
    return () => clearTimeout(timeout);
  }, [selectedTab]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const activeElement =
        renderedItems[0]?.element?.ownerDocument.activeElement;
      const focusedItem = renderedItems.find(
        (item) => item.element === activeElement,
      );
      if (!focusedItem) return;
      if (activeId === focusedItem.id) return;
      tab.setActiveId(focusedItem.id);
    });
    return () => cancelAnimationFrame(frame);
  }, [activeId, renderedItems, tab]);

  return (
    <ak.TabProvider store={tab}>
      <ak.TabList aria-label="Groceries">
        <ak.Tab id="fruits">Fruits</ak.Tab>
        <ak.Tab id="vegetables">Vegetables</ak.Tab>
        <ak.Tab id="meat">Meat</ak.Tab>
      </ak.TabList>
      <ak.TabPanel tabId="fruits">Apples, grapes, and oranges</ak.TabPanel>
      <ak.TabPanel tabId="vegetables">
        Carrots, onions, and potatoes
      </ak.TabPanel>
      <ak.TabPanel tabId="meat">Beef, chicken, and pork</ak.TabPanel>
    </ak.TabProvider>
  );
}
