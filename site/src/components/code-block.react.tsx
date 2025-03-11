import { createStore } from "@ariakit/core/utils/store";
import * as ak from "@ariakit/react";
import { useSafeLayoutEffect } from "@ariakit/react-core/utils/hooks";
import {
  type CSSProperties,
  type ComponentProps,
  type HTMLAttributes,
  useEffect,
  useRef,
  useState,
} from "react";
import { Icon } from "../icons/icon.react.tsx";
import { cn } from "../lib/cn.ts";
import type { CodeBlockProps } from "./code-block.types.ts";
import { CopyToClipboard } from "./copy-to-clipboard.react.tsx";

const tabStores = createStore({ stores: {} as Record<string, ak.TabStore> });

export interface TabPanelProps extends ak.TabPanelProps {
  storeId: string;
  defaultOpen?: boolean;
}

export function CodeBlockTabPanel({
  storeId,
  defaultOpen,
  ...props
}: TabPanelProps) {
  const store = ak.useStoreState(tabStores, (state) => state.stores[storeId]);
  const [isOpen, setIsOpen] = useState(defaultOpen);
  useSafeLayoutEffect(() => {
    setIsOpen(false);
  }, []);
  return (
    <ak.TabPanel
      unmountOnHide={!isOpen}
      alwaysVisible
      store={store || ak.useTabStore()}
      {...props}
      className={cn("ak-frame-bleed/0", props.className)}
    />
  );
}

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "lang"> {
  storeId: string;
  code: string;
  codeString?: string;
  maxLines?: number;
  children?: React.ReactNode;
  filename?: string;
  filenameIcon?: ComponentProps<typeof Icon>["name"];
  showFilename?: boolean;
  lineNumbers?: boolean;
  highlightLines?: number[];
  tabs?: CodeBlockProps[];
}

function getTabId(prefix: string, filename?: string) {
  if (!filename) return prefix;
  return `${prefix}/${filename}`;
}

// function getFilename(id?: string | null) {
//   if (!id) return;
//   const [, filename] = id.split(/\/(.*)/);
//   return filename;
// }

export function CodeBlockContainer({
  storeId,
  code,
  codeString,
  maxLines = 17,
  children,
  className,
  filename,
  filenameIcon,
  showFilename,
  lineNumbers = false,
  tabs,
  ...props
}: Props) {
  const lineCount = code.trimEnd().split("\n").length;
  const collapsible = lineCount > maxLines;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const idPrefix = storeId;
  const defaultTabId = tabs?.length
    ? getTabId(idPrefix, tabs[0]?.filename)
    : undefined;

  const tabStore = ak.useTabStore({ defaultSelectedId: defaultTabId });

  useEffect(() => {
    tabStores.setState("stores", (stores) => ({
      ...stores,
      [storeId]: tabStore,
    }));
  }, [tabStore, storeId]);

  const collapse = () => {
    const collapsible = wrapperRef.current?.querySelector("[data-collapsible]");
    collapsible?.setAttribute("data-collapsed", "true");
    const expandButton =
      collapsible?.querySelector<HTMLElement>("[data-expand]");
    expandButton?.focus({ preventScroll: true });
    collapsible?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    const pre = collapsible?.querySelector("pre");
    if (!pre) return;
    pre.inert = true;
  };

  const expand = () => {
    const wrapper = wrapperRef.current?.querySelector("[data-collapsible]");
    wrapper?.removeAttribute("data-collapsed");
    const pre = wrapper?.querySelector("pre");
    if (!pre) return;
    pre.inert = false;
    pre.focus({ preventScroll: true });
    wrapper?.scrollIntoView({ behavior: "smooth", block: "nearest" });
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
      data-filename={filename}
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
          className="pointer-events-auto [@media(hover:hover)]:not-data-open:not-group-has-hover:not-group-has-focus-visible:sr-only"
        />
      </div>
      <pre
        // @ts-expect-error
        inert={collapsible ? "" : undefined}
        tabIndex={-1}
        style={
          {
            "--max-lines": maxLines,
            "--line-height": "1.8em",
          } as CSSProperties
        }
        className={cn(
          "whitespace-normal",
          "text-sm/(--line-height) ak-frame-cover/0 outline-none not-in-data-collapsed:overflow-auto",
          "max-h-[min(calc(100svh-12rem),60rem)] in-data-collapsed:max-h-[calc((var(--max-lines)+1)*var(--line-height))]",
        )}
      >
        {children}
      </pre>
      {collapsible && (
        <button
          data-expand
          onClick={expand}
          className={cn(
            "absolute group/expand grid outline-none not-in-data-collapsed:hidden ak-frame-cover/1 py-2 inset-0 ak-layer-current bg-transparent bg-gradient-to-b from-transparent from-[calc(100%-8rem)] to-[calc(100%-0.5rem)] to-(--ak-layer) z-1 justify-center items-end",
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
        data-collapsed={collapsible || undefined}
      >
        {tabs ? (
          <ak.TabProvider store={tabStore}>
            <ak.TabList className="ak-tab-list">
              {tabs.map((tabItem, index) => (
                <ak.Tab
                  key={index}
                  className="ak-tab-folder data-focus-visible:ak-tab-folder_focus sm:h-10 text-sm"
                  id={getTabId(idPrefix, tabItem.filename)}
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
            {content}
          </ak.TabProvider>
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
      {collapsible && (
        <div className="sticky bottom-2 my-2 peer-data-collapsed:hidden grid justify-center">
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
