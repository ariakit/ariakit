import { useStoreState, useTabContext } from "@ariakit/react";
import { Button } from "@ariakit/ui/components/button.ariakit.react";
import {
  CodeBlockPanel,
  CodeBlockSkeleton,
} from "@ariakit/ui/components/code-block.ariakit.react";
import { TabPanel, TabPanels } from "@ariakit/ui/components/tabs.ariakit.react";
import {
  QueryErrorResetBoundary,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { Component, Suspense } from "react";
import type { ReactNode } from "react";
import { codeFileQuery } from "./use-code-file.ts";
import type { CodeFileInfo } from "./use-code-file.ts";

export interface CodeFilePanelProps {
  tabId: string;
  file: CodeFileInfo;
  /**
   * The milliseconds to wait before the request, such as to show the loading
   * state on a fast network.
   * @default 0
   */
  delay?: number;
}

interface FileErrorBoundaryProps extends CodeFilePanelProps {
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
function PlaceholderPanel({ tabId, file }: CodeFilePanelProps) {
  return (
    <CodeBlockPanel
      tabId={tabId}
      aria-busy
      copy={{ value: "", disabled: true }}
    >
      <CodeBlockSkeleton lines={file.lines} delay={150} />
    </CodeBlockPanel>
  );
}

function FilePanel({ tabId, file, delay }: CodeFilePanelProps) {
  // Suspends until the file arrives, or throws the error of the request.
  const { data: code } = useSuspenseQuery(codeFileQuery(file.url, delay));
  return <CodeBlockPanel tabId={tabId} html={code.html} copy={code.text} />;
}

interface FailedPanelProps extends Omit<CodeFilePanelProps, "delay"> {
  onRetry: () => void;
}

function FailedPanel({ tabId, file, onRetry }: FailedPanelProps) {
  return (
    <TabPanel
      tabId={tabId}
      // The surface of the code, which joins the selected tab.
      render={<TabPanels $lighten={0.5} $frameEnd />}
      className="flex flex-wrap items-center gap-3 text-sm"
    >
      <span>Couldn't load {file.name}.</span>
      <Button $size="sm" onClick={onRetry}>
        Try again
      </Button>
    </TabPanel>
  );
}

/**
 * A tab panel that loads its file with `useSuspenseQuery` when its tab is
 * selected. It needs a `QueryClientProvider` above it. Skeleton lines show
 * while the file loads, and a button tries again after a failure.
 */
export function CodeFilePanel(props: CodeFilePanelProps) {
  const { tabId, file } = props;
  const tab = useTabContext();
  const selected = useStoreState(tab, "selectedId") === tabId;
  // A hidden panel doesn't read its file, so the file loads only when its tab
  // is selected, unless a pointer over the tab started it earlier.
  if (!selected) return <PlaceholderPanel {...props} />;
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
