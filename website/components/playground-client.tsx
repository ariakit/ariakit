"use client";
import type { ReactNode } from "react";
import { cx, invariant } from "@ariakit/core/utils/misc";
import {
  Tab,
  TabList,
  TabPanel,
  Toolbar,
  ToolbarItem,
  useTabStore,
  useToolbarStore,
} from "@ariakit/react";
import { NewWindow } from "icons/new-window.js";
import { tw } from "utils/tw.js";
import { CopyToClipboard } from "./copy-to-clipboard.js";
import type { EditorProps } from "./editor.js";
// import { Editor } from "./editor.js";
import { Link } from "./link.js";
import { TooltipButton } from "./tooltip-button.js";

export interface PlaygroundClientProps extends EditorProps {
  id: string;
  dependencies?: Record<string, string>;
  previewLink?: string;
  preview?: ReactNode;
  type?: "compact" | "wide";
}

export function PlaygroundClient({
  id,
  files,
  // theme,
  previewLink,
  preview,
  // dependencies,
  codeBlocks,
  type = "wide",
}: PlaygroundClientProps) {
  const getTabId = (file: string) =>
    `${id}-${file.replace("/", "__").replace(/\.([^\.]+)$/, "-$1")}`;

  const getFileFromTabId = (tabId: string) =>
    tabId
      .replace(`${id}-`, "")
      .replace("__", "/")
      .replace(/\-([^\-]+)$/, ".$1");

  const firstFile = Object.keys(files)[0];

  invariant(firstFile, "No files provided");

  const toolbar = useToolbarStore();

  const tab = useTabStore({ defaultSelectedId: getTabId(firstFile) });
  const selectedId = tab.useState("selectedId");
  const file = selectedId && getFileFromTabId(selectedId);
  const codeBlock = file && codeBlocks?.[file];
  const content = file && files[file];

  return (
    <div className="flex flex-col items-center justify-center gap-4 md:gap-6">
      <div
        className={cx(
          id,
          type === "wide"
            ? "min-h-[320px] md:rounded-2xl md:p-8"
            : "md:rounded-xl md:p-6",
          tw`relative flex w-full items-center justify-center rounded-lg
            bg-gray-150 p-4 dark:bg-gray-850`
        )}
      >
        {preview}
      </div>
      <div
        className={tw`
        w-full max-w-[832px] rounded-lg border-none border-gray-650
        md:rounded-xl`}
      >
        <div
          className={tw`
          relative z-[12] flex gap-2 rounded-t-[inherit] border border-[inherit]
          bg-gray-750 sm:shadow-dark`}
        >
          <TabList
            store={tab}
            className="flex w-full flex-row overflow-x-auto p-2 sm:gap-2"
          >
            {Object.keys(files).map((file) => (
              <Tab
                key={file}
                id={getTabId(file)}
                className={tw`
                flex-start group relative flex h-10 min-w-[64px]
                items-center justify-center whitespace-nowrap rounded bg-transparent
                px-2 text-sm tracking-tight
                text-white/75 outline-none
                hover:bg-white/10 aria-selected:text-white
                data-[focus-visible]:ariakit-outline-input dark:hover:bg-white/5
                sm:h-8`}
              >
                <span className="truncate">{file}</span>
                <div
                  className={tw`
                  pointer-events-none absolute left-0 top-full h-[3px] w-full
                  translate-y-[5px] bg-transparent group-hover:bg-gray-650
                  group-aria-selected:bg-blue-600`}
                />
              </Tab>
            ))}
          </TabList>
          <Toolbar store={toolbar} className="flex flex-none p-1">
            {previewLink && (
              <ToolbarItem
                className={tw`
                flex h-12 w-12 items-center justify-center rounded-lg
                bg-transparent text-white/75 hover:bg-white/[15%] hover:text-white
                focus-visible:ariakit-outline-input
                dark:hover:bg-white/5 sm:h-10
                sm:w-10`}
              >
                {(props) => (
                  <TooltipButton
                    as={Link}
                    target="__blank"
                    href={previewLink}
                    title="Preview in new window"
                    {...props}
                  >
                    <NewWindow className="h-5 w-5" strokeWidth={1.5} />
                  </TooltipButton>
                )}
              </ToolbarItem>
            )}
            {content != null && (
              <ToolbarItem
                as={CopyToClipboard}
                text={content}
                className={tw`
                flex h-12 w-12 items-center justify-center rounded-lg
                bg-transparent text-white/75 hover:bg-white/[15%]
                hover:text-white focus-visible:ariakit-outline-input
                dark:hover:bg-white/5 sm:h-10
                sm:w-10`}
              />
            )}
          </Toolbar>
        </div>
        {codeBlock && (
          <TabPanel
            store={tab}
            tabId={selectedId}
            className={tw`
            relative overflow-hidden
            rounded-b-[inherit] border border-t-0
            border-[inherit]
            focus-visible:z-[13] focus-visible:ariakit-outline-input`}
          >
            {codeBlock}
          </TabPanel>
        )}
      </div>
      {/* <Editor theme={theme} files={files} codeBlocks={codeBlocks} /> */}
    </div>
  );
}
