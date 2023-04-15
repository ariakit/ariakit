"use client";

import type { ButtonHTMLAttributes } from "react";
import { forwardRef, useEffect, useState } from "react";
import { Check } from "icons/check.js";
import { Copy } from "icons/copy.js";
import { TooltipButton } from "./tooltip-button.js";

interface CopyToClipboardProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
}

export const CopyToClipboard = forwardRef<
  HTMLButtonElement,
  CopyToClipboardProps
>(({ text, ...props }, ref) => {
  const [state, setState] = useState<"idle" | "copying" | "copied">("idle");

  useEffect(() => {
    if (state !== "copied") return;
    const timeout = setTimeout(() => setState("idle"), 1000);
    return () => clearTimeout(timeout);
  }, [state]);

  return (
    <TooltipButton
      ref={ref}
      {...props}
      title={state === "copied" ? "Copied" : "Copy to clipboard"}
      onClick={async () => {
        if (state !== "idle") return;
        await navigator.clipboard.writeText(text);
        setState("copied");
      }}
    >
      <span className="sr-only">Copy to clipboard</span>
      {state === "idle" && <Copy className="h-5 w-5" />}
      {state === "copied" && <Check className="h-5 w-5" />}
    </TooltipButton>
  );
});
