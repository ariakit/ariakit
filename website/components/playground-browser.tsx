"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "icons/arrow-left.jsx";
import { ArrowRight } from "icons/arrow-right.jsx";
import { NewWindow } from "icons/new-window.jsx";
import { Refresh } from "icons/refresh.jsx";
import Link from "next/link.js";
import { flushSync } from "react-dom";
import { tw } from "utils/tw.js";
import { TooltipButton } from "./tooltip-button.jsx";

export interface PlaygroundBrowserProps {
  previewLink: string;
}

const style = {
  wrapper: tw`
    flex h-full flex-col border-none border-[inherit]
  `,
  chrome: tw`
    flex items-center gap-2 py-1 px-2 bg-white dark:bg-gray-750
    border-b border-[inherit]
  `,
  toolbar: tw`
    flex items-center
  `,
  button: tw`
    flex h-8 w-8 items-center justify-center rounded-full p-1.5
    text-black/70 hover:text-black
    dark:text-white/75 dark:hover:text-white
    bg-transparent hover:bg-black/5 dark:hover:bg-white/5
    focus-visible:ariakit-outline-input
  `,
  form: tw`
    flex-auto
  `,
  input: tw`
    w-full h-8 rounded-full px-4 text-sm
    border-none text-black/80 dark:text-white/80
    bg-gray-150 dark:bg-gray-850
    hover:bg-gray-200 dark:hover:bg-gray-900
    dark:shadow-input-dark
    focus-visible:ariakit-outline-input
  `,
};

export function PlaygroundBrowser({ previewLink }: PlaygroundBrowserProps) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [url, setUrl] = useState("");

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

  return (
    <div className={style.wrapper}>
      <div className={style.chrome}>
        <div className={style.toolbar}>
          <TooltipButton
            title="Back"
            className={style.button}
            onClick={() => ref.current?.contentWindow?.history.back()}
          >
            <span className="sr-only">Back</span>
            <ArrowLeft />
          </TooltipButton>
          <TooltipButton
            title="Forward"
            className={style.button}
            onClick={() => ref.current?.contentWindow?.history.forward()}
          >
            <span className="sr-only">Forward</span>
            <ArrowRight />
          </TooltipButton>
          <TooltipButton
            title="Reload"
            className={style.button}
            onClick={() => ref.current?.contentWindow?.location.reload()}
          >
            <span className="sr-only">Reload</span>
            <Refresh />
          </TooltipButton>
        </div>
        <form
          className={style.form}
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
            className={style.input}
          />
        </form>
        <TooltipButton
          title="Open in new tab"
          className={style.button}
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
        style={{
          visibility: url && url !== "about:blank" ? "visible" : "hidden",
        }}
        className="h-full w-full"
      />
    </div>
  );
}
