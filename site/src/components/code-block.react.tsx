import { invariant } from "@ariakit/core/utils/misc";
import * as ak from "@ariakit/react";
import clsx from "clsx";
import * as React from "react";
import useLocalStorageState from "use-local-storage-state";
import { Thumbnail } from "../examples/popover/thumb.react.tsx";
import { Icon } from "../icons/icon.react.tsx";
import type {
  CodeBlockProps as CodeBlockBaseProps,
  CodeBlockTabProps as CodeBlockTabBaseProps,
} from "./code-block.types.ts";
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
        className="absolute group/expand grid outline-none ak-frame-cover/1 py-2 inset-0 ak-layer-current bg-transparent bg-gradient-to-b from-transparent from-[calc(100%-var(--line-height)*8)] ak-light:from-[calc(100%-var(--line-height)*4)] to-[calc(100%-var(--line-height))] to-(--ak-layer) z-1 justify-center items-end"
      >
        <div className="ak-button h-9 ak-layer-pop text-sm/[1.5rem] hover:ak-layer-hover group-focus-visible/expand:ak-button_focus group-active/expand:ak-button_active">
          Expand code
          <Icon className="text-base" name="chevronDown" />
        </div>
      </button>
    ) : null;

  const collapseButton = (
    <div
      className={clsx("sticky bottom-2", collapsible && !collapsed && "my-2")}
    >
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
      className={clsx(
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
        className={clsx(
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

interface CodeBlockTabProps extends ak.TabProps {
  isPreview: boolean;
  fullscreenPreview?: boolean;
}

function CodeBlockTab({
  isPreview,
  fullscreenPreview,
  children,
  ...props
}: CodeBlockTabProps) {
  return (
    <ak.Tab
      {...props}
      className={clsx(
        isPreview
          ? [
              "ak-segmented-button aria-selected:ak-edge/8 aria-selected:ak-light:ak-edge/12 aria-selected:ak-layer-pop aria-selected:shadow-none",
              fullscreenPreview
                ? "aria-selected:ak-layer-down aria-selected:ak-light:ak-edge/0 px-2 not-aria-selected:px-3"
                : "px-1.5 not-aria-selected:px-2.5 not-aria-selected:sm:px-3 sm:px-2",
            ]
          : "ak-tab-folder data-focus-visible:ak-tab-folder_focus h-full text-sm",
        props.className,
      )}
    >
      {isPreview ? children : <div>{children}</div>}
    </ak.Tab>
  );
}

export interface CodeBlockTabsProps2
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
  tabs: CodeBlockTabBaseProps[];
  persistTabKey?: string;
  preview?: boolean;
  aiPrompt?: string;
  edit?: boolean;
  fullscreenPreview?: boolean;
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
  persistTabKey,
  aiPrompt,
  preview,
  fullscreenPreview,
  edit,
  slot0,
  slot1,
  slot2,
  slot3,
  slot4,
  slot5,
  slot6,
  slot7,
  ...props
}: CodeBlockTabsProps2) {
  const storeId = React.useId();
  const slots = [slot0, slot1, slot2, slot3, slot4, slot5, slot6, slot7];

  const [firstTab] = tabs;
  invariant(firstTab, "At least one tab is required");

  const [loaded, setLoaded] = React.useState(false);

  fullscreenPreview = preview && fullscreenPreview;

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
  const previewUrl = `/react/previews/popover`;
  const hasToolbar = !!aiPrompt || edit;

  const renderTopbar = () => (
    <div
      className={clsx(
        hasToolbar && "[--height:--spacing(12)]",
        isPreviewSelected
          ? [
              "flex items-start",
              fullscreenPreview
                ? "ak-layer ak-frame-cover/1"
                : "absolute z-1 inset-0 bottom-auto ak-frame-container/1 pointer-events-none *:pointer-events-auto",
            ]
          : "ak-layer-down ak-light:ak-layer-down-0.5 grid grid-cols-[1fr_auto] [--height:--spacing(10)] h-(--height)",
      )}
    >
      <ak.TabList
        className={clsx(
          isPreviewSelected
            ? [
                "ak-segmented ak-layer-(--ak-layer-parent) text-sm h-10 gap-1",
                fullscreenPreview
                  ? "ak-frame-container/0"
                  : "max-sm:ak-frame-container/0.5 sm:h-[calc(--spacing(10)+var(--ak-frame-padding))]",
              ]
            : [
                "ak-tab-list ak-layer-(--ak-layer-parent) !rounded-b-none",
                hasToolbar && !fullscreenPreview && "sm:ak-frame-overflow/1",
              ],
        )}
      >
        {preview && (
          <CodeBlockTab
            id={getTabId(storeId, "preview")}
            isPreview={isPreviewSelected}
            fullscreenPreview={fullscreenPreview}
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
              isPreview={isPreviewSelected}
              fullscreenPreview={fullscreenPreview}
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
          {aiPrompt && (
            <button className="ak-button @xl:text-sm @max-xl:ak-button-square h-full ak-text/80">
              <Icon name="sparks" className="text-lg" />
              <span className="@max-xl:sr-only">Copy AI prompt</span>
            </button>
          )}
          {edit && (
            <Tooltip title="Edit code">
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
          isPreviewSelected && "*:ak-layer-down-0.15 *:ak-dark:ak-edge/13",
          props.className,
        )}
        renderContent={(content) => {
          return (
            <>
              {preview && (isPreviewSelected || loaded) && (
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
                        !fullscreenPreview && "ak-frame-cover-start",
                      )}
                    >
                      <PreviewBlock
                        example="popover"
                        framework="react"
                        fallback={<Thumbnail />}
                        onLoad={() => setLoaded(true)}
                      />
                    </div>
                  }
                />
              )}
              {!isPreviewSelected && (
                <SingleTabPanel
                  scrollRestoration
                  scrollElement={(panel) => panel.querySelector("pre")}
                  render={content}
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

export interface CodeBlockTabsProps extends CodeBlockTabsProps2 {}

export function CodeBlockTabs(props: CodeBlockTabsProps) {
  return (
    <div className="@container">
      <div className="grid grid-cols-2 gap-4 @max-[72rem]:grid-cols-1">
        <CodeBlockTabs2
          {...props}
          preview={false}
          className={props.preview ? "@max-[72rem]:hidden" : ""}
        />
        {props.preview && (
          <CodeBlockTabs2 {...props} className="@[72rem]:hidden" />
        )}
        {props.preview && (
          <div className="relative ak-light:ak-edge/15 ak-frame-border ak-frame-container/0 overflow-clip ak-layer-down-0.15 ak-dark:ak-edge/13 @max-[72rem]:hidden">
            <div className="ak-frame-cover/1 absolute top-0 end-0 z-1">
              <Tooltip title="Open preview in new tab">
                <a
                  href="/react/previews/popover"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ak-button ak-button-square sm:h-10 h-9"
                >
                  <Icon name="newWindow" className="text-lg" />
                  <span className="sr-only">Open preview in new tab</span>
                </a>
              </Tooltip>
            </div>
            <PreviewBlock
              example="popover"
              framework="react"
              fallback={<Thumbnail />}
            />
          </div>
        )}
      </div>
    </div>
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
    // if (loaded) return;
    const iframe = iframeRef.current;
    if (!iframe) return;
    let timeout = 0;
    let raf = 0;

    const onLoad = () => {
      const doc = iframe.contentDocument;
      if (!doc) return;

      const clickButtonAndCheckDialog = () => {
        doc.documentElement.dataset.iframe = "true";
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
            // doc.body.inert = false;

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
            doc.body.style.display = "none";
            dialog.style.removeProperty("transition");

            // button.click();

            setLoaded(true);
            onLoadProp?.();
            raf = requestAnimationFrame(() => {
              doc.body.style.removeProperty("display");
            });
            timeout = window.setTimeout(() => {
              doc.body.inert = false;
            }, 42);

            // Wait for the dialog to be stable (no more transitions)
            // raf = requestAnimationFrame(() => {
            //   dialog.style.removeProperty("transition");
            //   button.click();
            //   setLoaded(true);
            //   onLoadProp?.();
            //   timeout = window.setTimeout(() => {
            //     doc.body.inert = false;
            //   }, 42);
            // });
          });
        }, 42);
      };

      // Start the process
      clickButtonAndCheckDialog();
    };

    iframe.addEventListener("load", onLoad);
    // iframe.src = previewUrl;

    // intersection observer
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          if (!iframe.src.endsWith(previewUrl)) {
            iframe.src = previewUrl;
          } else {
            setLoaded(true);
            onLoadProp?.();
          }
        } else {
          setLoaded(false);
          // iframe.src = "";
        }
      },
      {
        rootMargin: "100%",
      },
    );
    observer.observe(iframe);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(raf);
      iframe.removeEventListener("load", onLoad);
      observer.disconnect();
    };
  }, [previewUrl]);

  return (
    <>
      <div className="relative h-116">
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
    </>
  );
}
