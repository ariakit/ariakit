"use client";
import * as ak from "@ariakit/react";
import { useId } from "react";

export default function Home() {
  const defaultSelectedId = useId();
  return (
    <div className="ak-tabs ak-layer ak-frame-container ak-frame-border overflow-clip">
      <ak.TabProvider defaultSelectedId={defaultSelectedId}>
        <ak.TabList className="ak-tab-list">
          <ak.Tab className="ak-tab-folder" id={defaultSelectedId}>
            <span>Documentation</span>
          </ak.Tab>
          <ak.Tab className="ak-tab-folder">
            <span>Learning</span>
          </ak.Tab>
          <ak.Tab className="ak-tab-folder">
            <span>Templates</span>
          </ak.Tab>
        </ak.TabList>
        <ak.TabPanel className="ak-tab-panel">
          <p>Documentation</p>
        </ak.TabPanel>
        <ak.TabPanel className="ak-tab-panel">
          <p>Learning</p>
        </ak.TabPanel>
        <ak.TabPanel className="ak-tab-panel">
          <p>Templates</p>
        </ak.TabPanel>
      </ak.TabProvider>
    </div>
  );
}
