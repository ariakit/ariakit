import { SkeletonLine } from "@ariakit/ui/components/skeleton.ariakit.react";
import {
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@ariakit/ui/components/tabs.ariakit.react";
import { useEffect, useState } from "react";

const reports: Record<string, string> = {
  "reports-sales": "Sales grew 12% in the last quarter.",
  "reports-traffic": "Traffic from search doubled since March.",
  "reports-support": "Support answered 94% of tickets in a day.",
};

export default function Example() {
  const [selectedId, setSelectedId] = useState<string | null | undefined>(
    "reports-sales",
  );
  const [loadedId, setLoadedId] = useState(selectedId);
  const loading = loadedId !== selectedId;

  // This stands for a request. Only a selection starts one, so moving across
  // the tabs with the arrow keys loads nothing.
  useEffect(() => {
    const timeout = setTimeout(() => setLoadedId(selectedId), 900);
    return () => clearTimeout(timeout);
  }, [selectedId]);

  return (
    <Tabs
      selectedId={selectedId}
      setSelectedId={setSelectedId}
      selectOnMove={false}
      className="w-[28rem] max-w-full"
    >
      <TabList aria-label="Reports">
        <Tab id="reports-sales">Sales</Tab>
        <Tab id="reports-traffic" separator>
          Traffic
        </Tab>
        <Tab id="reports-support" separator>
          Support
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel single aria-busy={loading}>
          {loading ? (
            <SkeletonLine className="w-4/5" />
          ) : (
            <p>{reports[loadedId ?? ""]}</p>
          )}
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}
