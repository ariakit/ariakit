/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { invariant } from "@ariakit/core/utils/misc";
import * as ak from "@ariakit/react";
import clsx from "clsx";
import { SplitSquareHorizontal } from "lucide-react";
import * as React from "react";
import useLocalStorageState from "use-local-storage-state";
import { Icon } from "#app/icons/icon.react.tsx";
import type { Framework } from "#app/lib/schemas.ts";
import type { Source } from "#app/lib/source.ts";
import { slugify } from "#app/lib/string.ts";
import { useControllableState } from "#app/lib/use-controllable-state.ts";
import type {
  CodeBlockProps as CodeBlockBaseProps,
  CodeBlockTabProps as CodeBlockTabBaseProps,
} from "./code-block.types.ts";
import {
  CodeBlockEdit,
  getStackblitzFramework,
} from "./code-block-edit.react.tsx";
import { useCollapsible } from "./collapsible.react.tsx";
import { CopyCode } from "./copy-code.react.tsx";
import { Tooltip } from "./tooltip.react.tsx";

/**
 * Generates a unique tab ID by combining a prefix with an optional filename
 */
function getTabId(prefix: string, filename?: string) {
  if (!filename) return prefix;
  return `${prefix}/${filename}`;
}

/**
 * Extracts the filename from a tab ID
 */
function getFilename(id?: string | null) {
  if (!id) return;
  const [, filename] = id.split(/\/(.*)/);
  return filename;
}

/**
 * Determines if preview should be shown based on framework, example, and
 * preview settings
 */
function getPreviewValue(
  framework?: string,
  example?: string,
  preview?: boolean | "full",
) {
  return !!framework && !!example ? (preview ?? true) : false;
}

/**
 * Generates the preview URL based on framework, example, and preview settings
 */
function getPreviewUrl(
  framework?: string,
  example?: string,
  preview?: boolean | "full",
) {
  return preview && framework && example
    ? `/${framework}/previews/${example}/`
    : null;
}

/**
 * A wrapper component for TabPanel that handles tab selection state
 */
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
  collapsibleClassName?: string;
  renderContent?: (content: React.ReactElement) => React.ReactNode;
}

/**
 * The main component for displaying code blocks with various features like line
 * numbers, highlighting, and collapsible content
 */
export function CodeBlock({
  code,
  previousCode,
  preferMultilineDiff,
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
  collapsibleClassName,
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
      <div className="absolute top-0 end-0 ak-frame-cover/1.5 z-3 pointer-events-none size-max">
        <CopyCode
          text={code}
          className="pointer-events-auto supports-hover:not-data-open:not-group-has-hover:not-group-has-focus-visible:sr-only"
        />
      </div>
      <pre
        {...scrollableProps}
        className={clsx(
          "whitespace-normal text-sm/(--line-height) ak-frame-cover/0 outline-none",
          // "transition-[max-height] duration-300 transition-discrete [interpolate-size:allow-keywords]",
          "[font-size-adjust:0.55]",
          expanded &&
            "overflow-auto overscroll-x-contain max-h-[min(calc(100svh-14rem),60rem)]",
          collapsed &&
            "max-h-[calc(var(--max-lines)*var(--line-height))] overflow-hidden",
          !collapsible && "overflow-auto overscroll-x-contain",
          lineCount === 1 && !previousCode
            ? "h-12 grid items-center"
            : "py-4 in-data-admonition:py-3",
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
        className={clsx(
          "ak-layer-0.5 ak-light:ak-layer group peer ak-light:ak-edge/15 ak-border ak-frame-container/0 relative overflow-clip ak-tabs flex flex-col scroll-my-2",
          collapsed && "has-[[data-expand]:hover]:ak-layer-hover-0.5",
          collapsibleClassName,
        )}
        data-collapsible={collapsible || undefined}
        data-collapsed={collapsed || undefined}
      >
        {topbar
          ? topbar
          : showFilename &&
            filename && (
              <div className="ak-tab-list ak-layer-down-0.7 ak-light:ak-layer-down-0.5 text-sm">
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
  isPreviewSelected?: boolean;
}

/**
 * A component for rendering individual tabs in the code block interface
 */
function CodeBlockTab({
  isPreviewSelected,
  children,
  ...props
}: CodeBlockTabProps) {
  return (
    <ak.Tab
      {...props}
      className={clsx(
        isPreviewSelected
          ? [
              "ak-segmented-button aria-selected:ak-edge/0 aria-selected:ak-layer-pop aria-selected:shadow-none",
              "not-aria-selected:px-2.5 not-aria-selected:sm:px-3 px-[calc(var(--spacing-field)---spacing(1.5))] sm:px-[calc(var(--spacing-field)---spacing(1))]",
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
  minHeight?: string;
  title?: string;
  fullscreen?: boolean;
}

/**
 * A component for rendering preview iframes with loading states and interaction
 * handling
 */
export function CodeBlockPreviewIframe({
  previewUrl,
  fallback,
  clickAndWait,
  loaded: loadedProp,
  setLoaded: setLoadedProp,
  scrollTop,
  minHeight = "29.1rem",
  title,
  fullscreen,
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
    let scrollRaf = 0;

    const triggerSelector =
      typeof clickAndWait === "string" ? clickAndWait : "input, button";

    const scroll = (
      doc = iframe.contentDocument,
      button = doc?.querySelector<HTMLButtonElement>(triggerSelector),
      popup = doc?.querySelector<HTMLElement>("[data-dialog]"),
    ) => {
      if (!doc) return;
      // documentElement may be null if the iframe document hasn't fully loaded.
      // Wait for the next frame to retry.
      if (!doc.documentElement) {
        cancelAnimationFrame(scrollRaf);
        scrollRaf = requestAnimationFrame(() => scroll());
        return;
      }
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
      if (event.type === "focus" || event.type === "focusin") {
        iframe.setAttribute("data-focus", "true");
        html.setAttribute("data-focus", "true");
      } else {
        html.removeAttribute("data-focus");
        iframe.removeAttribute("data-focus");
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
      html.classList.add(
        fullscreen
          ? "[scrollbar-gutter:stable]"
          : "[scrollbar-gutter:stable_both-edges]",
      );
      html.classList.add(
        "not-data-focus:overflow-hidden",
        "not-data-focus:[&_.ak-popover-scroll]:overflow-hidden",
      );

      const win = iframe.contentWindow;

      win?.document.body.addEventListener("focusin", setDataFocus);
      win?.addEventListener("focus", setDataFocus);
      win?.addEventListener("blur", setDataFocus);
      win?.addEventListener("mousemove", disableHover, true);

      if (!clickAndWait) return setLoaded(true);
      // Make the iframe inert so we can interact with it without moving focus
      doc.body.inert = true;

      const clickAndWaitForPopup = (
        currentDoc: Document,
        button: HTMLButtonElement,
      ) => {
        const eventInit = { bubbles: true, cancelable: true };
        button.dispatchEvent(new MouseEvent("pointerdown", eventInit));
        button.dispatchEvent(new MouseEvent("mousedown", eventInit));
        button.dispatchEvent(new MouseEvent("pointerup", eventInit));
        button.dispatchEvent(new MouseEvent("mouseup", eventInit));
        button.dispatchEvent(new MouseEvent("click", eventInit));

        // Wait for the popup to be visible
        timeout = window.setTimeout(() => {
          const popup = currentDoc.querySelector<HTMLElement>("[data-dialog]");
          if (!popup || popup.hasAttribute("hidden")) {
            // If the popup is missing or hidden, it might not have been
            // hydrated yet. We'll try again shortly.
            timeout = window.setTimeout(
              () => clickAndWaitForPopup(currentDoc, button),
              84,
            );
            return;
          }
          // Make the popup transition immediately so we can check its position
          popup.style.setProperty("transition", "none", "important");
          raf = requestAnimationFrame(() => {
            setLoaded(true);
            scroll(currentDoc, button, popup);
            // Reset the transition
            popup.style.removeProperty("transition");
            // Toggle the iframe visibility to trigger the transition when it's
            // visible in the viewport
            currentDoc.body.style.display = "none";
            raf = requestAnimationFrame(() => {
              currentDoc.body.style.removeProperty("display");
            });
            timeout = window.setTimeout(() => {
              currentDoc.body.inert = false;
            }, 42);
          });
        }, 42);
      };

      // Maximum retries for finding the button (~4 seconds at 84ms intervals)
      const maxButtonRetries = 50;
      let buttonRetries = 0;

      const waitForButton = () => {
        // Re-query contentDocument each time as it may change after navigation
        const currentDoc = iframe.contentDocument;
        if (!currentDoc) {
          buttonRetries++;
          if (buttonRetries < maxButtonRetries) {
            timeout = window.setTimeout(waitForButton, 84);
          } else {
            setLoaded(true);
          }
          return;
        }

        const button =
          currentDoc.querySelector<HTMLButtonElement>(triggerSelector);
        if (!button) {
          // The iframe document is loaded but the React app hasn't hydrated
          // yet. Retry after a short delay.
          buttonRetries++;
          if (buttonRetries < maxButtonRetries) {
            timeout = window.setTimeout(waitForButton, 84);
          } else {
            setLoaded(true);
          }
          return;
        }

        const currentHtml = currentDoc.documentElement;
        const { top } = button.getBoundingClientRect();
        currentHtml.scrollTo({ top });

        clickAndWaitForPopup(currentDoc, button);
      };

      waitForButton();
    };

    if (iframe.contentDocument?.readyState === "complete") {
      onLoad();
    } else {
      iframe.addEventListener("load", onLoad);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        scroll();
      },
      { rootMargin: "50%" },
    );
    observer.observe(iframe);

    return () => {
      observer.disconnect();
      clearTimeout(timeout);
      cancelAnimationFrame(raf);
      cancelAnimationFrame(scrollRaf);
      iframe.removeEventListener("load", onLoad);
      iframe.contentWindow?.removeEventListener("focus", setDataFocus);
      iframe.contentWindow?.removeEventListener("blur", setDataFocus);
      iframe.contentWindow?.removeEventListener(
        "mousemove",
        disableHover,
        true,
      );
    };
  }, [previewUrl, clickAndWait, scrollTop, fullscreen]);

  return (
    <div className="relative h-full" style={{ minHeight }}>
      <iframe
        ref={iframeRef}
        src={previewUrl}
        width="100%"
        height="100%"
        title={title ? `${title} Preview` : "Preview"}
      />
      {!loaded && (
        <div
          className={clsx(
            "absolute inset-0 ak-layer-current ak-frame-cover/4 grid items-center justify-center",
          )}
        >
          <div
            // @ts-expect-error
            inert="true"
            className="opacity-50 *:*:*:scale-100"
          >
            <div className="animate-pulse">{fallback}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export interface CodeBlockPreviewProps extends React.ComponentProps<"div"> {
  minHeight?: string;
  title?: string;
  fullscreen?: boolean;
  anchorId?: string;
}

/**
 * A component for rendering preview content with consistent styling
 */
export function CodeBlockPreview({
  minHeight,
  children,
  title,
  fullscreen,
  anchorId,
  ...props
}: CodeBlockPreviewProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!anchorId) return;
    const container = containerRef.current;
    if (!container) return;
    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (!target) return;
      const link = target.closest("a") as HTMLAnchorElement | null;
      if (!link) return;
      if (link.target === "_blank") return;
      event.preventDefault();
      window.location.hash = `#${anchorId}`;
    };
    container.addEventListener("click", onClick);
    return () => container.removeEventListener("click", onClick);
  }, [anchorId]);

  return (
    <div
      {...props}
      ref={containerRef}
      role="group"
      tabIndex={-1}
      aria-label={title ? `${title} Preview` : "Preview"}
      className={clsx(
        "size-full isolate group-focus-within:overflow-auto overflow-hidden max-h-[calc(100svh-var(--header-height)---spacing(16))] ak-frame-container/0 focus-visible:ak-outline-primary",
        fullscreen
          ? "[scrollbar-gutter:stable]"
          : "[scrollbar-gutter:stable_both-edges]",
        props.className,
      )}
      style={{ minHeight, ...props.style }}
    >
      <div
        className={clsx(
          "@container w-full min-h-full",
          !fullscreen &&
            "ak-frame/14 @max-3xl/main:p-3 flex items-center-safe justify-center-safe",
        )}
      >
        {children}
      </div>
    </div>
  );
}

export interface CodeBlockTabsProps
  extends Pick<CodeBlockPreviewProps, "title" | "fullscreen">,
    Pick<
      CodeBlockPreviewIframeProps,
      "fallback" | "clickAndWait" | "scrollTop" | "minHeight"
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
  defaultView?: "preview" | "code";
  showControlsOnHover?: boolean;
  framework?: Framework;
  example?: string;
  preview?: boolean | "full";
  source?: Source;
  iframe?: boolean;
  edit?: boolean;
  wide?: boolean;
  slot0?: React.ReactElement;
  slot1?: React.ReactElement;
  slot2?: React.ReactElement;
  slot3?: React.ReactElement;
  slot4?: React.ReactElement;
  slot5?: React.ReactElement;
  slot6?: React.ReactElement;
  slot7?: React.ReactElement;
}

/**
 * The top-level component that handles the layout of code blocks and previews
 * in a responsive grid
 */
export function CodeBlockTabs({
  tabs,
  framework,
  example,
  fallback,
  clickAndWait,
  persistTabKey,
  defaultView = "preview",
  showControlsOnHover = false,
  source,
  iframe,
  edit = !!source,
  preview: previewProp,
  wide = false,
  scrollTop,
  minHeight,
  title,
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
}: CodeBlockTabsProps) {
  const storeId = React.useId();
  const slots = [slot0, slot1, slot2, slot3, slot4, slot5, slot6, slot7];

  const [firstTab] = tabs;
  invariant(firstTab, "At least one tab is required");

  const preview = getPreviewValue(framework, example, previewProp);
  const previewUrl = getPreviewUrl(framework, example, preview);
  const fullscreen = preview === "full";
  const hasToolbar = !!previewUrl || edit;
  const stackblitzFramework = React.useMemo(() => {
    if (!framework || !source) return null;
    return getStackblitzFramework(framework, source);
  }, [framework, source]);

  const canPersist = persistTabKey !== undefined;
  const defaultFilename = firstTab.filename;
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

  const selectedTab = tabs.find(
    (tab) => getTabId(storeId, tab.filename) === selectedTabId,
  );
  const selectedSlot = slots.find(
    (_, index) => getTabId(storeId, tabs[index]?.filename) === selectedTabId,
  );

  const defaultViewId = getTabId(storeId, defaultView);
  const viewStore = ak.useTabStore({
    defaultSelectedId: defaultViewId,
  });
  const viewSelectedId = ak.useStoreState(viewStore, "selectedId");
  const isPreviewSelected = viewSelectedId === getTabId(storeId, "preview");

  const className = clsx(
    showControlsOnHover &&
      "transition-[opacity,width] transition-discrete [interpolate-size:allow-keywords] supports-hover:w-0 group-hocus-within/code-block-tabs:w-auto supports-hover:opacity-0 group-hocus-within/code-block-tabs:opacity-100",
  );
  const hasCodeToolbar = !!edit && !preview;
  const exampleId = title ? `example-${slugify(title)}` : undefined;

  return (
    <ak.TabProvider selectOnMove={false} store={viewStore}>
      <div
        id={exampleId}
        className="@container grid gap-2 group/code-block-tabs scroll-mt-[calc(var(--header-height)+--spacing(2))]"
      >
        {preview && (
          <div className="grid grid-cols-[auto_max-content_max-content] @lg:grid-cols-[1fr_auto_1fr] items-center @lg:gap-4 gap-1 @lg:text-sm">
            {exampleId ? (
              <a
                href={`#${exampleId}`}
                className="ak-link not-hover:no-underline hover:decoration-1 @lg:row-1 @lg:col-2 @max-lg:px-4 ak-text/60 font-medium truncate transition-[color] group-hocus-within/code-block-tabs:ak-text"
              >
                {title}
              </a>
            ) : (
              <div className="@lg:row-1 @lg:col-2" />
            )}
            <div
              className={clsx("flex justify-start gap-[inherit]", className)}
            >
              <ak.TabList className="flex @lg:ak-segmented @lg:ak-frame-full/1 @max-lg:gap-[inherit]">
                <ak.Tab
                  id={getTabId(storeId, "preview")}
                  className="@lg:ak-segmented-button @max-lg:ak-button @max-lg:ak-segmented-button-selected:ak-layer-hover @max-lg:ak-button-square-10"
                >
                  <Icon name="preview" className="@max-lg:text-lg" />
                  <span className="@max-lg:sr-only">Preview</span>
                </ak.Tab>
                <ak.Tab
                  id={getTabId(storeId, "code")}
                  className="@lg:ak-segmented-button @max-lg:ak-button @max-lg:ak-segmented-button-selected:ak-layer-hover @max-lg:ak-button-square-10"
                >
                  <span
                    className={clsx(
                      "flex items-center gap-2",
                      wide ? "@max-lg:hidden" : "hidden",
                    )}
                  >
                    <SplitSquareHorizontal className="size-4" />
                    <span className="@max-lg:sr-only flex gap-2 items-center">
                      Code{" "}
                      <span
                        className="h-4 ak-layer-current border-e ak-edge/15"
                        aria-label="and"
                      />{" "}
                      Preview
                    </span>
                  </span>
                  <span
                    className={clsx(
                      "flex items-center gap-2",
                      wide ? "@lg:hidden" : "",
                    )}
                  >
                    <Icon name="code" className="@max-lg:text-lg" />
                    <span className="@max-lg:sr-only">Code</span>
                  </span>
                </ak.Tab>
              </ak.TabList>
            </div>

            {hasToolbar && (
              <div
                className={clsx("ms-auto flex gap-1 justify-end", className)}
              >
                {edit &&
                  source &&
                  framework &&
                  example &&
                  stackblitzFramework && (
                    <Tooltip plus title="Edit code">
                      <CodeBlockEdit
                        source={source}
                        framework={framework}
                        example={example}
                        stackblitzFramework={stackblitzFramework}
                      />
                    </Tooltip>
                  )}
                {previewUrl && (
                  <Tooltip title="Open preview in new tab">
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ak-button ak-button-square-10"
                    >
                      <Icon name="newWindow" className="text-lg" />
                      <span className="sr-only">Open preview in new tab</span>
                    </a>
                  </Tooltip>
                )}
              </div>
            )}
          </div>
        )}
        <div
          className={clsx(
            "grid relative gap-4",
            hasToolbar && "ak-frame-dialog/0",
            preview && (!wide || !isPreviewSelected) && "@[64rem]:grid-cols-2",
            "outline-primary in-target:outline-transparent in-target:outline transition-[outline-color] in-target:duration-1000 in-target:delay-500",
          )}
        >
          <ak.TabPanel
            tabId={getTabId(storeId, "code")}
            focusable={false}
            className="h-max sticky top-[calc(var(--header-height)+--spacing(4))] z-1"
          >
            <ak.TabProvider store={tabStore}>
              <CodeBlock
                {...props}
                {...selectedTab}
                topbar={
                  <div
                    className={clsx(
                      hasToolbar && "[--height:--spacing(12)]",
                      "ak-layer-down-0.7 ak-light:ak-layer-down-0.5 grid grid-cols-[1fr_auto] [--height:--spacing(10)] h-(--height)",
                    )}
                  >
                    <ak.TabList
                      className={clsx(
                        "ak-tab-list ak-layer-(--ak-layer-parent) rounded-b-none!",
                        hasToolbar && "sm:ak-frame-overflow/1",
                      )}
                    >
                      {tabs.map((tab) => (
                        <CodeBlockTab
                          key={tab.filename}
                          id={getTabId(storeId, tab.filename)}
                        >
                          {tab.filenameIcon && (
                            <Icon
                              name={tab.filenameIcon}
                              className="max-sm:hidden"
                            />
                          )}
                          {tab.filename || tab.lang}
                        </CodeBlockTab>
                      ))}
                    </ak.TabList>
                    {hasCodeToolbar && (
                      <div className="ms-auto ak-frame-cover/1 ak-frame-cover-start ak-frame-cover-end h-(--height) flex gap-1">
                        {edit && (
                          <Tooltip plus title="Edit code">
                            <CodeBlockEdit
                              source={source}
                              framework={framework}
                              example={example}
                              stackblitzFramework={stackblitzFramework}
                              className="ak-button @xl:text-sm @max-xl:ak-button-square h-full ak-text/80"
                            />
                          </Tooltip>
                        )}
                      </div>
                    )}
                  </div>
                }
                code={selectedTab?.code || ""}
                collapsibleClassName={clsx(
                  isPreviewSelected &&
                    "ak-layer-canvas-down-0.15! ak-light:ak-edge/15 ak-dark:ak-edge/13",
                )}
                renderContent={(content) => {
                  return (
                    <SingleTabPanel
                      render={content}
                      scrollRestoration
                      scrollElement={(panel) => panel.querySelector("pre")}
                    />
                  );
                }}
              >
                {selectedSlot}
              </CodeBlock>
              {preview && (
                <div
                  className={clsx(
                    "absolute @max-[64rem]:hidden z-1 text-lg ak-text/0 top-1/2 end-0 -translate-y-1/2 translate-x-7 ak-layer-current ak-light:ak-edge/15 ak-dark:ak-edge/13 size-10 grid place-items-center border touch-none rounded-full",
                  )}
                >
                  <Icon name="chevronRight" />
                </div>
              )}
            </ak.TabProvider>
          </ak.TabPanel>
          {preview && previewUrl && (
            <ak.TabPanel
              tabId={getTabId(storeId, "preview")}
              alwaysVisible
              focusable={false}
              className="@[64rem]:block! not-data-open:hidden"
            >
              <div
                className={clsx(
                  "group relative ak-border ak-frame-container/0 overflow-clip ak-layer-canvas-down-0.15 ak-light:ak-edge/15 ak-dark:ak-edge/13",
                  "max-sm:ak-frame-container/0 size-full",
                )}
              >
                {iframe ? (
                  <CodeBlockPreviewIframe
                    title={title}
                    fallback={fallback}
                    scrollTop={scrollTop}
                    minHeight={minHeight}
                    fullscreen={fullscreen}
                    previewUrl={previewUrl}
                    clickAndWait={clickAndWait}
                  />
                ) : (
                  <CodeBlockPreview
                    title={title}
                    anchorId={exampleId}
                    minHeight={minHeight}
                    fullscreen={fullscreen}
                  >
                    {children}
                  </CodeBlockPreview>
                )}
              </div>
            </ak.TabPanel>
          )}
        </div>
      </div>
    </ak.TabProvider>
  );
}
