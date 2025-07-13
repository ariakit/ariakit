"use client";
import Link from "next/link.js";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { twJoin } from "tailwind-merge";
import { ArrowLeft } from "@/icons/arrow-left.tsx";
import { ArrowRight } from "@/icons/arrow-right.tsx";
import { NewWindow } from "@/icons/new-window.tsx";
import { Refresh } from "@/icons/refresh.tsx";
import { Spinner } from "@/icons/spinner.tsx";
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
    "flex size-12 items-center justify-center rounded-md",
    "focus-visible:ariakit-outline-input sm:rounded-lg sm:size-10",
    "text-black/75 hover:text-black dark:text-white/75 dark:hover:text-white",
    "bg-transparent hover:bg-black/5 dark:hover:bg-white/5",
  );

  return (
    <div className="flex size-full flex-col rounded-[inherit] border-[inherit]">
      <div className="flex h-[calc(var(--toolbar-height)-1px)] flex-none items-center gap-1 rounded-t-[inherit] border-b border-[inherit] bg-white p-1 dark:bg-gray-750">
        <div className="flex items-center">
          <TooltipButton
            title="Back"
            className={buttonClassName}
            onClick={() => ref.current?.contentWindow?.history.back()}
          >
            <span className="sr-only">Back</span>
            <ArrowLeft className="size-5 stroke-[1.5px]" />
          </TooltipButton>
          <TooltipButton
            title="Forward"
            className={buttonClassName}
            onClick={() => ref.current?.contentWindow?.history.forward()}
          >
            <span className="sr-only">Forward</span>
            <ArrowRight className="size-5 stroke-[1.5px]" />
          </TooltipButton>
          <TooltipButton
            title="Reload"
            className={buttonClassName}
            onClick={() => ref.current?.contentWindow?.location.reload()}
          >
            <span className="sr-only">Reload</span>
            <Refresh className="size-[19px] stroke-[1.5px]" />
          </TooltipButton>
        </div>
        <form
          className="relative flex-auto"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            const url = data.get("url")?.toString();
            if (!url) return;
            ref.current?.contentWindow?.location.assign(url);
          }}
        >
          {!loaded && (
            <Spinner className="absolute left-2 top-2 size-5 animate-spin sm:size-4" />
          )}
          <input
            type="url"
            name="url"
            aria-label="URL"
            value={loaded ? url : ""}
            onChange={(event) => setUrl(event.target.value)}
            className="h-9 w-full rounded-full border-none bg-gray-150 px-4 text-sm text-black/80 hover:bg-gray-200 focus-visible:ariakit-outline-input sm:h-8 dark:bg-gray-850 dark:text-white/80 dark:shadow-input-dark dark:hover:bg-gray-900"
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
          <NewWindow className="size-5 stroke-[1.5px]" />
        </TooltipButton>
      </div>
      <iframe
        ref={ref}
        src={previewLink}
        title="Preview"
        className={twJoin(
          "size-full rounded-b-[inherit]",
          loaded ? "visible" : "hidden",
        )}
      />
    </div>
  );
}
