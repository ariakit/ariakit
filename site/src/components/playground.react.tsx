import { Role, type RoleProps } from "@ariakit/react";
import type { PropsWithChildren } from "react";

interface TabsProps extends RoleProps {
  tabList?: RoleProps["render"];
}

function Tabs({ tabList, ...props }: TabsProps) {
  return (
    <Role
      {...props}
      className="ak-tabs ak-layer ak-frame-container ak-frame-border overflow-clip"
    >
      <Role className="ak-tab-list" render={tabList}>
        <div className="ak-tab-folder_idle !ak-tab-folder_selected">
          <div>selected</div>
        </div>
        <div className="ak-tab-folder_idle !ak-tab-folder_hover">
          <div>hover</div>
        </div>
        <div className="ak-tab-folder_idle">
          <div>idle</div>
        </div>
        <div className="ak-tab-folder_idle !ak-tab-folder_focus">
          <div>focus</div>
        </div>
        <div className="ak-tab-folder_idle !ak-tab-folder_selected !ak-tab-folder_focus">
          <div>selected focus</div>
        </div>
        <button className="ak-tab-folder" tabIndex={0}>
          <div>default</div>
        </button>
        <button className="ak-tab-folder" aria-selected="true" tabIndex={0}>
          <div>default selected</div>
        </button>
      </Role>
      <div className="ak-tab-panel">
        <p className="ak-frame/2">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Illo sed
          illum quaerat recusandae cupiditate dolor praesentium ab corrupti
          quidem laborum. Eveniet voluptatem velit animi vitae reiciendis
          eligendi. Provident, est nam!
        </p>
      </div>
    </Role>
  );
}

export function Playground({ children }: PropsWithChildren) {
  return (
    <div className="p-4 flex flex-col gap-4">
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
