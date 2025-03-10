import * as ak from "@ariakit/react";
import { useId } from "react";
import { Icon } from "../icons/icon.react.tsx";
import type { CodeBlockProps } from "./code-block.types.ts";

function getTabId(prefix: string, filename?: string) {
  if (!filename) return prefix;
  return `${prefix}/${filename}`;
}

function getFilename(id?: string | null) {
  if (!id) return;
  const [, filename] = id.split(/\/(.*)/);
  return filename;
}

interface TabPanelProps extends ak.TabPanelProps {
  code?: React.ReactNode;
  defaultSelectedId?: string;
}

function TabPanel({
  code,
  defaultSelectedId,
  children,
  ...props
}: TabPanelProps) {
  const tab = ak.useTabContext();
  const tabId = ak.useStoreState(
    tab,
    (state) => props.tabId ?? state?.selectedId,
  );

  return (
    <ak.TabPanel
      {...props}
      ref={(element) => {
        if (!element) return;
        const contents =
          element.querySelectorAll<HTMLElement>("[data-filename]");
        for (const content of contents) {
          content.style.display = "none";
          if (content.dataset.filename === getFilename(tabId)) {
            content.style.removeProperty("display");
          }
        }
      }}
      tabId={tabId}
    >
      {tabId === defaultSelectedId && code}
      {tabId !== defaultSelectedId && children}
    </ak.TabPanel>
  );
}

interface CodeBlockTabsProps {
  tabs: CodeBlockProps[];
  code?: React.ReactNode;
  children?: React.ReactNode;
}

export function CodeBlockTabs({ tabs, code, children }: CodeBlockTabsProps) {
  const idPrefix = useId();
  const defaultTabId = getTabId(idPrefix, tabs[0]?.filename);
  return (
    <ak.TabProvider defaultSelectedId={defaultTabId}>
      <ak.TabList className="ak-tab-list">
        {tabs.map((tabItem, index) => (
          <ak.Tab
            key={index}
            className="ak-tab-folder data-focus-visible:ak-tab-folder_focus sm:h-10 text-sm"
            id={getTabId(idPrefix, tabItem.filename)}
          >
            <div>
              {tabItem.filenameIcon && <Icon name={tabItem.filenameIcon} />}
              {tabItem.filename || `Tab ${index + 1}`}
            </div>
          </ak.Tab>
        ))}
      </ak.TabList>
      <TabPanel
        defaultSelectedId={defaultTabId}
        className="ak-tab-panel ak-frame-bleed/0"
        code={code}
      >
        {children}
      </TabPanel>
    </ak.TabProvider>
  );
}
