import { invariant } from "@ariakit/core/utils/misc";
import * as ak from "@ariakit/react";
import clsx from "clsx";
import * as React from "react";
import useLocalStorageState from "use-local-storage-state";
import { Icon } from "../icons/icon.react.tsx";
import type { Source } from "../lib/types.ts";
import type { Framework } from "../lib/types.ts";
import { useControllableState } from "../lib/use-controllable-state.ts";
import type {
  CodeBlockProps as CodeBlockBaseProps,
  CodeBlockTabProps as CodeBlockTabBaseProps,
} from "./code-block.types.ts";
import { useCollapsible } from "./collapsible.react.tsx";
import { CopyCode } from "./copy-code.react.tsx";
import { Tooltip } from "./tooltip.react.tsx";

function getTabId(prefix: string, filename?: string) {
  if (!filename) return prefix;
  return `${prefix}/${filename}`;
}

function getFilename(id?: string | null) {
  if (!id) return;
  const [, filename] = id.split(/\/(.*)/);
  return filename;
}

function getPreviewValue(
  framework?: string,
  example?: string,
  preview?: boolean | "full",
) {
  return !!framework && !!example ? (preview ?? true) : false;
}

function getPreviewUrl(
  framework?: string,
  example?: string,
  preview?: boolean | "full",
) {
  return preview && framework && example
    ? `/${framework}/previews/${example}`
    : null;
}

function SingleTabPanel(props: ak.TabPanelProps) {
  const store = ak.useTabContext();
  const tabId = ak.useStoreState(
    store,
    (state) => props.tabId ?? state?.selectedId,
  );
  return <ak.TabPanel focusable={false} {...props} tabId={tabId} />;
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
  const expanded = collapsible && !collapsed;

  const defaultContent = (
    <div
      style={
        {
          "--max-lines": maxLines,
          "--line-height": "1.75em",
        } as React.CSSProperties
      }
      className={clsx(
        "ak-tab-panel ak-frame-cover/0 relative grid overflow-hidden",
        "has-[pre:focus-visible]:after:outline-2 after:ak-outline-primary after:absolute after:inset-0 after:z-3 after:pointer-events-none after:ak-frame after:-outline-offset-2",
      )}
    >
      <div className="absolute top-0 end-0 ak-frame-cover/1.5 z-2 pointer-events-none size-max">
        <CopyCode
          text={code}
          className="pointer-events-auto [@media(hover:hover)]:not-data-open:not-group-has-hover:not-group-has-focus-visible:sr-only"
        />
      </div>
      <pre
        {...scrollableProps}
        className={clsx(
          "whitespace-normal text-sm/(--line-height) ak-frame-cover/0 outline-none",
          "[font-size-adjust:0.55]",
          expanded &&
            "overflow-auto overscroll-contain max-h-[min(calc(100svh-12rem),60rem)]",
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
      className={clsx("flex flex-col isolate scroll-my-2", props.className)}
    >
      <div
        className="ak-layer group peer ak-light:ak-edge/15 ak-frame-border ak-frame-container/0 relative overflow-clip ak-tabs flex flex-col scroll-my-2"
        data-collapsible={collapsible || undefined}
        data-collapsed={collapsed || undefined}
      >
        {topbar
          ? topbar
          : showFilename &&
            filename && (
              <div className="ak-tab-list ak-light:ak-layer-down-0.5 text-sm">
                <div className="base:ak-tab-folder_idle ak-tab-folder_selected select-auto cursor-auto">
                  <div>
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

interface CodeBlockTabProps extends ak.TabProps {
  isPreviewSelected: boolean;
  fullPreview?: boolean;
}

function CodeBlockTab({
  isPreviewSelected,
  fullPreview,
  children,
  ...props
}: CodeBlockTabProps) {
  return (
    <ak.Tab
      {...props}
      className={clsx(
        isPreviewSelected
          ? [
              "ak-segmented-button aria-selected:ak-edge/8 aria-selected:ak-layer-pop aria-selected:shadow-none",
              fullPreview
                ? "aria-selected:ak-layer-down aria-selected:ak-light:ak-edge/0 px-2 not-aria-selected:px-3"
                : "px-1.5 not-aria-selected:px-2.5 not-aria-selected:sm:px-3 sm:px-2",
            ]
          : "ak-tab-folder data-focus-visible:ak-tab-folder_focus h-full text-sm",
        props.className,
      )}
    >
      {isPreviewSelected ? children : <div>{children}</div>}
    </ak.Tab>
  );
}

export interface CodeBlockPreviewIframeProps {
  previewUrl: string;
  fallback?: React.ReactNode;
  clickAndWait?: boolean | string;
  scrollTop?: number;
  loaded?: boolean;
  setLoaded?: (loaded: boolean) => void;
}

export function CodeBlockPreviewIframe({
  previewUrl,
  fallback,
  clickAndWait,
  loaded: loadedProp,
  setLoaded: setLoadedProp,
  scrollTop,
}: CodeBlockPreviewIframeProps) {
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useControllableState(
    false,
    loadedProp,
    setLoadedProp,
  );

  React.useEffect(() => {
    setLoaded(false);
  }, [previewUrl]);

  React.useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    let timeout = 0;
    let raf = 0;

    const triggerSelector =
      typeof clickAndWait === "string" ? clickAndWait : "input, button";

    const scroll = (
      doc = iframe.contentDocument,
      button = doc?.querySelector<HTMLButtonElement>(triggerSelector),
      popup = doc?.querySelector<HTMLElement>("[data-dialog]"),
    ) => {
      if (!doc) return;
      if (scrollTop) {
        doc.documentElement.scrollTo({ top: scrollTop });
        return;
      }
      if (!button) return;
      const { top, bottom: buttonBottom } = button.getBoundingClientRect();
      const { bottom = buttonBottom } = popup?.getBoundingClientRect() || {};
      const iframeHeight = iframe.contentWindow?.innerHeight;
      if (top == null || bottom == null || iframeHeight == null) return;
      const currentScrollTop = doc.documentElement.scrollTop || 0;
      // Scroll the iframe to center the combined element
      doc.documentElement.scrollTo({
        top: currentScrollTop - (iframeHeight - bottom - top) / 2,
      });
    };

    const setDataFocus = (event: FocusEvent) => {
      const html = iframe.contentDocument?.documentElement;
      if (!html) return;
      if (event.type === "focus") {
        html.setAttribute("data-focus", "true");
      } else {
        html.removeAttribute("data-focus");
      }
    };

    const disableHover = (event: MouseEvent) => {
      const html = iframe.contentDocument?.documentElement;
      if (!html) return;
      if (!html.hasAttribute("data-focus")) {
        event.stopPropagation();
      }
    };

    const onLoad = () => {
      const doc = iframe.contentDocument;
      if (!doc) return;
      const html = doc.documentElement;
      doc.body.classList.add("!ak-layer-canvas-down-0.15");
      html.classList.add("scheme-light", "dark:scheme-dark");
      html.classList.add("[scrollbar-gutter:stable_both-edges]");
      html.classList.add(
        "not-data-focus:overflow-hidden",
        "not-data-focus:[&_.ak-popover-scroll]:overflow-hidden",
      );

      iframe.contentWindow?.addEventListener("focus", setDataFocus);
      iframe.contentWindow?.addEventListener("blur", setDataFocus);
      iframe.contentWindow?.addEventListener("mousemove", disableHover, true);

      if (!clickAndWait) return setLoaded(true);
      // Make the iframe inert so we can interact with it without moving focus
      doc.body.inert = true;

      const button = doc.querySelector<HTMLButtonElement>(triggerSelector);
      if (!button) return setLoaded(true);

      const { top } = button.getBoundingClientRect();
      html.scrollTo({ top });

      const clickAndWaitForPopup = () => {
        const eventInit = { bubbles: true, cancelable: true };
        button.dispatchEvent(new MouseEvent("pointerdown", eventInit));
        button.dispatchEvent(new MouseEvent("mousedown", eventInit));
        button.dispatchEvent(new MouseEvent("pointerup", eventInit));
        button.dispatchEvent(new MouseEvent("mouseup", eventInit));
        button.dispatchEvent(new MouseEvent("click", eventInit));

        // Wait for the popup to be visible
        timeout = window.setTimeout(() => {
          const popup = doc.querySelector<HTMLElement>("[data-dialog]");
          if (!popup || popup.hasAttribute("hidden")) {
            // If the popup is missing or hidden, it might not have been
            // hydrated yet. We'll try again shortly.
            timeout = window.setTimeout(clickAndWaitForPopup, 84);
            return;
          }
          // Make the popup transition immediately so we can check its position
          popup.style.setProperty("transition", "none", "important");
          raf = requestAnimationFrame(() => {
            setLoaded(true);
            scroll(doc, button, popup);
            // Reset the transition
            popup.style.removeProperty("transition");
            // Toggle the iframe visibility to trigger the transition when it's
            // visible in the viewport
            doc.body.style.display = "none";
            raf = requestAnimationFrame(() => {
              doc.body.style.removeProperty("display");
            });
            timeout = window.setTimeout(() => {
              doc.body.inert = false;
            }, 42);
          });
        }, 42);
      };
      clickAndWaitForPopup();
    };

    iframe.addEventListener("load", onLoad);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        if (iframe.src.endsWith(previewUrl)) {
          scroll();
          return setLoaded(true);
        }
        iframe.src = previewUrl;
      },
      { rootMargin: "50%" },
    );
    observer.observe(iframe);

    return () => {
      observer.disconnect();
      clearTimeout(timeout);
      cancelAnimationFrame(raf);
      iframe.removeEventListener("load", onLoad);
      iframe.contentWindow?.removeEventListener("focus", setDataFocus);
      iframe.contentWindow?.removeEventListener("blur", setDataFocus);
      iframe.contentWindow?.removeEventListener(
        "mousemove",
        disableHover,
        true,
      );
    };
  }, [previewUrl, clickAndWait, scrollTop]);

  return (
    <div className="relative h-full min-h-[29.1rem]">
      <iframe ref={iframeRef} width="100%" height="100%" title="Preview" />
      {!loaded && (
        <div
          className={clsx(
            "absolute inset-0 ak-layer-current ak-frame-cover/4 grid items-center justify-center",
          )}
        >
          <div className="opacity-50">
            <div className="animate-pulse">{fallback}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export interface CodeBlockTabsProps2
  extends Pick<
      CodeBlockPreviewIframeProps,
      "fallback" | "clickAndWait" | "scrollTop"
    >,
    Omit<
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
  tabs: CodeBlockTabBaseProps[];
  persistTabKey?: string;
  framework?: Framework;
  example?: string;
  preview?: boolean | "full";
  source?: Source;
  ai?: boolean;
  cli?: boolean;
  edit?: boolean;
  slot0?: React.ReactElement;
  slot1?: React.ReactElement;
  slot2?: React.ReactElement;
  slot3?: React.ReactElement;
  slot4?: React.ReactElement;
  slot5?: React.ReactElement;
  slot6?: React.ReactElement;
  slot7?: React.ReactElement;
}

export function CodeBlockTabs2({
  tabs,
  framework,
  example,
  fallback,
  clickAndWait,
  persistTabKey,
  source,
  ai = !!source,
  cli = !!source,
  edit = !!source,
  preview: previewProp,
  scrollTop,
  slot0,
  slot1,
  slot2,
  slot3,
  slot4,
  slot5,
  slot6,
  slot7,
  children,
  ...props
}: CodeBlockTabsProps2) {
  const storeId = React.useId();
  const slots = [slot0, slot1, slot2, slot3, slot4, slot5, slot6, slot7];

  const [firstTab] = tabs;
  invariant(firstTab, "At least one tab is required");

  const [loaded, setLoaded] = React.useState(false);

  const preview = getPreviewValue(framework, example, previewProp);
  const previewUrl = getPreviewUrl(framework, example, preview);
  const fullPreview = preview === "full";
  const hasToolbar = !!ai || !!cli || !!previewUrl || edit;

  const canPersist = persistTabKey !== undefined;
  const defaultFilename = preview ? "preview" : firstTab.filename;
  const [persistedFilename = defaultFilename, setPersistedFilename] =
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
  const isPreviewSelected = selectedTabId === getTabId(storeId, "preview");

  const selectedTab = tabs.find(
    (tab) => getTabId(storeId, tab.filename) === selectedTabId,
  );
  const selectedSlot = slots.find(
    (_, index) => getTabId(storeId, tabs[index]?.filename) === selectedTabId,
  );

  const renderTopbar = () => (
    <div
      className={clsx(
        hasToolbar && "[--height:--spacing(12)]",
        !isPreviewSelected
          ? "ak-layer-down ak-light:ak-layer-down-0.5 grid grid-cols-[1fr_auto] [--height:--spacing(10)] h-(--height)"
          : [
              "flex items-start",
              fullPreview
                ? "ak-layer ak-frame-cover/1"
                : "absolute z-1 inset-0 bottom-auto ak-frame-container/1 pointer-events-none *:pointer-events-auto [@media(hover:hover)]:not-group-hover:not-group-focus-within:opacity-0 transition-opacity",
            ],
      )}
    >
      <ak.TabList
        className={clsx(
          isPreviewSelected
            ? [
                "ak-segmented ak-layer-(--ak-layer-parent) text-sm h-10 gap-1",
                fullPreview
                  ? "ak-frame-container/0"
                  : "max-sm:ak-frame-container/0.5 sm:h-[calc(--spacing(10)+var(--ak-frame-padding))]",
              ]
            : [
                "ak-tab-list ak-layer-(--ak-layer-parent) !rounded-b-none",
                hasToolbar && !fullPreview && "sm:ak-frame-overflow/1",
              ],
        )}
      >
        {preview && (
          <CodeBlockTab
            id={getTabId(storeId, "preview")}
            isPreviewSelected={isPreviewSelected}
            fullPreview={fullPreview}
          >
            <Icon name="preview" />
            Preview
          </CodeBlockTab>
        )}
        {tabs.map((tab, index) => {
          if (isPreviewSelected && index > 0) return null;
          const filenameIcon = isPreviewSelected ? "code" : tab.filenameIcon;
          const filename = isPreviewSelected
            ? "Code"
            : tab.filename || tab.lang;
          return (
            <CodeBlockTab
              key={tab.filename}
              id={getTabId(storeId, tab.filename)}
              isPreviewSelected={isPreviewSelected}
              fullPreview={fullPreview}
            >
              {filenameIcon && (
                <Icon
                  name={filenameIcon}
                  className={!isPreviewSelected ? "max-sm:hidden" : ""}
                />
              )}
              {filename}
            </CodeBlockTab>
          );
        })}
      </ak.TabList>
      {hasToolbar && (
        <div className="ms-auto ak-frame-cover/1 ak-frame-cover-start ak-frame-cover-end h-(--height) flex gap-1">
          {ai && (
            <Tooltip plus title="Copy prompt for AI agents">
              <button
                className={clsx(
                  "ak-button @xl:text-sm @max-xl:ak-button-square h-full ak-text/80",
                  preview &&
                    !isPreviewSelected &&
                    "ak-button-square ak-text-sm",
                )}
              >
                <Icon name="copyAi" className="text-lg" />
                <span
                  className={clsx(
                    "@max-xl:sr-only",
                    preview && !isPreviewSelected && "sr-only",
                  )}
                >
                  Copy AI prompt
                </span>
              </button>
            </Tooltip>
          )}
          {cli && (
            <Tooltip plus title="Copy shadcn CLI command">
              <button className="ak-button ak-button-square h-full">
                <Icon name="shadcn" className="text-lg" />
                <span className="sr-only">Copy shadcn CLI command</span>
              </button>
            </Tooltip>
          )}
          {edit && (
            <Tooltip plus title="Edit code">
              <button className="ak-button ak-button-square h-full">
                <Icon name="edit" className="text-lg" />
                <span className="sr-only">Edit code</span>
              </button>
            </Tooltip>
          )}
          {previewUrl && preview && (
            <Tooltip title="Open preview in new tab">
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ak-button ak-button-square h-full"
              >
                <Icon name="newWindow" className="text-lg" />
                <span className="sr-only">Open preview in new tab</span>
              </a>
            </Tooltip>
          )}
        </div>
      )}
    </div>
  );

  return (
    <ak.TabProvider store={tabStore}>
      <CodeBlock
        {...props}
        {...selectedTab}
        topbar={renderTopbar()}
        code={selectedTab?.code || ""}
        className={clsx(
          // TODO: Refactor this
          isPreviewSelected && "*:ak-layer-down-0.15 *:ak-dark:ak-edge/13",
          props.className,
        )}
        renderContent={(content) => {
          return (
            <>
              {preview && previewUrl && (isPreviewSelected || loaded) && (
                <ak.TabPanel
                  tabId={getTabId(storeId, "preview")}
                  focusable={false}
                  scrollRestoration
                  scrollElement={(panel) => {
                    const iframe = panel.querySelector("iframe");
                    return iframe?.contentDocument?.documentElement || null;
                  }}
                  render={
                    <div
                      className={clsx(
                        "ak-tab-panel",
                        !fullPreview && "ak-frame-cover-start",
                      )}
                    >
                      {children && !clickAndWait ? (
                        <div className="min-h-[29.1rem] grid items-center">
                          <div className="mx-auto ak-frame-cover/4 pt-12">
                            {children}
                          </div>
                        </div>
                      ) : (
                        <CodeBlockPreviewIframe
                          previewUrl={previewUrl}
                          fallback={fallback}
                          clickAndWait={clickAndWait}
                          loaded={loaded}
                          setLoaded={setLoaded}
                          scrollTop={scrollTop}
                        />
                      )}
                    </div>
                  }
                />
              )}
              {!isPreviewSelected && (
                <SingleTabPanel
                  render={content}
                  scrollRestoration
                  scrollElement={(panel) => panel.querySelector("pre")}
                />
              )}
            </>
          );
        }}
      >
        {selectedSlot}
      </CodeBlock>
    </ak.TabProvider>
  );
}

export interface CodeBlockTabsProps
  extends Omit<CodeBlockTabsProps2, "fallback"> {
  fallback0?: React.ReactNode;
  fallback1?: React.ReactNode;
}

export function CodeBlockTabs({
  fallback0,
  fallback1,
  ...props
}: CodeBlockTabsProps) {
  const preview = getPreviewValue(
    props.framework,
    props.example,
    props.preview,
  );
  const previewUrl = getPreviewUrl(props.framework, props.example, preview);
  return (
    <div className="@container">
      <div
        className={clsx(
          "grid grid-cols-1 gap-4",
          preview && "@[64rem]:grid-cols-2",
        )}
      >
        <CodeBlockTabs2
          {...props}
          preview={false}
          className={preview ? "@max-[64rem]:hidden" : ""}
        />
        {preview && (
          <CodeBlockTabs2
            {...props}
            fallback={fallback0}
            className="@[64rem]:hidden"
          />
        )}
        {preview && previewUrl && (
          <div className="relative ak-light:ak-edge/15 ak-frame-border ak-frame-container/0 overflow-clip ak-layer-down-0.15 ak-dark:ak-edge/13 @max-[64rem]:hidden">
            <div className="ak-frame-cover/1 absolute top-0 end-0 z-1">
              <Tooltip title="Open preview in new tab">
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ak-button ak-button-square sm:h-10 h-9"
                >
                  <Icon name="newWindow" className="text-lg" />
                  <span className="sr-only">Open preview in new tab</span>
                </a>
              </Tooltip>
            </div>
            <CodeBlockPreviewIframe
              previewUrl={previewUrl}
              clickAndWait={props.clickAndWait}
              fallback={fallback1}
              scrollTop={props.scrollTop}
            />
          </div>
        )}
      </div>
    </div>
  );
}
