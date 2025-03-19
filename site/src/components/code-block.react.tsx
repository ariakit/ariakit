import { invariant } from "@ariakit/core/utils/misc";
import * as ak from "@ariakit/react";
import { Store, useStore } from "@tanstack/react-store";
import {
  type CSSProperties,
  type ComponentProps,
  useEffect,
  useRef,
  useState,
} from "react";
import useLocalStorageState from "use-local-storage-state";
import { Icon } from "../icons/icon.react.tsx";
import { cn } from "../lib/cn.ts";
import { onIdle } from "../lib/on-idle.ts";
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

export interface CodeBlockTabsProps
  extends Omit<CodeBlockProps, "code" | "storeId" | "tabs">,
    Required<Pick<CodeBlockProps, "storeId" | "tabs">> {
  persistTabKey?: string;
}

export function CodeBlockTabs({
  storeId,
  tabs,
  persistTabKey,
  ...props
}: CodeBlockTabsProps) {
  const [firstTab] = tabs;
  invariant(firstTab, "At least one tab is required");

  const canPersist = persistTabKey !== undefined;
  const [persistedFilename = firstTab.filename, setPersistedFilename] =
    useLocalStorageState<string | undefined>(
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

  const selectedTab = tabs.find(
    (tab) => getTabId(storeId, tab.filename) === selectedTabId,
  );
  invariant(selectedTab, "Selected tab not found");
  const filename = selectedTab.filename;

  useEffect(() => {
    if (!storeId) return;
    return onIdle(() => {
      openTabs.setState((tabs) => ({
        ...tabs,
        [storeId]: filename,
      }));
    });
  }, [storeId, filename]);

  return (
    <ak.TabProvider store={tabStore}>
      <CodeBlock {...props} storeId={storeId} tabs={tabs} {...selectedTab} />
    </ak.TabProvider>
  );
}

export interface CodeBlockProps
  extends Omit<ComponentProps<"div">, "lang">,
    CodeBlockBaseProps {
  storeId?: string;
  tabs?: CodeBlockTabProps[];
  aiPrompt?: string;
  tabStore?: ak.TabStore;
  showFilename?: boolean;
}

export function CodeBlock({
  code,
  lang,
  lineNumbers,
  maxLines,
  highlightLines,
  highlightTokens,
  storeId,
  filename,
  filenameIcon,
  showFilename,
  aiPrompt,
  tabs,
  children,
  ...props
}: CodeBlockProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const expandButtonRef = useRef<HTMLButtonElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const lineCount = code.trimEnd().split("\n").length;
  const collapsible = maxLines !== undefined && lineCount > maxLines;
  const [_collapsed, setCollapsed] = useState(true);
  const collapsed = collapsible && _collapsed;
  const hasToolbar = !!aiPrompt;

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
      const pre = preRef.current;
      pre?.focus({ preventScroll: true });
      wrapper?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  };

  const content = (
    <div
      className={cn(
        "ak-tab-panel ak-frame-cover/0 relative grid overflow-hidden",
        "has-[pre:focus-visible]:after:outline-2 after:ak-outline-primary after:absolute after:inset-0 after:z-3 after:pointer-events-none after:ak-frame after:-outline-offset-2",
      )}
      style={
        {
          "--max-lines": maxLines,
          "--line-height": "1.75em",
        } as CSSProperties
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
        // @ts-expect-error - inert property is not yet in TypeScript DOM types
        inert={collapsed ? "" : undefined}
        ref={preRef}
        aria-hidden={collapsed}
        tabIndex={-1}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            collapse();
          }
        }}
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
      {collapsible && collapsed && (
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
      )}
    </div>
  );

  return (
    <div
      {...props}
      ref={wrapperRef}
      className={cn("flex flex-col isolate scroll-my-2", props.className)}
    >
      <div
        className={cn(
          "ak-layer group peer ak-light:ak-edge/8 ak-frame-border ak-frame-container/0 relative overflow-clip ak-tabs flex flex-col scroll-my-2",
          hasToolbar && "sm:ak-frame-playground",
        )}
        data-collapsible={collapsible || undefined}
        data-collapsed={collapsed || undefined}
      >
        {tabs && storeId ? (
          <>
            <div
              className={cn(
                "ak-layer-down ak-light:ak-layer-down-0.5 grid grid-cols-[1fr_auto] [--height:--spacing(10)] h-(--height)",
                hasToolbar && "[--height:--spacing(12)]",
              )}
            >
              <ak.TabList
                className={cn(
                  "ak-tab-list ak-layer-(--ak-layer-parent) !rounded-b-none",
                  hasToolbar && "sm:ak-frame-overflow/1",
                )}
              >
                {tabs.map((tabItem, index) => (
                  <ak.Tab
                    key={tabItem.filename || index}
                    className="ak-tab-folder data-focus-visible:ak-tab-folder_focus h-full text-sm"
                    id={getTabId(storeId, tabItem.filename)}
                  >
                    <div>
                      {tabItem.filenameIcon && (
                        <Icon name={tabItem.filenameIcon} />
                      )}
                      {tabItem.filename || tabItem.lang}
                    </div>
                  </ak.Tab>
                ))}
              </ak.TabList>
              {hasToolbar && (
                <div className="ak-frame/1 h-(--height) flex gap-1">
                  <button className="ak-button sm:text-sm max-sm:ak-button-square ak-text/80">
                    <Icon name="sparks" className="text-lg" />
                    <span className="max-sm:sr-only">Copy AI prompt</span>
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
            <SingleTabPanel
              scrollRestoration
              scrollElement={preRef}
              render={content}
            />
          </>
        ) : (
          <>
            {showFilename && (
              <div className="ak-tab-list ak-light:ak-layer-down-0.5 text-sm">
                <div className="base:ak-tab-folder_idle ak-tab-folder_selected select-auto cursor-auto">
                  <div className="py-1">
                    {filenameIcon && <Icon name={filenameIcon} />}
                    {filename}
                  </div>
                </div>
              </div>
            )}
            {content}
          </>
        )}
      </div>
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
    </div>
  );
}
