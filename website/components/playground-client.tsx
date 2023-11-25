"use client";
import { useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { cx, invariant } from "@ariakit/core/utils/misc";
import { Button, Tab, TabList, TabPanel, useTabStore } from "@ariakit/react";
import { useUpdateEffect } from "@ariakit/react-core/utils/hooks";
import { ChevronDown } from "icons/chevron-down.jsx";
import { ChevronUp } from "icons/chevron-up.jsx";
import { NewWindow } from "icons/new-window.jsx";
import Link from "next/link.js";
import { twJoin } from "tailwind-merge";
import useLocalStorageState from "use-local-storage-state";
import { tsToJsFilename } from "utils/ts-to-js-filename.js";
import {
  AuthEnabled,
  AuthLoading,
  NotSubscribed,
  Subscribed,
} from "./auth.jsx";
import { CodePlaceholder } from "./code-placeholder.jsx";
import { Command } from "./command.jsx";
import type { EditorProps } from "./editor.js";
// import { Editor } from "./editor.js";
import { PlaygroundBrowser } from "./playground-browser.jsx";
import { PlaygroundToolbar } from "./playground-toolbar.jsx";
import { PreviewToolbar } from "./preview-toolbar.jsx";
import { TooltipButton } from "./tooltip-button.jsx";

export interface PlaygroundClientProps extends EditorProps {
  id: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  githubLink?: string;
  previewLink?: string;
  preview?: ReactNode;
  abstracted?: boolean;
  plus?: boolean;
  type?: "code" | "compact" | "wide";
}

export function PlaygroundClient({
  id,
  files,
  // theme,
  previewLink,
  preview,
  // githubLink,
  dependencies,
  devDependencies,
  codeBlocks,
  javascript,
  abstracted,
  plus,
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

  const isAppDir = /^(page|layout)\.[tj]sx?/.test(firstFile);

  const [language, setLanguage] = useLocalStorageState<"ts" | "js">(
    "language",
    { defaultValue: "ts" },
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
        {},
      ),
    [files, javascript],
  );

  const subscriptionOnly =
    plus && (!abstracted || (file && !/^index\.(j|t)sx?$/.test(file)));

  const playgroundToolbar = (
    <PlaygroundToolbar
      code={content}
      language={language}
      setLanguage={setLanguage}
    />
  );

  const codeBlockElement = (
    <>
      {codeBlock}
      {collapsible && collapsed && (
        <Button
          ref={expandRef}
          className="group absolute bottom-0 left-0 z-10 flex h-32 w-full items-end justify-center rounded-[inherit] bg-gradient-to-t from-white/100 from-[24px] to-white/0 pb-2 text-sm outline-none dark:from-gray-850/100 dark:to-gray-850/0"
          onClick={() => {
            setCollapsed(false);
            requestAnimationFrame(() => {
              collapseRef.current?.focus();
            });
          }}
        >
          <span className="flex h-8 items-center justify-center gap-1 rounded border border-gray-300 bg-gray-150 pl-4 pr-2 text-black/80 group-hover:bg-gray-250 group-hover:text-black/90 group-data-[focus-visible]:ariakit-outline dark:border-gray-650 dark:bg-gray-750 dark:text-white/90 dark:group-hover:border-gray-550 dark:group-hover:bg-gray-650 dark:group-hover:text-white">
            Expand code
            <ChevronDown className="h-5 w-5" />
          </span>
        </Button>
      )}
    </>
  );

  const collapseButton = collapsible && !collapsed && (
    <Button
      ref={collapseRef}
      className="m-auto mt-2 flex h-8 items-center justify-center gap-1 rounded border border-gray-300 bg-gray-150 pl-4 pr-2 text-sm text-black/80 shadow-sm hover:bg-gray-250 hover:text-black/90 focus-visible:ariakit-outline dark:border-gray-650 dark:bg-gray-750 dark:text-white/90 dark:shadow-sm-dark dark:hover:border-gray-550 dark:hover:bg-gray-650 dark:hover:text-white"
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
  );

  useUpdateEffect(() => {
    if (collapsed) return;
    collapseRef.current?.scrollIntoView({ block: "nearest" });
  }, [collapsed, selectedId]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 md:gap-6">
      {preview && (
        <div
          className={twJoin(
            id,
            "relative flex w-full flex-col items-center rounded-lg bg-gray-150 p-2 dark:bg-gray-850",
            /\-radix/.test(id) &&
              "bg-gradient-to-br from-blue-600 to-purple-600",
            type === "wide" ? "md:rounded-2xl" : "md:rounded-xl",
          )}
        >
          {type === "wide" && previewLink && (
            <TooltipButton
              title="Open preview in a new tab"
              className="w-10 self-end p-0 text-black/80 hover:text-black dark:text-white/70 dark:hover:text-white"
              render={
                <Command
                  flat
                  variant="secondary"
                  render={<Link href={previewLink} target="_blank" />}
                />
              }
            >
              <span className="sr-only">Open preview in a new tab</span>
              <NewWindow strokeWidth={1.5} className="h-5 w-5" />
            </TooltipButton>
          )}
          <div
            className={twJoin(
              "flex h-full flex-1 flex-col items-center justify-center",
              type === "wide"
                ? ["min-h-[240px] p-6 md:p-12", previewLink && "md:pt-10"]
                : "p-4 md:p-6",
            )}
          >
            {preview}
          </div>
          {type === "wide" && (
            <AuthEnabled>
              <PreviewToolbar
                exampleId={id}
                files={files}
                javascriptFiles={javascriptFiles}
                dependencies={dependencies}
                devDependencies={devDependencies}
                language={language}
              />
            </AuthEnabled>
          )}
        </div>
      )}
      {isAppDir && previewLink && (
        <div className="flex w-full flex-col items-center">
          <div
            className={cx(
              "w-full overflow-hidden rounded-lg border border-gray-300 bg-gray-150 dark:border-gray-650 dark:bg-gray-850",
              type === "wide"
                ? "h-[480px] md:rounded-2xl"
                : "h-[320px] md:rounded-xl",
            )}
          >
            <PlaygroundBrowser previewLink={previewLink} />
          </div>
          <AuthEnabled>
            <PreviewToolbar
              exampleId={id}
              files={files}
              javascriptFiles={javascriptFiles}
              dependencies={dependencies}
              devDependencies={devDependencies}
              language={language}
              className="-mt-12 rounded-lg bg-gray-150 p-1 pl-3 dark:bg-gray-850"
            />
          </AuthEnabled>
        </div>
      )}
      <div className="w-full max-w-[832px] rounded-lg border-none border-black/[15%] dark:border-gray-650 md:rounded-xl">
        <div className="relative z-[12] flex gap-2 rounded-t-[inherit] border border-[inherit] bg-gray-100 dark:bg-gray-750">
          <TabList
            store={tab}
            className="flex w-full flex-row overflow-x-auto p-2 sm:gap-2"
          >
            {Object.keys(files).map((file) => (
              <Tab
                key={file}
                id={getTabId(file)}
                className="flex-start group relative flex h-10 items-center justify-center whitespace-nowrap rounded bg-transparent px-2 text-sm tracking-tight text-black/75 outline-none hover:bg-black/5 aria-selected:text-black data-[focus-visible]:ariakit-outline-input dark:text-white/75 dark:hover:bg-white/5 dark:aria-selected:text-white sm:h-8"
              >
                <span>{isJS ? tsToJsFilename(file) : file}</span>
                <div className="pointer-events-none absolute left-0 top-full h-[3px] w-full translate-y-[5px] bg-transparent group-hover:bg-gray-250 group-aria-selected:bg-blue-600 dark:group-hover:bg-gray-650 dark:group-aria-selected:bg-blue-600" />
              </Tab>
            ))}
          </TabList>
          {subscriptionOnly ? (
            <AuthEnabled>
              <Subscribed>{playgroundToolbar}</Subscribed>
            </AuthEnabled>
          ) : (
            playgroundToolbar
          )}
        </div>
        {codeBlock && (
          <TabPanel
            store={tab}
            tabId={selectedId}
            className={twJoin(
              "relative overflow-hidden rounded-b-[inherit] border border-t-0",
              "border-[inherit] focus-visible:z-[13] focus-visible:ariakit-outline-input",
              collapsed
                ? "max-h-64 [&_pre]:!overflow-hidden"
                : "max-h-[min(max(calc(100vh-640px),480px),800px)]",
            )}
          >
            {subscriptionOnly ? (
              <AuthEnabled>
                <AuthLoading>
                  <div className="relative h-64 bg-white dark:bg-gray-850">
                    <div className="absolute left-0 top-0 p-4">
                      <CodePlaceholder />
                    </div>
                  </div>
                </AuthLoading>
                <Subscribed>{codeBlockElement}</Subscribed>
                <NotSubscribed>
                  <div className="relative z-[1] flex h-64 flex-col items-center justify-center bg-white p-4 dark:bg-gray-850">
                    <div className="absolute left-0 top-0 p-4">
                      <CodePlaceholder />
                    </div>
                    <div className="relative flex flex-col items-center justify-center gap-4 text-center ">
                      <h2 className="text-xl font-medium">
                        Access the source code
                      </h2>
                      <p>
                        Unlock Ariakit Plus to view the source code for this
                        example
                      </p>
                      <Button
                        render={
                          <Command
                            variant="plus"
                            render={
                              <Link
                                href="/plus?feature=new-examples"
                                scroll={false}
                              />
                            }
                          />
                        }
                      >
                        Unlock Ariakit Plus
                      </Button>
                    </div>
                  </div>
                </NotSubscribed>
              </AuthEnabled>
            ) : (
              codeBlockElement
            )}
          </TabPanel>
        )}
        {subscriptionOnly ? (
          <AuthEnabled>
            <Subscribed>{collapseButton}</Subscribed>
          </AuthEnabled>
        ) : (
          collapseButton
        )}
      </div>
      {/* <Editor theme={theme} files={files} codeBlocks={codeBlocks} /> */}
    </div>
  );
}
