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
import type { PropsWithChildren } from "react";

interface TabsProps extends ak.RoleProps {
  tabList?: ak.RoleProps["render"];
}

function Tabs({ tabList, ...props }: TabsProps) {
  return (
    <ak.Role
      {...props}
      className="ak-tabs ak-layer ak-frame-container ak-frame-border overflow-clip"
    >
      <ak.Role className="ak-tab-list" render={tabList}>
        <div className="ak-tab-folder_idle [&&]:ak-tab-folder_selected">
          <div>selected</div>
        </div>
        <div className="ak-tab-folder_idle [&&]:ak-tab-folder_hover">
          <div>hover</div>
        </div>
        <div className="ak-tab-folder_idle">
          <div>idle</div>
        </div>
        <div className="ak-tab-folder_idle [&&]:ak-tab-folder_focus">
          <div>focus</div>
        </div>
        <div className="ak-tab-folder_idle [&&]:ak-tab-folder_selected [&]:ak-tab-folder_focus">
          <div>selected focus</div>
        </div>
        <button className="ak-tab-folder" tabIndex={0}>
          <div>default</div>
        </button>
        <button
          className="ak-tab-folder"
          role="tab"
          aria-selected="true"
          tabIndex={0}
        >
          <div>default selected</div>
        </button>
      </ak.Role>
      <div className="ak-tab-panel">
        <p className="ak-frame/2">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Illo sed
          illum quaerat recusandae cupiditate dolor praesentium ab corrupti
          quidem laborum. Eveniet voluptatem velit animi vitae reiciendis
          eligendi. Provident, est nam!
        </p>
      </div>
    </ak.Role>
  );
}

export function Playground({ children }: PropsWithChildren) {
  return (
    <div className="flex flex-col gap-4 m-2">
      <Tabs />
      <Tabs render={<div className="ak-frame-border-4" />} />
      <Tabs tabList={<div className="ak-tab-list-p-1" />} />
      <Tabs
        render={<div className="ak-frame-border-3" />}
        tabList={<div className="ak-tab-list-p-1" />}
      />
      <Tabs render={<div className="ak-edge-contrast-primary" />} />
      <Tabs render={<div className="ak-edge-primary ak-frame-border-3" />} />
      {children}
    </div>
  );
}
