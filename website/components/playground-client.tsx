"use client";
import { useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { cx, invariant } from "@ariakit/core/utils/misc";
import { Button, Tab, TabList, TabPanel, useTabStore } from "@ariakit/react";
import { useUpdateEffect } from "@ariakit/react-core/utils/hooks";
import { ChevronDown } from "icons/chevron-down.jsx";
import { ChevronUp } from "icons/chevron-up.jsx";
import { tsToJsFilename } from "utils/ts-to-js-filename.js";
import { tw } from "utils/tw.js";
import { useLocalStorageState } from "utils/use-local-storage-state.js";
import type { EditorProps } from "./editor.js";
// import { Editor } from "./editor.js";
import { PlaygroundToolbar } from "./playground-toolbar.jsx";

export interface PlaygroundClientProps extends EditorProps {
  id: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  githubLink?: string;
  previewLink?: string;
  preview?: ReactNode;
  type?: "compact" | "wide";
}

const style = {
  wrapper: tw`
    flex flex-col items-center justify-center gap-4 md:gap-6
  `,
  previewWrapper: tw`
    relative flex w-full items-center justify-center rounded-lg
    bg-gray-150 p-4 dark:bg-gray-850
  `,
  codeWrapper: tw`
    w-full max-w-[832px] rounded-lg border-none border-gray-650
    md:rounded-xl
  `,
  codeHeader: tw`
    relative z-[12] flex gap-2 rounded-t-[inherit] border border-[inherit]
    bg-gray-750 sm:shadow-dark
  `,
  tabList: tw`
    flex w-full flex-row overflow-x-auto p-2 sm:gap-2
  `,
  tab: tw`
    flex-start group relative flex h-10
    items-center justify-center whitespace-nowrap rounded bg-transparent
    px-2 text-sm tracking-tight
    text-white/75 outline-none
    hover:bg-white/10 aria-selected:text-white
    data-[focus-visible]:ariakit-outline-input dark:hover:bg-white/5
    sm:h-8
  `,
  tabIndicator: tw`
    pointer-events-none absolute left-0 top-full h-[3px] w-full
    translate-y-[5px] bg-transparent group-hover:bg-gray-650
    group-aria-selected:bg-blue-600
  `,
  toolbar: tw`
    flex flex-none p-1
  `,
  toolbarItem: tw`
    flex h-12 w-12 items-center justify-center rounded-md
    bg-transparent text-white/75 hover:bg-white/[15%] hover:text-white
    focus-visible:ariakit-outline-input sm:rounded-lg
    dark:hover:bg-white/5 sm:h-10 sm:w-10
    aria-expanded:!bg-gray-850
  `,
  selectHeading: tw`
    p-2 text-sm font-medium text-black/60 dark:text-white/50
  `,
  selectItem: tw`
    flex cursor-default scroll-m-2
    items-center gap-2
    rounded p-2 pr-6
    active-item:bg-blue-200/40 active:bg-blue-200/70
    focus-visible:!outline-none dark:active-item:bg-blue-600/25
    dark:active:bg-blue-800/25 [a&]:cursor-pointer
  `,
  tabPanel: tw`
    relative overflow-hidden
    rounded-b-[inherit] border border-t-0
    border-[inherit] focus-visible:z-[13]
    focus-visible:ariakit-outline-input
  `,
  expandButton: tw`
    group flex justify-center items-end text-sm pb-2 outline-none
    absolute bottom-0 left-0 z-10 w-full h-32 rounded-[inherit]
    bg-gradient-to-t from-[#1e1e1e]/100 to-[#1e1e1e]/0 from-[24px]
  `,
  expandButtonInner: tw`
    group-data-[focus-visible]:ariakit-outline
    group-hover:bg-gray-650 group-hover:border-gray-550 group-hover:text-white
    flex items-center justify-center gap-1 h-8 pr-2 pl-4 rounded
    bg-gray-750 border border-gray-650 text-white/90
  `,
  collapseButton: tw`
    flex items-center justify-center gap-1 h-8 pr-2 pl-4 rounded
    m-auto mt-2 text-sm border focus-visible:ariakit-outline
    drop-shadow-sm dark:drop-shadow-sm-dark
    bg-gray-150 border-gray-300 text-black/80
    hover:bg-gray-250 hover:text-black/90
    dark:bg-gray-750 dark:border-gray-650 dark:text-white/90
    dark:hover:bg-gray-650 dark:hover:border-gray-550 dark:hover:text-white
  `,
};

export function PlaygroundClient({
  id,
  files,
  // theme,
  previewLink,
  preview,
  githubLink,
  dependencies,
  devDependencies,
  codeBlocks,
  javascript,
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

  const [language, setLanguage] = useLocalStorageState<"ts" | "js">(
    "language",
    { defaultValue: "ts" }
  );
  const isJS = language === "js";

  const tab = useTabStore({
    defaultSelectedId: getTabId(firstFile),
    setSelectedId: () => {
      setCollapsed(false);
    },
  });
  const selectedId = tab.useState("selectedId");
  const file = selectedId && getFileFromTabId(selectedId);

  const codeBlock =
    file &&
    (isJS
      ? javascript?.[file]?.codeBlock || codeBlocks?.[file]
      : codeBlocks?.[file]);

  const content =
    file && (isJS ? javascript?.[file]?.code || files[file] : files[file]);

  const linesCount = content ? content.split("\n").length : 0;
  const collapsible = linesCount > 10;
  const [collapsed, setCollapsed] = useState(collapsible);
  const collapseRef = useRef<HTMLButtonElement>(null);
  const expandRef = useRef<HTMLButtonElement>(null);

  const javascriptFiles = useMemo(
    () =>
      Object.entries(files).reduce<typeof files>(
        (acc, [file, code]) => ({
          ...acc,
          [tsToJsFilename(file)]: javascript?.[file]?.code ?? code,
        }),
        {}
      ),
    [files, javascript]
  );

  useUpdateEffect(() => {
    if (collapsed) return;
    collapseRef.current?.scrollIntoView({ block: "nearest" });
  }, [collapsed, selectedId]);

  return (
    <div className={style.wrapper}>
      <div
        className={cx(
          id,
          style.previewWrapper,
          type === "wide"
            ? "min-h-[320px] md:rounded-2xl md:p-8"
            : "md:rounded-xl md:p-6"
        )}
      >
        {preview}
      </div>
      <div className={style.codeWrapper}>
        <div className={style.codeHeader}>
          <TabList store={tab} className={style.tabList}>
            {Object.keys(files).map((file) => (
              <Tab key={file} id={getTabId(file)} className={style.tab}>
                <span>{isJS ? tsToJsFilename(file) : file}</span>
                <div className={style.tabIndicator} />
              </Tab>
            ))}
          </TabList>
          <PlaygroundToolbar
            exampleId={id}
            files={files}
            javascriptFiles={javascriptFiles}
            code={content}
            dependencies={dependencies}
            devDependencies={devDependencies}
            previewLink={previewLink}
            githubLink={githubLink}
            language={language}
            setLanguage={setLanguage}
          />
        </div>
        {codeBlock && (
          <TabPanel
            store={tab}
            tabId={selectedId}
            className={cx(
              style.tabPanel,
              collapsed
                ? "max-h-64 [&_pre]:!overflow-hidden"
                : "max-h-[min(max(calc(100vh-640px),480px),800px)]"
            )}
          >
            {codeBlock}
            {collapsible && collapsed && (
              <Button
                ref={expandRef}
                className={style.expandButton}
                onClick={() => {
                  setCollapsed(false);
                  requestAnimationFrame(() => {
                    collapseRef.current?.focus();
                  });
                }}
              >
                <span className={style.expandButtonInner}>
                  Expand code
                  <ChevronDown className="h-5 w-5" />
                </span>
              </Button>
            )}
          </TabPanel>
        )}
        {collapsible && !collapsed && (
          <Button
            ref={collapseRef}
            className={style.collapseButton}
            onClick={() => {
              setCollapsed(true);
              requestAnimationFrame(() => {
                expandRef.current?.focus();
              });
            }}
          >
            Collapse code
            <ChevronUp className="h-5 w-5" />
          </Button>
        )}
      </div>
      {/* <Editor theme={theme} files={files} codeBlocks={codeBlocks} /> */}
    </div>
  );
}
