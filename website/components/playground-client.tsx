"use client";
import { invariant } from "@ariakit/core/utils/misc";
import { Button, Tab, TabList, TabPanel, useTabStore } from "@ariakit/react";
import { useUpdateEffect } from "@ariakit/react-core/utils/hooks";
import Link from "next/link.js";
import type { ReactNode } from "react";
import {
  Suspense,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal, flushSync } from "react-dom";
import { twJoin } from "tailwind-merge";
import useLocalStorageState from "use-local-storage-state";
import { ChevronDown } from "@/icons/chevron-down.tsx";
import { ChevronUp } from "@/icons/chevron-up.tsx";
import { NewWindow } from "@/icons/new-window.tsx";
import { tsToJsFilename } from "@/lib/ts-to-js-filename.ts";
import {
  AuthEnabled,
  AuthLoaded,
  AuthLoading,
  NotSubscribed,
  Subscribed,
} from "./auth.tsx";
import { CodePlaceholder } from "./code-placeholder.tsx";
import { Command } from "./command.tsx";
import { PageHeroContext } from "./page-context.tsx";
import { PlaygroundBrowser } from "./playground-browser.tsx";
import { PlaygroundEditButton } from "./playground-edit.tsx";
import { PlaygroundToolbar } from "./playground-toolbar.tsx";
import { TooltipButton } from "./tooltip-button.tsx";

export interface PlaygroundClientProps {
  id: string;
  files: Record<string, string>;
  codeBlocks: Record<string, ReactNode>;
  javascript?: Record<string, { code: string; codeBlock: ReactNode }>;
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
    `${id}-${file.replace("/", "__").replace(/\.([^.]+)$/, "-$1")}`;

  const getFileFromTabId = (tabId: string) =>
    tabId
      .replace(`${id}-`, "")
      .replace("__", "/")
      .replace(/-([^-]+)$/, ".$1");

  const firstFile = Object.keys(files)[0];

  invariant(firstFile, "No files provided");

  const inHero = useContext(PageHeroContext);
  const isAppDir = /^(page|layout)\.[tj]sx?/.test(firstFile);

  const [language, setLanguage] = useLocalStorageState<"ts" | "js">(
    "language",
    { defaultValue: "ts" },
  );
  const isJS = language === "js";

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

  const linesCount = content ? content.split("\n").length : 0;
  const [collapsible, setCollapsible] = useState(linesCount >= 20);
  const [collapsed, setCollapsed] = useState(true);

  const tabPanelRef = useRef<HTMLDivElement>(null);
  const collapseRef = useRef<HTMLButtonElement>(null);
  const expandRef = useRef<HTMLButtonElement>(null);
  const isRadix = /-radix/.test(id);

  const [callToActionSlot, setCallToActionSlot] = useState<HTMLElement | null>(
    null,
  );

  useEffect(() => {
    setCallToActionSlot(document.getElementById("call-to-action-slot"));
  }, []);

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
  }, [selectedId]);

  const javascriptFiles = useMemo(
    () =>
      Object.entries(files).reduce<typeof files>(
        (acc, [file, code]) => ({
          // biome-ignore lint/performance/noAccumulatingSpread: TODO
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
      exampleId={id}
      files={files}
      javascriptFiles={javascriptFiles}
      dependencies={dependencies}
      devDependencies={devDependencies}
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
        data-call-to-action
        className="pointer-events-none absolute left-0 top-20 flex w-full justify-center"
      >
        <Suspense>
          <AuthEnabled>
            {inHero && (
              <div className="grid w-full max-w-[calc(var(--size-content-box)+var(--page-padding)*2)] justify-end px-[--page-padding] max-md:hidden">
                <PlaygroundEditButton
                  type="call-to-action"
                  exampleId={id}
                  files={files}
                  javascriptFiles={javascriptFiles}
                  dependencies={dependencies}
                  devDependencies={devDependencies}
                  language={language}
                  className="pointer-events-auto w-max [view-timeline-inset:var(--header-height)_calc(100%_-_var(--header-height))] [view-timeline-name:--call-to-action] [body:has(&)]:[timeline-scope:--call-to-action]"
                />
                <AuthLoaded>
                  {callToActionSlot &&
                    createPortal(
                      <div className="hidden ease-linear [animation-duration:1ms] [animation-fill-mode:both] [animation-name:appear] [animation-range:cover] [animation-timeline:--call-to-action] supports-[animation-timeline:scroll()]:block max-lg:!hidden max-lg:animate-none">
                        <PlaygroundEditButton
                          exampleId={id}
                          files={files}
                          javascriptFiles={javascriptFiles}
                          dependencies={dependencies}
                          devDependencies={devDependencies}
                          language={language}
                        />
                      </div>,
                      callToActionSlot,
                    )}
                </AuthLoaded>
              </div>
            )}
          </AuthEnabled>
        </Suspense>
      </div>
      <div
        className={twJoin(
          "[--toolbar-height:58px] sm:[--toolbar-height:50px]",
          "grid grid-cols-[repeat(auto-fit,minmax(min(520px,100%),1fr))] justify-items-center [direction:rtl] [[data-level='1']_&]:md:mt-12",
          "border-gray-300 dark:border-gray-650",
          type === "full"
            ? "-mx-[--page-padding] w-[calc(100%+var(--page-padding)*2)] border-b"
            : "w-full gap-4 rounded-lg md:gap-6 md:gap-x-4 md:rounded-xl",
        )}
      >
        {preview && (
          <div
            className={twJoin(
              id,
              "[direction:ltr]",
              "grid w-full grid-rows-[var(--toolbar-height)_1fr_var(--toolbar-height)] gap-4 rounded-[inherit] border-[inherit] bg-gray-150 dark:bg-gray-850",
              type === "wide" &&
                "md:min-h-[320px] [[data-level='1']_&]:md:min-h-max",
              type === "full" && "border border-b-0",
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
              data-preview-render-target
              className="flex size-full flex-col justify-center overflow-auto p-4 *:mx-auto"
            >
              {preview}
            </div>
          </div>
        )}
        {isAppDir && previewLink && (
          <div
            className={twJoin(
              "flex w-full flex-col rounded-[inherit] border border-[inherit] bg-gray-150 [direction:ltr] dark:bg-gray-850",
              type === "full" && "border-b-0",
              type === "wide" && "min-h-[480px]",
            )}
          >
            <PlaygroundBrowser previewLink={previewLink} />
          </div>
        )}
        <div
          className={twJoin(
            "sticky top-[--header-height] h-max w-full rounded-[inherit] border-[inherit] [direction:ltr]",
            type !== "full" && "max-w-[--size-lg]",
          )}
        >
          <div
            className={twJoin(
              "relative z-[12] flex h-[--toolbar-height] items-center gap-2 rounded-t-[inherit] border-[inherit] bg-gray-100 dark:bg-gray-750",
              type === "full" ? "border-y" : "border",
            )}
          >
            <TabList
              store={tab}
              className="flex size-full flex-row items-center overflow-x-auto px-2 sm:gap-2"
            >
              {Object.keys(files).map((file) => (
                <Tab
                  key={file}
                  id={getTabId(file)}
                  className="flex-start group relative flex h-10 items-center justify-center whitespace-nowrap rounded bg-transparent px-2 text-sm tracking-tight text-black/75 outline-none hover:bg-black/5 hover:text-black aria-selected:text-black data-[focus-visible]:ariakit-outline-input sm:h-8 dark:text-white/75 dark:hover:bg-white/5 dark:hover:text-white dark:aria-selected:text-white"
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
              scrollRestoration
              scrollElement={(panel) => panel.querySelector("pre")}
              className={twJoin(
                collapsed
                  ? "[--max-height:256px] [[data-level='1']_&]:md:[--max-height:440px]"
                  : "[--max-height:min(max(calc(100vh-320px),640px),800px)]",
                "relative overflow-hidden rounded-b-[inherit] bg-white dark:bg-gray-850",
                "border-[inherit] focus-visible:z-[13] focus-visible:ariakit-outline-input",
                "min-h-[min(calc(100%-var(--toolbar-height)),var(--max-height))]",
                "max-h-[--max-height]",
                type !== "full" && "border border-t-0",
                collapsed && "[&_pre]:!overflow-y-hidden",
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
