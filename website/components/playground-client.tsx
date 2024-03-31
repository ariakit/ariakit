"use client";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { invariant } from "@ariakit/core/utils/misc";
import { Button, Tab, TabList, TabPanel, useTabStore } from "@ariakit/react";
import { useUpdateEffect } from "@ariakit/react-core/utils/hooks";
import { ChevronDown } from "icons/chevron-down.tsx";
import { ChevronUp } from "icons/chevron-up.tsx";
import { NewWindow } from "icons/new-window.tsx";
import Link from "next/link.js";
import { flushSync } from "react-dom";
import { twJoin } from "tailwind-merge";
import useLocalStorageState from "use-local-storage-state";
import { tsToJsFilename } from "utils/ts-to-js-filename.ts";
import {
  AuthEnabled,
  AuthLoading,
  NotSubscribed,
  Subscribed,
} from "./auth.tsx";
import { CodePlaceholder } from "./code-placeholder.tsx";
import { Command } from "./command.tsx";
import type { EditorProps } from "./editor.ts";
// import { Editor } from "./editor.ts";
import { PlaygroundBrowser } from "./playground-browser.tsx";
import { PlaygroundToolbar } from "./playground-toolbar.tsx";
import { PreviewToolbar } from "./preview-toolbar.tsx";
import { TooltipButton } from "./tooltip-button.tsx";

export interface PlaygroundClientProps extends EditorProps {
  id: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  githubLink?: string;
  previewLink?: string;
  preview?: ReactNode;
  abstracted?: boolean;
  plus?: boolean;
  type?: "code" | "compact" | "wide" | "full";
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

  const [collapsible, setCollapsible] = useState(false);
  const [collapsed, setCollapsed] = useState(true);

  const tab = useTabStore({
    defaultSelectedId: getTabId(firstFile),
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

  const tabPanelRef = useRef<HTMLDivElement>(null);
  const collapseRef = useRef<HTMLButtonElement>(null);
  const expandRef = useRef<HTMLButtonElement>(null);
  const isRadix = /\-radix/.test(id);

  useLayoutEffect(() => {
    const tabPanel = tabPanelRef.current;
    if (!tabPanel) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        flushSync(() => {
          setCollapsible(entry.target.scrollHeight > entry.target.clientHeight);
        });
      }
    });
    const mutationObserver = new MutationObserver((entries) => {
      for (const entry of entries) {
        if (entry.type !== "childList") continue;
        for (const node of entry.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          if (node.tagName !== "PRE") continue;
          resizeObserver.observe(node);
        }
      }
    });
    mutationObserver.observe(tabPanel, { childList: true });
    const pre = tabPanel.querySelector("pre");
    if (pre) {
      resizeObserver.observe(pre);
    }
    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

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
      className="absolute left-1/2 mt-2 flex h-8 -translate-x-1/2 scroll-mb-2 items-center justify-center gap-1 rounded border border-gray-300 bg-gray-150 pl-4 pr-2 text-sm text-black/80 shadow-sm hover:bg-gray-250 hover:text-black/90 focus-visible:ariakit-outline dark:border-gray-650 dark:bg-gray-750 dark:text-white/90 dark:shadow-sm-dark dark:hover:border-gray-550 dark:hover:bg-gray-650 dark:hover:text-white"
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
    <div
      className={twJoin(
        type === "code" && "max-w-[--size-lg]",
        type === "compact" && "max-w-[--size-lg]",
        type === "wide" &&
          "max-w-[calc(var(--size-2xl)-var(--page-padding)*2)]",
      )}
    >
      <div
        className={twJoin(
          "[--toolbar-height:58px] sm:[--toolbar-height:50px]",
          "grid w-full grid-cols-[repeat(auto-fit,minmax(min(520px,100%),1fr))] justify-items-center [direction:rtl] [[data-level='1']_&]:md:mt-12",
          "border-gray-300 dark:border-gray-650",
          type === "full"
            ? "-mx-[--page-padding] w-[calc(100%+var(--page-padding)*2)] border-b"
            : "gap-4 rounded-lg md:gap-6 md:gap-x-4 md:rounded-xl",
        )}
      >
        {preview && (
          <div
            className={twJoin(
              id,
              "[direction:ltr]",
              "top-[72px] grid w-full grid-rows-[var(--toolbar-height)_1fr_var(--toolbar-height)] gap-4 rounded-[inherit] border-[inherit] bg-gray-150 dark:bg-gray-850",
              type === "full" && "border-t",
              isRadix && "dark bg-gradient-to-br from-blue-600 to-purple-600",
            )}
          >
            <div className="flex items-center border border-transparent px-1">
              {previewLink && (
                <TooltipButton
                  title="Open preview in a new tab"
                  className={twJoin(
                    "ml-auto size-12 rounded-md p-0 sm:size-10 sm:rounded-lg",
                    isRadix
                      ? "text-white"
                      : "text-black/80 hover:text-black dark:text-white/70 dark:hover:text-white",
                  )}
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
            </div>
            <div
              className={twJoin(
                "flex size-full flex-1 flex-col items-center justify-center overflow-x-auto",
                type === "wide" &&
                  "md:min-h-[240px] [[data-level='1']_&]:md:min-h-max",
              )}
            >
              {preview}
            </div>
            {type === "wide" && false && (
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
            <div className="w-full overflow-hidden rounded-[inherit] border border-[inherit] bg-gray-150 dark:bg-gray-850">
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
        <div
          className={twJoin(
            "sticky top-[--header-height] h-max w-full rounded-[inherit] border-[inherit] [direction:ltr]",
            type !== "full" && "max-w-[--size-lg]",
          )}
        >
          <div className="relative z-[12] flex h-[--toolbar-height] items-center gap-2 rounded-t-[inherit] border border-[inherit] bg-gray-100 dark:bg-gray-750">
            <TabList
              store={tab}
              className="flex size-full flex-row items-center overflow-x-auto px-2 sm:gap-2"
            >
              {Object.keys(files).map((file) => (
                <Tab
                  key={file}
                  id={getTabId(file)}
                  className="flex-start group relative flex h-10 items-center justify-center whitespace-nowrap rounded bg-transparent px-2 text-sm tracking-tight text-black/75 outline-none hover:bg-black/5 hover:text-black aria-selected:text-black data-[focus-visible]:ariakit-outline-input dark:text-white/75 dark:hover:bg-white/5 dark:hover:text-white dark:aria-selected:text-white sm:h-8"
                >
                  <span>{isJS ? tsToJsFilename(file) : file}</span>
                  <div className="pointer-events-none absolute left-0 top-full h-[3px] w-full translate-y-[5px] bg-transparent group-aria-selected:bg-blue-600 dark:group-aria-selected:bg-blue-600" />
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
              ref={tabPanelRef}
              store={tab}
              tabId={selectedId}
              className={twJoin(
                collapsed
                  ? "[--max-height:256px] [[data-level='1']_&]:md:[--max-height:440px]"
                  : "[--max-height:min(max(calc(100vh-320px),640px),800px)]",
                "relative overflow-hidden rounded-b-[inherit] bg-white dark:bg-gray-850",
                "border-[inherit] focus-visible:z-[13] focus-visible:ariakit-outline-input",
                "min-h-[min(calc(100%-var(--toolbar-height)),var(--max-height))]",
                "max-h-[--max-height]",
                type === "full" ? "border-x" : "border border-t-0",
                collapsed && "[&_pre]:!overflow-hidden",
              )}
            >
              {subscriptionOnly ? (
                <AuthEnabled>
                  <AuthLoading>
                    <div className="relative h-[--max-height] bg-white dark:bg-gray-850">
                      <div className="absolute left-0 top-0 p-4 pl-8">
                        <CodePlaceholder />
                      </div>
                    </div>
                  </AuthLoading>
                  <Subscribed>{codeBlockElement}</Subscribed>
                  <NotSubscribed>
                    <div className="relative z-[1] flex h-[--max-height] flex-col items-center justify-center bg-white p-4 dark:bg-gray-850">
                      <div className="absolute left-0 top-0 p-4 pl-8">
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
                                  href="/plus?feature=examples"
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
    </div>
  );
}
