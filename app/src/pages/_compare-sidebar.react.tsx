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
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
} from "@ariakit/ui/ariakit/sidebar.react.tsx";
import {
  Sidebar as LegacySidebar,
  SidebarBody as LegacySidebarBody,
  SidebarFooter as LegacySidebarFooter,
  SidebarHeader as LegacySidebarHeader,
} from "#app/examples/_lib/ariakit/sidebar.react.tsx";

// Fixed-position sidebars need a paint-contained size container so they
// anchor to the demo box instead of the page viewport. The width is
// explicit because everything inside is out of flow.
const frameClassName = "relative h-96 w-72 [container-type:size] contain-paint";

function DemoRow() {
  return (
    <div className="ak-layer ak-layer-6 ak-frame ak-frame-field/field h-9" />
  );
}

function DemoRows() {
  return (
    <>
      <DemoRow />
      <DemoRow />
      <DemoRow />
    </>
  );
}

export function CompareSidebarLegacy() {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className={frameClassName}>
        <LegacySidebar>
          <LegacySidebarHeader>
            <DemoRow />
          </LegacySidebarHeader>
          <LegacySidebarBody>
            <DemoRows />
          </LegacySidebarBody>
          <LegacySidebarFooter>
            <DemoRow />
          </LegacySidebarFooter>
        </LegacySidebar>
      </div>
      <div className={frameClassName}>
        <LegacySidebar collapsed>
          <LegacySidebarBody>
            <DemoRows />
          </LegacySidebarBody>
        </LegacySidebar>
      </div>
    </div>
  );
}

export function CompareSidebarNew() {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className={frameClassName}>
        <Sidebar>
          <SidebarHeader>
            <DemoRow />
          </SidebarHeader>
          <SidebarBody>
            <DemoRows />
          </SidebarBody>
          <SidebarFooter>
            <DemoRow />
          </SidebarFooter>
        </Sidebar>
      </div>
      <div className={frameClassName}>
        <Sidebar collapsed>
          <SidebarBody>
            <DemoRows />
          </SidebarBody>
        </Sidebar>
      </div>
    </div>
  );
}
