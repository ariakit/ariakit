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
  queryOptions,
  useQuery,
} from "@tanstack/react-query";
import { useId, useState } from "react";
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
    // A failed request shows a button that tries again. It doesn't try again on
    // its own, such as when the window takes the focus, which would take the
    // focus from that button.
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
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
      {/* An alert, so screen readers announce the failure when it shows. */}
      <span role="alert">Couldn't load {file.name}.</span>
      <Button $size="sm" onClick={onRetry}>
        Try again
      </Button>
    </TabPanel>
  );
}

// A panel loads its file when its tab is selected. A hidden panel doesn't read
// its file, and it renders no skeleton either, because it doesn't show.
function CodePanel({ tabId, file }: CodePanelProps) {
  const tab = useTabContext();
  const selected = useStoreState(tab, "selectedId") === tabId;
  const query = useQuery({ ...codeFileQuery(file.url), enabled: selected });
  if (!selected) return <CodeBlockPanel tabId={tabId} />;
  if (query.isError) {
    // The loading panel replaces the failure and its button, so the focus moves
    // to the tab of the file first.
    const retry = () => {
      tab?.move(tabId);
      void query.refetch();
    };
    return <FailedPanel tabId={tabId} file={file} onRetry={retry} />;
  }
  const code = query.data;
  // The same panel shows the skeleton and then the code, so the focus stays in
  // the code when the file arrives. Skeleton lines take the final height of the
  // file, so nothing moves either. The copy button waits for the file, because
  // Safari rejects a copy that waits for a request.
  return (
    <>
      {!code && (
        <span role="status" className="sr-only">
          {`Loading ${file.name}`}
        </span>
      )}
      <CodeBlockPanel
        tabId={tabId}
        aria-busy={!code || undefined}
        html={code?.html}
        copy={code ? code.text : { value: "", disabled: true }}
        $lineNumbers
        {...codeLayer}
      >
        {!code && <CodeBlockSkeleton lines={file.lines} delay={150} />}
      </CodeBlockPanel>
    </>
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
                  // start to load before the click. The panel of the selected
                  // tab already reads its file, and a prefetch of a failed file
                  // would replace its "Try again" button.
                  onPointerEnter={() => {
                    if (getTabId(file) === selectedId) return;
                    prefetchPreviewCodeFile(file);
                  }}
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
