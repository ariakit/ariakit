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

  useEffect(() => {
    if (selectedTab !== "vegetables") return;
    const timeout = setTimeout(() => setSelectedTab("meat"), 100);
    return () => clearTimeout(timeout);
  }, [selectedTab]);

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
