/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import * as ak from "@ariakit/react";
import {
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  TabProvider,
  Tabs,
} from "@ariakit/ui/components/tabs.ariakit.react";
import { Example, ExampleGrid } from "../example.react.tsx";

interface ActivityTabsProps {
  name: string;
  pinned?: boolean;
}

function ActivityTabs({ name, pinned }: ActivityTabsProps) {
  const activityId = `${name.toLowerCase()}-activity`;
  const reviewsId = `${name.toLowerCase()}-reviews`;
  const store = ak.useTabStore({ defaultSelectedId: activityId });
  const selectedId = ak.useStoreState(store, "selectedId");
  // Pinned panels keep their tabId when another tab becomes selected.
  return (
    <section className="grid gap-2">
      <h2>{name} updates</h2>
      <TabList store={store} aria-label={`${name} updates`}>
        <Tab id={activityId}>{name} activity</Tab>
        <Tab id={reviewsId}>{name} reviews</Tab>
      </TabList>
      <TabPanel store={store} single {...(pinned && { tabId: activityId })}>
        {selectedId === activityId
          ? `${name} activity updates`
          : `${name} review updates`}
      </TabPanel>
    </section>
  );
}

// Migrated from the tab-panel-shared-store sandbox without changes: Tab,
// TabList and TabPanel with explicit stores and no Tabs root.
function TabPanelSharedStore() {
  // Team's explicit store must take precedence over the surrounding provider.
  return (
    <div className="grid gap-6">
      <ActivityTabs name="Project" />
      <TabProvider defaultSelectedId="unrelated">
        <ActivityTabs name="Team" />
      </TabProvider>
      <ActivityTabs name="Pinned" pinned />
    </div>
  );
}

export function TabsFixturesExamples() {
  return (
    <ExampleGrid>
      <Example
        title="Tab panel shared store"
        description="Single panels with explicit stores: one nested in an unrelated TabProvider, and one pinned to its first tab with an explicit tabId."
        stretch
        code={
          <>
            <TabList>
              <Tab>Project activity</Tab>
              <Tab>Project reviews</Tab>
            </TabList>
            <TabPanel single />
            <TabProvider>
              <TabList>
                <Tab>Team activity</Tab>
                <Tab>Team reviews</Tab>
              </TabList>
              <TabPanel single />
            </TabProvider>
          </>
        }
      >
        <TabPanelSharedStore />
      </Example>

      <Example
        title="Tabs record"
        description="The tabs come from a record: its keys are the tab ids, and an entry can pass tab props, such as disabled."
        stretch
      >
        <Tabs defaultSelectedId="record-usage">
          <TabList
            aria-label="Tabs record"
            tabs={{
              "record-preview": "Preview",
              "record-code": { children: "Code", disabled: true },
              "record-usage": "Usage",
            }}
          />
          <TabPanels>
            <TabPanel single>
              <p className="text-sm">The Code tab is not available.</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Example>
    </ExampleGrid>
  );
}

export default TabsFixturesExamples;
