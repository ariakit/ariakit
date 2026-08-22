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
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@ariakit/ui/ariakit/tabs.react.tsx";
import type {
  TabListProps,
  TabsProps,
} from "@ariakit/ui/ariakit/tabs.react.tsx";
import { clsx } from "clsx";
import type { PropsWithChildren } from "react";

interface PlaygroundTabsProps extends TabsProps {
  tabListProps?: TabListProps;
}

/**
 * Interactive stand-in for the legacy static tab previews: the forced
 * underscore state classes are gone, so the folder states are exercised with
 * real tabs instead.
 */
function PlaygroundTabs({ tabListProps, ...props }: PlaygroundTabsProps) {
  return (
    <Tabs
      $lighten={1.2}
      $rounded="xl"
      $p={1}
      {...props}
      className={clsx("overflow-clip", props.className)}
    >
      <TabList {...tabListProps}>
        <Tab>Preview</Tab>
        <Tab>Code</Tab>
        <Tab>Usage</Tab>
      </TabList>
      <TabPanels $p={2}>
        <TabPanel single>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Illo sed
            illum quaerat recusandae cupiditate dolor praesentium ab corrupti
            quidem laborum. Eveniet voluptatem velit animi vitae reiciendis
            eligendi. Provident, est nam!
          </p>
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}

export function Playground({ children }: PropsWithChildren) {
  return (
    <div className="flex flex-col gap-4 m-2">
      <PlaygroundTabs />
      <PlaygroundTabs $border={4} />
      <PlaygroundTabs tabListProps={{ $p: 1 }} />
      <PlaygroundTabs $border={3} tabListProps={{ $p: 1 }} />
      <PlaygroundTabs $borderColor="brand" $borderRaw />
      <PlaygroundTabs $borderColor="brand" $border={3} />
      {children}
    </div>
  );
}
