import { invariant } from "@ariakit/core/utils/misc";
import { createStore } from "@ariakit/core/utils/store";
import * as ak from "@ariakit/react";
import {
  type CSSProperties,
  type ComponentProps,
  useEffect,
  useRef,
  useState,
} from "react";
import { Icon } from "../icons/icon.react.tsx";
import { cn } from "../lib/cn.ts";
import type { CodeBlockProps } from "./code-block.types.ts";
import { CopyToClipboard } from "./copy-to-clipboard.react.tsx";

const tabStores = createStore({ stores: {} as Record<string, ak.TabStore> });

function getTabId(prefix: string, filename?: string) {
  if (!filename) return prefix;
  return `${prefix}/${filename}`;
}

// function getFilename(id?: string | null) {
//   if (!id) return;
//   const [, filename] = id.split(/\/(.*)/);
//   return filename;
// }

export interface PanelProps {
  storeId: string;
  filename?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function CodeBlockTabPanel({
  storeId,
  filename,
  defaultOpen = false,
  children,
}: PanelProps) {
  const store = ak.useStoreState(tabStores, (state) => state.stores[storeId]);
  const open = ak.useStoreState(store, (state) => {
    if (!state) return defaultOpen;
    return state.selectedId === getTabId(storeId, filename);
  });
  return <>{open && children}</>;
}

function SingleTabPanel(props: ak.TabPanelProps) {
  const store = ak.useTabContext();
  const tabId = ak.useStoreState(
    store,
    (state) => props.tabId ?? state?.selectedId,
  );
  return <ak.TabPanel focusable={false} {...props} tabId={tabId} />;
}

export interface CodeBlockTabsProps
  extends Omit<ComponentProps<"div">, "lang"> {
  storeId: string;
  tabs: CodeBlockProps[];
}

export function CodeBlockTabs({ storeId, tabs, ...props }: CodeBlockTabsProps) {
  const [firstTab] = tabs;
  invariant(firstTab, "At least one tab is required");

  const defaultTabId = getTabId(storeId, firstTab.filename);
  const tabStore = ak.useTabStore({ defaultSelectedId: defaultTabId });
  const selectedTabId = ak.useStoreState(tabStore, "selectedId");

  const selectedTab = tabs.find(
    (tab) => getTabId(storeId, tab.filename) === selectedTabId,
  );
  invariant(selectedTab, "Selected tab not found");

  useEffect(() => {
    if (!storeId) return;
    tabStores.setState("stores", (stores) => ({
      ...stores,
      [storeId]: tabStore,
    }));
  }, [tabStore, storeId]);

  return (
    <ak.TabProvider store={tabStore}>
      <CodeBlock {...props} storeId={storeId} tabs={tabs} {...selectedTab} />
    </ak.TabProvider>
  );
}

interface Props extends Omit<ComponentProps<"div">, "lang">, CodeBlockProps {
  storeId?: string;
  showFilename?: boolean;
  tabStore?: ak.TabStore;
  tabs?: CodeBlockProps[];
}

export function CodeBlock({
  storeId,
  code,
  maxLines,
  children,
  className,
  filename,
  filenameIcon,
  showFilename,
  lineNumbers = false,
  tabs,
  highlightLines,
  highlightTokens,
  ...props
}: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const lineCount = code.trimEnd().split("\n").length;
  const collapsible = maxLines !== undefined && lineCount > maxLines;
  const [_collapsed, setCollapsed] = useState(true);
  const collapsed = collapsible && _collapsed;

  const collapse = () => {
    setCollapsed(true);
    requestAnimationFrame(() => {
      const expandButton =
        wrapperRef.current?.querySelector<HTMLElement>("[data-expand]");
      expandButton?.focus({ preventScroll: true });
      wrapperRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    });
  };

  const expand = () => {
    setCollapsed(false);
    requestAnimationFrame(() => {
      const pre = wrapperRef.current?.querySelector("pre");
      pre?.focus({ preventScroll: true });
      wrapperRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    });
  };

  useEffect(() => {
    const pre = wrapperRef.current?.querySelector("pre");
    if (!pre) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        collapse();
      }
    };
    pre.addEventListener("keydown", handleKeyDown);
    return () => pre.removeEventListener("keydown", handleKeyDown);
  }, []);

  const content = (
    <div
      className={cn(
        "ak-tab-panel",
        "ak-frame-bleed/0 relative grid overflow-hidden",
        "has-[pre:focus-visible]:after:outline-2 after:ak-outline-primary after:absolute after:inset-0 after:z-3 after:pointer-events-none after:ak-frame after:-outline-offset-2",
      )}
    >
      <div className="absolute top-0 end-0 ak-frame-cover/1.5 z-2 pointer-events-none size-max">
        <CopyToClipboard
          text={code}
          data-single-line={lineCount === 1 || undefined}
          className="pointer-events-auto "
        />
      </div>
      <pre
        // @ts-expect-error - inert property is not yet in TypeScript DOM types
        inert={collapsed ? "" : undefined}
        aria-hidden={collapsed}
        tabIndex={-1}
        style={
          {
            "--max-lines": maxLines,
            "--line-height": "1.8em",
          } as CSSProperties
        }
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
          data-expand
          onClick={expand}
          className={cn(
            "absolute group/expand grid outline-none ak-frame-cover/1 py-2 inset-0 ak-layer-current bg-transparent bg-gradient-to-b from-transparent from-[calc(100%-8rem)] to-[calc(100%-0.5rem)] to-(--ak-layer) z-1 justify-center items-end",
          )}
        >
          <div className="ak-button h-9 ak-light:ak-layer-down ak-dark:ak-layer text-sm/[1.5rem] group-hover/expand:ak-button_hover hover:ak-layer-pop-[1.5] group-focus-visible/expand:ak-button_focus group-active/expand:ak-button_active">
            Expand code
            <Icon className="text-base" name="chevronDown" />
          </div>
        </button>
      )}
    </div>
  );

  return (
    <div
      ref={wrapperRef}
      className={cn("flex flex-col isolate scroll-my-2", className)}
      {...props}
    >
      <div
        className="ak-layer group peer ak-frame-border relative ak-frame-container/0 overflow-clip ak-tabs flex flex-col scroll-my-2"
        data-collapsible={collapsible || undefined}
        data-collapsed={collapsed || undefined}
      >
        {tabs && storeId ? (
          <>
            <ak.TabList className="ak-tab-list">
              {tabs.map((tabItem, index) => (
                <ak.Tab
                  key={tabItem.filename || index}
                  className="ak-tab-folder data-focus-visible:ak-tab-folder_focus h-12 sm:h-10 text-sm"
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
            <SingleTabPanel render={content} />
          </>
        ) : (
          <>
            {showFilename && (
              <div className="ak-tab-list text-sm">
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
      {collapsible && !collapsed && (
        <div className="sticky bottom-2 my-2 grid justify-center">
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
}
