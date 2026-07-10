/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */

import {
  Tab,
  TabGlider,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  TabSeparator,
} from "@ariakit/ui/ariakit/tabs.react.tsx";

export function IndexTabs() {
  return (
    <div className="flex flex-wrap gap-8 items-start">
      <Tabs $rounded="2xl" $border={4} $p="none">
        <TabList>
          <Tab>Profile</Tab>
          <TabSeparator />
          <Tab>Settings</Tab>
          <TabSeparator />
          <Tab>Activity</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>Profile panel</TabPanel>
          <TabPanel>Settings panel</TabPanel>
          <TabPanel>Activity panel</TabPanel>
        </TabPanels>
      </Tabs>
      <div className="ak-frame ak-frame-xl/10 ak-frame-bordering shadow-lg ak-layer ak-layer-5 overflow-clip">
        <Tabs $p={1} $rounded="2xl" $border={1}>
          <TabList>
            <Tab>Preview</Tab>
            <TabSeparator />
            <Tab>Code</Tab>
            <TabSeparator />
            <Tab>Dependencies</Tab>
            <TabGlider $state="hover" />
            <TabGlider $state="selected" $kind="folder" />
            <TabGlider $state="focus" $layer="brand" />
          </TabList>
          <TabPanels>
            <TabPanel single className="min-h-24">
              Panel content
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>
    </div>
  );
}
