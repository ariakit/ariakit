import { invariant } from "@ariakit/core/utils/misc";
import * as ak from "@ariakit/react";
import { Store, useStore } from "@tanstack/react-store";
import * as React from "react";
import useLocalStorageState from "use-local-storage-state";
import { Thumbnail } from "../examples/popover/thumb.react.tsx";
import { Icon } from "../icons/icon.react.tsx";
import { cn } from "../lib/cn.ts";
import { useHydrated } from "../lib/use-hydrated.ts";
import type {
  CodeBlockProps as CodeBlockBaseProps,
  CodeBlockTabProps,
} from "./code-block.types.ts";
import { CopyCode } from "./copy-code.react.tsx";
import { Tooltip } from "./tooltip.react.tsx";

const openTabs = new Store<Record<string, string>>({});

function getTabId(prefix: string, filename?: string) {
  if (!filename) return prefix;
  return `${prefix}/${filename}`;
}

function getFilename(id?: string | null) {
  if (!id) return;
  const [, filename] = id.split(/\/(.*)/);
  return filename;
}

interface UseCollapsibleProps {
  collapsible: boolean;
}

function useCollapsible<T extends HTMLElement>({
  collapsible,
}: UseCollapsibleProps) {
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const expandButtonRef = React.useRef<HTMLButtonElement>(null);
  const scrollableRef = React.useRef<T>(null);
  const [_collapsed, setCollapsed] = React.useState(true);
  const collapsed = collapsible && _collapsed;

  const collapse = () => {
    setCollapsed(true);
    requestAnimationFrame(() => {
      const wrapper = wrapperRef.current;
      const expandButton = expandButtonRef.current;
      expandButton?.focus({ preventScroll: true });
      wrapper?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  };

  const expand = () => {
    setCollapsed(false);
    requestAnimationFrame(() => {
      const wrapper = wrapperRef.current;
      const scrollable = scrollableRef.current;
      scrollable?.focus({ preventScroll: true });
      wrapper?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  };

  const scrollableProps = {
    ref: scrollableRef,
    inert: collapsed ? "" : undefined,
    tabIndex: -1,
    "aria-hidden": collapsed,
    onKeyDown: (event: React.KeyboardEvent<T>) => {
      if (event.key === "Escape") {
        collapse();
      }
    },
  };

  const expandButton =
    collapsible && collapsed ? (
      <button
        ref={expandButtonRef}
        onClick={expand}
        className="absolute group/expand grid outline-none ak-frame-cover/1 py-2 inset-0 ak-layer-current bg-transparent bg-gradient-to-b from-transparent from-[calc(100%-var(--line-height)*8)] to-[calc(100%-var(--line-height))] to-(--ak-layer) z-1 justify-center items-end"
      >
        <div className="ak-button h-9 ak-layer-pop text-sm/[1.5rem] hover:ak-layer-hover group-focus-visible/expand:ak-button_focus group-active/expand:ak-button_active">
          Expand code
          <Icon className="text-base" name="chevronDown" />
        </div>
      </button>
    ) : null;

  const collapseButton = (
    <div className="sticky bottom-2 my-2">
      {collapsible && !collapsed && (
        <div className="grid justify-center">
          <button
            onClick={collapse}
            className="ak-button ak-layer border h-9 text-sm/[1.5rem]"
          >
            Collapse code
            <Icon className="text-base" name="chevronUp" />
          </button>
        </div>
      )}
    </div>
  );

  return {
    wrapperRef,
    collapsed,
    expandButton,
    scrollableProps,
    collapseButton,
  };
}

function SingleTabPanel(props: ak.TabPanelProps) {
  const store = ak.useTabContext();
  const tabId = ak.useStoreState(
    store,
    (state) => props.tabId ?? state?.selectedId,
  );
  return <ak.TabPanel focusable={false} {...props} tabId={tabId} />;
}

export interface PanelProps {
  storeId: string;
  children: React.ReactNode;
  filename: string;
  defaultOpen?: boolean;
}

export function CodeBlockTabPanel({
  storeId,
  children,
  filename,
  defaultOpen = false,
}: PanelProps) {
  const hydrated = useHydrated();

  const open = useStore(openTabs, (state) => {
    const tab = state[storeId];
    if (!tab || !hydrated) return defaultOpen;
    return tab === filename;
  });

  return <>{open && children}</>;
}

export interface CodeBlockProps
  extends Omit<React.ComponentProps<"div">, "lang">,
    CodeBlockBaseProps {
  topbar?: React.ReactNode;
  showFilename?: boolean;
  renderContent?: (content: React.ReactElement) => React.ReactNode;
}

export function CodeBlock({
  code,
  lang,
  lineNumbers,
  maxLines,
  highlightLines,
  highlightTokens,
  filename,
  filenameIcon,
  showFilename,
  topbar,
  renderContent,
  children,
  ...props
}: CodeBlockProps) {
  const lineCount = code.trimEnd().split("\n").length;
  const collapsible = maxLines !== undefined && lineCount > maxLines;
  const {
    collapsed,
    wrapperRef,
    scrollableProps,
    expandButton,
    collapseButton,
  } = useCollapsible<HTMLPreElement>({ collapsible });

  const defaultContent = (
    <div
      className={cn(
        "ak-tab-panel ak-frame-cover/0 relative grid overflow-hidden",
        "has-[pre:focus-visible]:after:outline-2 after:ak-outline-primary after:absolute after:inset-0 after:z-3 after:pointer-events-none after:ak-frame after:-outline-offset-2",
      )}
      style={
        {
          "--max-lines": maxLines,
          "--line-height": "1.75em",
        } as React.CSSProperties
      }
    >
      <div className="absolute top-0 end-0 ak-frame-cover/1.5 z-2 pointer-events-none size-max">
        <CopyCode
          text={code}
          data-single-line={lineCount === 1 || undefined}
          className="pointer-events-auto [@media(hover:hover)]:not-data-open:not-group-has-hover:not-group-has-focus-visible:sr-only"
        />
      </div>
      <pre
        {...scrollableProps}
        className={cn(
          "whitespace-normal text-sm/(--line-height) ak-frame-cover/0 outline-none",
          collapsible &&
            !collapsed &&
            "overflow-auto max-h-[min(calc(100svh-12rem),60rem)]",
          collapsed && "max-h-[calc(var(--max-lines)*var(--line-height))]",
          lineCount === 1 ? "h-12 grid items-center" : "py-4",
        )}
      >
        {children}
      </pre>
      {expandButton}
    </div>
  );

  const content = renderContent
    ? renderContent(defaultContent)
    : defaultContent;

  return (
    <div
      {...props}
      ref={wrapperRef}
      className={cn("flex flex-col isolate scroll-my-2", props.className)}
    >
      <div
        className={cn(
          "ak-layer group peer @container ak-light:ak-edge/15 ak-frame-border ak-frame-container/0 relative overflow-clip ak-tabs flex flex-col scroll-my-2",
        )}
        data-collapsible={collapsible || undefined}
        data-collapsed={collapsed || undefined}
      >
        {topbar
          ? topbar
          : showFilename &&
            filename && (
              <div className="ak-tab-list ak-light:ak-layer-down-0.5 text-sm">
                <div className="base:ak-tab-folder_idle ak-tab-folder_selected select-auto cursor-auto">
                  <div className="py-1.5">
                    {filenameIcon && <Icon name={filenameIcon} />}
                    {filename}
                  </div>
                </div>
              </div>
            )}
        {content}
      </div>
      {collapseButton}
    </div>
  );
}

export interface CodeBlockTabsProps
  extends Omit<
    CodeBlockProps,
    | "code"
    | "lang"
    | "highlightLines"
    | "highlightTokens"
    | "filename"
    | "showFilename"
    | "filenameIcon"
    | "topbar"
  > {
  storeId: string;
  tabs: CodeBlockTabProps[];
  persistTabKey?: string;
  preview?: boolean;
  aiPrompt?: string;
}

export function CodeBlockTabs({
  storeId,
  tabs,
  persistTabKey,
  aiPrompt,
  preview,
  ...props
}: CodeBlockTabsProps) {
  const [firstTab] = tabs;
  invariant(firstTab, "At least one tab is required");

  const [loaded, setLoaded] = React.useState(false);

  const canPersist = persistTabKey !== undefined;
  const [
    persistedFilename = preview ? "preview" : firstTab.filename,
    setPersistedFilename,
  ] = useLocalStorageState<string | undefined>(
    persistTabKey ?? "code-block-tabs",
  );

  const defaultTabId = getTabId(storeId, persistedFilename);
  const tabStore = ak.useTabStore({
    defaultSelectedId: defaultTabId,
    ...(canPersist && {
      selectedId: getTabId(storeId, persistedFilename),
      setSelectedId: (id) => setPersistedFilename(getFilename(id)),
    }),
  });
  const selectedTabId = ak.useStoreState(tabStore, "selectedId");
  const isPreview = selectedTabId === getTabId(storeId, "preview");

  const selectedTab = tabs.find(
    (tab) => getTabId(storeId, tab.filename) === selectedTabId,
  );
  const filename = selectedTab?.filename;
  const hasToolbar = !!aiPrompt;

  React.useEffect(() => {
    if (!storeId) return;
    if (!filename) return;
    openTabs.setState((tabs) => ({ ...tabs, [storeId]: filename }));
  }, [storeId, filename]);

  const renderTopbar = () => (
    <div
      className={cn(
        isPreview &&
          "absolute z-1 inset-0 bottom-auto ak-frame-container/1 pointer-events-none *:pointer-events-auto flex items-start",
        !isPreview &&
          "ak-layer-down ak-light:ak-layer-down-0.5 grid grid-cols-[1fr_auto] [--height:--spacing(10)] h-(--height)",
        hasToolbar && "[--height:--spacing(12)]",
      )}
    >
      <ak.TabList
        className={cn(
          !isPreview &&
            "ak-tab-list ak-layer-(--ak-layer-parent) !rounded-b-none",
          !isPreview && hasToolbar && "sm:ak-frame-overflow/1",
          isPreview &&
            "ak-segmented ak-layer-(--ak-layer-parent) text-sm max-sm:ak-frame-container/0.5 h-10 sm:h-[calc(--spacing(10)+var(--ak-frame-padding))]",
        )}
      >
        {preview && (
          <ak.Tab
            className={cn(
              !isPreview &&
                "ak-tab-folder data-focus-visible:ak-tab-folder_focus h-full text-sm",
              isPreview &&
                "ak-segmented-button aria-selected:ak-edge/10 not-aria-selected:px-4 not-aria-selected:sm:px-3 px-1.5 sm:px-2",
            )}
            id={getTabId(storeId, "preview")}
          >
            {isPreview ? (
              <>
                <Icon name="preview" />
                Preview
              </>
            ) : (
              <div>
                <Icon name="preview" />
                Preview
              </div>
            )}
          </ak.Tab>
        )}
        {tabs.map((tabItem, index) => {
          if (isPreview && index > 0) return null;
          return (
            <ak.Tab
              key={tabItem.filename || index}
              data-key={tabItem.filename || index}
              className={cn(
                !isPreview &&
                  "ak-tab-folder data-focus-visible:ak-tab-folder_focus h-full text-sm",
                isPreview &&
                  "ak-segmented-button aria-selected:ak-edge/10 not-aria-selected:px-4 not-aria-selected:sm:px-3 px-1.5 sm:px-2",
              )}
              id={getTabId(storeId, tabItem.filename)}
            >
              {isPreview ? (
                <>
                  <Icon name="code" />
                  Code
                </>
              ) : (
                <div>
                  {tabItem.filenameIcon && <Icon name={tabItem.filenameIcon} />}
                  {tabItem.filename || tabItem.lang}
                </div>
              )}
            </ak.Tab>
          );
        })}
      </ak.TabList>
      {hasToolbar && (
        <div className="ms-auto ak-frame-cover/1 ak-frame-cover-start ak-frame-cover-end h-(--height) flex gap-1">
          <button className="ak-button @xl:text-sm @max-xl:ak-button-square h-full ak-text/80">
            <Icon name="sparks" className="text-lg" />
            <span className="@max-xl:sr-only">Copy AI prompt</span>
          </button>
          <Tooltip title="Edit code">
            <button className="ak-button ak-button-square h-full">
              <Icon name="edit" className="text-lg" />
              <span className="sr-only">Edit code</span>
            </button>
          </Tooltip>
        </div>
      )}
    </div>
  );

  return (
    <ak.TabProvider store={tabStore}>
      <div className="relative">
        <CodeBlock
          {...props}
          {...selectedTab}
          className={cn(
            isPreview && "*:ak-layer-down-0.3 *:ak-dark:ak-edge/13",
          )}
          code={selectedTab?.code || ""}
          topbar={renderTopbar()}
          renderContent={(content) => {
            return (
              <>
                {preview && (isPreview || loaded) && (
                  <ak.TabPanel
                    focusable={false}
                    scrollRestoration
                    scrollElement={(panel) => {
                      const iframe = panel.querySelector("iframe");
                      return iframe?.contentDocument?.documentElement || null;
                    }}
                    tabId={getTabId(storeId, "preview")}
                    render={
                      preview ? (
                        <div className="ak-tab-panel ak-frame-cover-start">
                          <PreviewBlock
                            example="popover"
                            framework="react"
                            fallback={<Thumbnail />}
                            onLoad={() => setLoaded(true)}
                          />
                        </div>
                      ) : undefined
                    }
                  />
                )}
                {!isPreview && (
                  <SingleTabPanel
                    scrollRestoration
                    scrollElement={(panel) => panel.querySelector("pre")}
                    render={content}
                  />
                )}
              </>
            );
          }}
        />
      </div>
    </ak.TabProvider>
  );
}

export interface PreviewBlockProps {
  example: string;
  framework: string;
  fallback?: React.ReactNode;
  onLoad?: () => void;
}

export function PreviewBlock({
  example,
  framework,
  fallback,
  onLoad: onLoadProp,
}: PreviewBlockProps) {
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = React.useState(false);

  const previewUrl = `/${framework}/previews/${example}`;

  React.useEffect(() => {
    setLoaded(false);
  }, [previewUrl]);

  React.useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    let timeout = 0;
    let raf = 0;

    const onLoad = () => {
      const doc = iframe.contentDocument;
      if (!doc) return;
      doc.documentElement.dataset.iframe = "true";

      const clickButtonAndCheckDialog = () => {
        doc.body.inert = true;
        doc.body.style.paddingTop = "0px";
        const button = doc.querySelector("button");
        if (!button) return;
        button.click();

        // Wait for the dialog to be visible
        timeout = window.setTimeout(() => {
          const dialog = doc.querySelector<HTMLDialogElement>("[data-dialog]");
          if (!dialog || dialog.hasAttribute("hidden")) {
            // If dialog doesn't exist yet or is hidden, try again after a short
            // delay
            doc.body.inert = false;
            timeout = window.setTimeout(clickButtonAndCheckDialog, 84);
            return;
          }
          dialog.style.setProperty("transition", "none", "important");

          // Dialog exists and is not hidden, proceed with positioning
          raf = requestAnimationFrame(() => {
            const bottom = dialog.getBoundingClientRect().bottom;
            if (bottom == null) return;
            const totalHeight = iframe.contentWindow?.innerHeight;
            if (totalHeight == null) return;
            const paddingTop = `calc(${totalHeight - bottom}px / 2)`;
            doc.body.style.paddingTop = paddingTop;
            button.click();

            // Wait for the dialog to be stable (no more transitions)
            raf = requestAnimationFrame(() => {
              dialog.style.removeProperty("transition");
              button.click();
              setLoaded(true);
              onLoadProp?.();
              timeout = window.setTimeout(() => {
                doc.body.inert = false;
              }, 42);
            });
          });
        }, 42);
      };

      // Start the process
      clickButtonAndCheckDialog();
    };

    iframe.addEventListener("load", onLoad);
    iframe.src = previewUrl;

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(raf);
      iframe.removeEventListener("load", onLoad);
    };
  }, [previewUrl]);

  return (
    <>
      <div className="relative h-117">
        <iframe
          ref={iframeRef}
          width="100%"
          height="100%"
          title={`Preview of ${example}`}
        />
        {!loaded && (
          <div className="absolute inset-0 ak-layer-current ak-frame-cover/4 grid items-center justify-center">
            <div className="opacity-50">
              <div className="animate-pulse">{fallback}</div>
            </div>
          </div>
        )}
      </div>
      {/* <div
        className={cn(
          "ak-layer-canvas-down-0.3 ak-frame-playground/0 relative ak-frame-border overflow-clip h-117",
          "hidden",
        )}
      >
        <div className="absolute z-1 inset-0 bottom-auto ak-frame-container/1 pointer-events-none *:pointer-events-auto flex items-start">
          <ak.TabProvider
            defaultSelectedId={mode}
            setSelectedId={(id) =>
              setMode(id === "preview" ? "preview" : "code")
            }
          >
            <ak.TabList className="ak-segmented text-sm max-sm:ak-frame-container/0.5 h-10 sm:h-[calc(--spacing(10)+var(--ak-frame-padding))]">
              <ak.Tab
                id="preview"
                className="ak-segmented-button not-aria-selected:px-4 not-aria-selected:sm:px-3 px-1.5 sm:px-2"
              >
                <Icon name="preview" />
                Preview
              </ak.Tab>
              <ak.Tab
                id="code"
                className="ak-segmented-button not-aria-selected:px-4 not-aria-selected:sm:px-3 px-1.5 sm:px-2"
              >
                <Icon name="code" />
                Code
              </ak.Tab>
            </ak.TabList>
          </ak.TabProvider>
          <div className="ms-auto flex gap-1 h-10">
            <button className="ak-button sm:text-sm max-sm:ak-button-square h-full ak-text/80">
              <Icon name="sparks" className="text-lg" />
              <span className="max-sm:sr-only">Copy AI prompt</span>
            </button>
            <Tooltip title="Edit code">
              <button className="ak-button ak-button-square h-full">
                <Icon name="edit" className="text-lg" />
                <span className="sr-only">Edit code</span>
              </button>
            </Tooltip>
            <Tooltip title="Open preview in new tab">
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ak-button ak-button-square h-full text-lg"
              >
                <Icon name="newWindow" />
                <span className="sr-only">Open preview in new tab</span>
              </a>
            </Tooltip>
          </div>
        </div>
        <iframe
          ref={iframeRef}
          width="100%"
          height="100%"
          title={`Preview of ${example}`}
        />
        {!loaded && (
          <div className="absolute inset-0 ak-layer-current ak-frame-cover/4 grid items-center justify-center">
            <div className="opacity-50">
              <div className="animate-pulse">{fallback}</div>
            </div>
          </div>
        )}
      </div> */}
    </>
  );
}
