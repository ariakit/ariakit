"use client";

import { useEffect, useState } from "react";
import { cx } from "@ariakit/core/utils/misc";
import Check from "website/icons/check.js";
import Copy from "website/icons/copy.js";
import Spinner from "website/icons/spinner.js";
import tw from "website/utils/tw.js";
import TooltipButton from "./tooltip-button.js";

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
      title="Copy"
      className={cx(
        className,
        tw`bg-transparent text-black/75 hover:bg-black/5
        focus-visible:ariakit-outline-input dark:text-white/75
        dark:hover:bg-white/5`
      )}
      onClick={async () => {
        if (state !== "idle") return;
        setState("copying");
        await Promise.all([
          navigator.clipboard.writeText(text),
          new Promise((resolve) => setTimeout(resolve, 200)),
        ]);
        setState("copied");
      }}
    >
      {state === "idle" && <Copy className="h-4 w-4" />}
      {state === "copying" && <Spinner className="h-4 w-4 animate-spin" />}
      {state === "copied" && <Check className="h-4 w-4 stroke-green-400" />}
    </TooltipButton>
  );
}
