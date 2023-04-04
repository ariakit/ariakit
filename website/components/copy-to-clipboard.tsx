"use client";

import { useEffect, useState } from "react";
import { cx } from "@ariakit/core/utils/misc";
import { Check } from "website/icons/check.js";
import { Copy } from "website/icons/copy.js";
import { tw } from "website/utils/tw.js";
import { TooltipButton } from "./tooltip-button.js";

interface CopyToClipboardProps {
  text: string;
  className?: string;
}

export function CopyToClipboard({ text, className }: CopyToClipboardProps) {
  const [state, setState] = useState<"idle" | "copying" | "copied">("idle");

  useEffect(() => {
    if (state !== "copied") return;
    const timeout = setTimeout(() => setState("idle"), 1000);
    return () => clearTimeout(timeout);
  }, [state]);

  return (
    <TooltipButton
      title={state === "copied" ? "Copied" : "Copy"}
      className={cx(
        className,
        tw`bg-transparent text-black/75 hover:bg-black/5
        focus-visible:ariakit-outline-input dark:text-white/75
        dark:hover:bg-white/5`
      )}
      onClick={async () => {
        if (state !== "idle") return;
        await navigator.clipboard.writeText(text);
        setState("copied");
      }}
    >
      {state === "idle" && <Copy className="h-5 w-5" />}
      {state === "copied" && <Check className="h-5 w-5" />}
    </TooltipButton>
  );
}
