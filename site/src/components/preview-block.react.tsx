import { type ReactNode, useEffect, useRef, useState } from "react";
import { Icon } from "../icons/icon.react.tsx";
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
    <div className="ak-layer-canvas-down-0.3 ak-frame-container/0 relative border overflow-clip h-117">
      <div className="absolute z-1 top-0 end-0 ak-frame-container/1 flex justify-end">
        <Tooltip title="Open preview in new tab">
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ak-button ak-button-square size-10 text-lg"
          >
            <span className="sr-only">Open preview in new tab</span>
            <Icon name="newWindow" />
          </a>
        </Tooltip>
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
  );
}
