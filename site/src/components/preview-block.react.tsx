import * as ak from "@ariakit/react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { Icon } from "../icons/icon.react.tsx";
import { cn } from "../lib/cn.ts";
import { CodeBlockTabs } from "./code-block.react.tsx";
import { Tooltip } from "./tooltip.react.tsx";

export interface PreviewBlockProps {
  example: string;
  framework: string;
  fallback?: ReactNode;
}

export function PreviewBlock({
  example,
  framework,
  fallback,
}: PreviewBlockProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [mode, setMode] = useState<"preview" | "code">("preview");

  const previewUrl = `/${framework}/previews/${example}`;

  useEffect(() => {
    setLoaded(false);
  }, [previewUrl]);

  useEffect(() => {
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
      <CodeBlockTabs
        storeId={`preview-${example}`}
        aiPrompt="Generate a simple preview of the component"
        className={mode === "code" ? "" : "hidden"}
        lineNumbers
        maxLines={17}
        onPreviewClick={() => setMode("preview")}
        tabs={[
          {
            filename: "index.tsx",
            filenameIcon: "react",
            code: `import { Button } from 'ariakit-react';
dasdas`,
          },
        ]}
      />
      <div
        className={cn(
          "ak-layer-canvas-down-0.3 ak-frame-playground/0 relative ak-frame-border overflow-clip h-117",
          mode === "code" ? "hidden" : "",
        )}
      >
        <div className="absolute z-1 inset-0 bottom-auto ak-frame-container/1 pointer-events-none *:pointer-events-auto flex items-start">
          <ak.TabProvider
            defaultSelectedId={mode}
            setSelectedId={(id) =>
              setMode(id === "preview" ? "preview" : "code")
            }
          >
            {/* <ak.TabList className="ak-frame/1 max-sm:ak-frame/0 flex gap-(--ak-frame-padding) ak-layer-down h-10 sm:h-[calc(--spacing(10)+var(--ak-frame-padding))] text-sm ring ak-light:sm:ring-0"> */}
            <ak.TabList className="ak-segmented text-sm max-sm:ak-frame-container/0.5 h-10 sm:h-[calc(--spacing(10)+var(--ak-frame-padding))]">
              {/* <ak.Tab className="ak-button gap-1.5 aria-selected:z-1 aria-selected:ring ak-light:ak-edge-5.7/100 ak-dark:ak-edge-7/100 aria-selected:ak-layer-2 px-(--ak-frame-padding) font-normal"> */}
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
      </div>
    </>
  );
}
