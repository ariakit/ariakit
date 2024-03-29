"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "icons/arrow-left.tsx";
import { ArrowRight } from "icons/arrow-right.tsx";
import { NewWindow } from "icons/new-window.tsx";
import { Refresh } from "icons/refresh.tsx";
import Link from "next/link.js";
import { flushSync } from "react-dom";
import { twJoin } from "tailwind-merge";
import { TooltipButton } from "./tooltip-button.tsx";

export interface PlaygroundBrowserProps {
  previewLink: string;
}

export function PlaygroundBrowser({ previewLink }: PlaygroundBrowserProps) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [url, setUrl] = useState("");
  const loaded = url && url !== "about:blank";

  useEffect(() => {
    const iframe = ref.current;
    if (!iframe) return;
    setUrl(iframe.contentWindow?.location.href ?? "");
    type Event = MessageEvent<{ type: string; pathname: string }>;
    const onMessage = (event: Event) => {
      if (event.data.type !== "pathname") return;
      flushSync(() => {
        setUrl(iframe.contentWindow?.location.href ?? "");
      });
    };
    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("message", onMessage);
    };
  }, []);

  const buttonClassName = twJoin(
    "flex h-8 w-8 items-center justify-center rounded-full p-1.5",
    "text-black/70 hover:text-black",
    "dark:text-white/75 dark:hover:text-white",
    "bg-transparent hover:bg-black/5 dark:hover:bg-white/5",
    "focus-visible:ariakit-outline-input",
  );

  return (
    <div className="flex h-full flex-col border-none border-[inherit]">
      <div className="flex items-center gap-2 border-b border-[inherit] bg-white px-2 py-1 dark:bg-gray-750">
        <div className="flex items-center">
          <TooltipButton
            title="Back"
            className={buttonClassName}
            onClick={() => ref.current?.contentWindow?.history.back()}
          >
            <span className="sr-only">Back</span>
            <ArrowLeft />
          </TooltipButton>
          <TooltipButton
            title="Forward"
            className={buttonClassName}
            onClick={() => ref.current?.contentWindow?.history.forward()}
          >
            <span className="sr-only">Forward</span>
            <ArrowRight />
          </TooltipButton>
          <TooltipButton
            title="Reload"
            className={buttonClassName}
            onClick={() => ref.current?.contentWindow?.location.reload()}
          >
            <span className="sr-only">Reload</span>
            <Refresh />
          </TooltipButton>
        </div>
        <form
          className="flex-auto"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            const url = data.get("url")?.toString();
            if (!url) return;
            ref.current?.contentWindow?.location.assign(url);
          }}
        >
          <input
            type="url"
            name="url"
            aria-label="URL"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            className="h-8 w-full rounded-full border-none bg-gray-150 px-4 text-sm text-black/80 hover:bg-gray-200 focus-visible:ariakit-outline-input dark:bg-gray-850 dark:text-white/80 dark:shadow-input-dark dark:hover:bg-gray-900"
          />
        </form>
        <TooltipButton
          title="Open in new tab"
          className={buttonClassName}
          render={(props) => (
            <Link {...props} href={url || previewLink} target="_blank" />
          )}
        >
          <span className="sr-only">Open in new tab</span>
          <NewWindow />
        </TooltipButton>
      </div>
      <iframe
        ref={ref}
        src={previewLink}
        title="Preview"
        className={twJoin("size-full", loaded ? "visible" : "hidden")}
      />
    </div>
  );
}
