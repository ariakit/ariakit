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
        <ak.Tab
          id="fruits"
          onKeyDown={(event) => {
            if (event.key.toLowerCase() !== "d") return;
            setSelectedTab("dairy");
          }}
        >
          Fruits
        </ak.Tab>
        <ak.Tab id="dairy" disabled>
          Dairy
        </ak.Tab>
        <ak.Tab id="vegetables">Vegetables</ak.Tab>
        <ak.Tab id="meat">Meat</ak.Tab>
      </ak.TabList>
      <ak.TabPanel tabId="fruits" alwaysVisible>
        Apples, grapes, and oranges
        <label>
          Fruit note
          <input
            type="text"
            onFocus={() => setTimeout(() => setSelectedTab("vegetables"), 100)}
          />
        </label>
      </ak.TabPanel>
      <ak.TabPanel tabId="vegetables">
        Carrots, onions, and potatoes
      </ak.TabPanel>
      <ak.TabPanel tabId="meat">Beef, chicken, and pork</ak.TabPanel>
      <ak.TabPanel tabId="dairy">Milk, cheese, and yogurt</ak.TabPanel>
      <button
        type="button"
        // WebKit keeps focus on the clicked button only when explicitly tabbable.
        tabIndex={0}
        onClick={() => setSelectedTab("vegetables")}
      >
        Select vegetables
      </button>
    </ak.TabProvider>
  );
}
