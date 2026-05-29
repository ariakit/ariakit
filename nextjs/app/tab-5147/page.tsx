"use client";

import * as Ariakit from "@ariakit/react";

export default function TabPage() {
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
