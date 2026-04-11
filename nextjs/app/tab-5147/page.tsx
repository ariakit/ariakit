"use client";

import * as Ariakit from "@ariakit/react";
import { Suspense } from "react";

function TabContent() {
  const tab = Ariakit.useTabStore({ id: "my-tabs" });

  return (
    <Ariakit.TabProvider store={tab}>
      <Ariakit.TabList aria-label="Settings">
        <Ariakit.Tab>Tab 1</Ariakit.Tab>
        <Ariakit.Tab>Tab 2</Ariakit.Tab>
      </Ariakit.TabList>
      <Ariakit.TabPanel>Panel 1</Ariakit.TabPanel>
      <Ariakit.TabPanel>Panel 2</Ariakit.TabPanel>
    </Ariakit.TabProvider>
  );
}

// Workaround: Wrap in Suspense to avoid Math.random() detection during prerendering
// TODO: Remove after https://github.com/ariakit/ariakit/issues/5147 is fixed
export default function TabPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TabContent />
    </Suspense>
  );
}
