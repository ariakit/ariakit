/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { useStoreState, useTabContext } from "@ariakit/react";
import { Button } from "@ariakit/ui/components/button.ariakit.react";
import {
  CodeBlock,
  CodeBlockPanel,
  CodeBlockSkeleton,
  CodeBlockTab,
  CodeBlockTabList,
} from "@ariakit/ui/components/code-block.ariakit.react";
import {
  Dialog,
  DialogClose,
  DialogHeader,
  DialogHeaderContent,
  DialogHeading,
} from "@ariakit/ui/components/dialog.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import { TabPanel, TabPanels } from "@ariakit/ui/components/tabs.ariakit.react";
import {
  QueryClient,
  QueryClientProvider,
  QueryErrorResetBoundary,
  queryOptions,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { Component, Suspense, useId, useState } from "react";
import type { ReactNode } from "react";
import type { PreviewCodeFile } from "#app/lib/preview-code.ts";
import { FileIcon } from "#app/recipes/code-block/file-icon.react.tsx";

// The tabs and the code move half a step from the frame around the block in the
// opposite direction of their default lighten, which the offset replaces. In
// dark mode, they're darker. In light mode, they would be lighter.
const codeLayer = { $lightnessOffset: -0.5 } as const;

// The cards of a page share the files that they loaded, and a file loads once
// for the whole visit, as the client router keeps this module.
const queryClient = new QueryClient();

async function fetchCodeFile(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Couldn't load ${url}: ${response.status}`);
  }
  const html = await response.text();
  // The lines are text nodes and spans between line breaks, so their text is
  // the code to copy.
  const template = document.createElement("template");
  template.innerHTML = html;
  const text = template.content.textContent ?? "";
  return { html, text };
}

function codeFileQuery(url: string) {
  return queryOptions({
    queryKey: ["preview-code-file", url],
    queryFn: () => fetchCodeFile(url),
    // A built file doesn't change, so it never goes stale or leaves the cache,
    // and a panel that hides and shows again doesn't load it again.
    staleTime: Infinity,
    gcTime: Infinity,
    // A failed request shows a button that tries again.
    retry: false,
  });
}

/**
 * Starts to load a file before its panel shows, such as when the pointer moves
 * over the button that opens the code.
 */
export function prefetchPreviewCodeFile(file: PreviewCodeFile) {
  void queryClient.prefetchQuery(codeFileQuery(file.url));
}

interface CodePanelProps {
  tabId: string;
  file: PreviewCodeFile;
}

interface FileErrorBoundaryProps extends CodePanelProps {
  /** Lets the failed query start a new request when it renders again. */
  onReset: () => void;
  children: ReactNode;
}

// Only a class component can catch an error in rendering, such as a failed
// request that useSuspenseQuery throws. A retry resets the query and renders
// the children again, which start a new request.
class FileErrorBoundary extends Component<
  FileErrorBoundaryProps,
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  retry = () => {
    this.props.onReset();
    this.setState({ failed: false });
  };

  render() {
    const { tabId, file, children } = this.props;
    if (!this.state.failed) return children;
    return <FailedPanel tabId={tabId} file={file} onRetry={this.retry} />;
  }
}

// Skeleton lines take the final height of the file, so nothing moves when it
// arrives. The copy button waits for the file, because Safari rejects a copy
// that waits for a request.
function PlaceholderPanel({ tabId, file }: CodePanelProps) {
  return (
    <CodeBlockPanel
      tabId={tabId}
      aria-busy
      copy={{ value: "", disabled: true }}
      $lineNumbers
      {...codeLayer}
    >
      <CodeBlockSkeleton lines={file.lines} delay={150} />
    </CodeBlockPanel>
  );
}

function FilePanel({ tabId, file }: CodePanelProps) {
  // Suspends until the file arrives, or throws the error of the request.
  const { data: code } = useSuspenseQuery(codeFileQuery(file.url));
  return (
    <CodeBlockPanel
      tabId={tabId}
      html={code.html}
      copy={code.text}
      $lineNumbers
      {...codeLayer}
    />
  );
}

interface FailedPanelProps extends CodePanelProps {
  onRetry: () => void;
}

function FailedPanel({ tabId, file, onRetry }: FailedPanelProps) {
  return (
    <TabPanel
      tabId={tabId}
      // The surface of the code, which joins the selected tab.
      render={<TabPanels {...codeLayer} $frameEnd />}
      className="flex flex-wrap items-center gap-3 text-sm"
    >
      <span>Couldn't load {file.name}.</span>
      <Button $size="sm" onClick={onRetry}>
        Try again
      </Button>
    </TabPanel>
  );
}

// A panel loads its file when its tab is selected. A hidden panel doesn't read
// its file, and it renders no skeleton either, because it doesn't show.
function CodePanel(props: CodePanelProps) {
  const { tabId, file } = props;
  const tab = useTabContext();
  const selected = useStoreState(tab, "selectedId") === tabId;
  if (!selected) return <CodeBlockPanel tabId={tabId} />;
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <FileErrorBoundary {...props} onReset={reset}>
          <Suspense
            fallback={
              <>
                <span role="status" className="sr-only">
                  {`Loading ${file.name}`}
                </span>
                <PlaceholderPanel {...props} />
              </>
            }
          >
            <FilePanel {...props} />
          </Suspense>
        </FileErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}

export interface PreviewCardCodeProps {
  /** The title of the preview, which names the dialog. */
  title: string;
  files: PreviewCodeFile[];
}

/**
 * The dialog of a preview card with the source files of its preview, in file
 * tabs. Put it in the `DialogProvider` of the button that opens it. Each file
 * loads from its partial page when its tab is selected, or earlier when the
 * pointer moves over its tab.
 */
export function PreviewCardCode({ title, files }: PreviewCardCodeProps) {
  // The cards of a page can have files with the same name, so the tab ids are
  // unique to the card.
  const baseId = useId();
  const getTabId = (file: PreviewCodeFile) => `${baseId}-${file.name}`;
  const firstFile = files[0];
  // The dialog leaves the page when it closes, so the card keeps the selected
  // tab for the next time it opens.
  const [selectedId, setSelectedId] = useState<string | null | undefined>(
    firstFile && getTabId(firstFile),
  );
  return (
    <QueryClientProvider client={queryClient}>
      {/* A hidden dialog would render its selected panel, which would load its
          file before the dialog opens. */}
      <Dialog unmountOnHide $maxWidth={200} className="flex flex-col gap-4">
        <DialogHeader>
          <DialogHeaderContent>
            <DialogHeading>{title}</DialogHeading>
          </DialogHeaderContent>
          <DialogClose />
        </DialogHeader>
        {/* The dialog is a flex column with a maximum height, so the frame
            and the block take the height that the header leaves, and long code
            scrolls inside. */}
        <Frame $cover $p={1} className="flex min-h-0 flex-col">
          <CodeBlock
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            className="min-h-0"
          >
            <CodeBlockTabList aria-label="Files">
              {files.map((file, index) => (
                <CodeBlockTab
                  key={file.name}
                  id={getTabId(file)}
                  icon={file.icon && <FileIcon icon={file.icon} />}
                  separator={!!index}
                  {...codeLayer}
                  // A pointer over the tab is a sign of intent, so the file can
                  // start to load before the click.
                  onPointerEnter={() => prefetchPreviewCodeFile(file)}
                >
                  {file.name}
                </CodeBlockTab>
              ))}
            </CodeBlockTabList>
            {files.map((file) => (
              <CodePanel key={file.name} tabId={getTabId(file)} file={file} />
            ))}
          </CodeBlock>
        </Frame>
      </Dialog>
    </QueryClientProvider>
  );
}
