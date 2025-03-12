import {
  Tooltip,
  TooltipAnchor,
  TooltipProvider,
  useStoreState,
  useTooltipStore,
} from "@ariakit/react";
import type { ComponentProps } from "react";
import { useEffect, useState } from "react";
import { Icon } from "../icons/icon.react.tsx";

interface CopyToClipboardProps extends ComponentProps<"button"> {
  text: string;
}

export function CopyToClipboard({
  text,
  children,
  ...props
}: CopyToClipboardProps) {
  const tooltip = useTooltipStore();
  const open = useStoreState(tooltip, "open");
  const [state, setState] = useState<"idle" | "copying" | "copied">("idle");

  useEffect(() => {
    if (state !== "copied") return;
    const timeout = setTimeout(() => setState("idle"), 1500);
    return () => clearTimeout(timeout);
  }, [state]);

  // Reset state when text changes
  useEffect(() => {
    setState("idle");
  }, [text]);

  return (
    <TooltipProvider store={tooltip} placement="left">
      <TooltipAnchor
        data-open={open || undefined}
        render={<button {...props} />}
        className="ak-button ak-button-square ak-layer-current size-9"
        onClick={async () => {
          if (state !== "idle") return;
          await navigator.clipboard.writeText(text);
          setState("copied");
        }}
      >
        <span className="sr-only">Copy to clipboard</span>
        {state === "copied" ? (
          <Icon
            key="check"
            name="check"
            className="stroke-[1.5] [stroke-dasharray:1em] starting:[stroke-dashoffset:1em] [stroke-dashoffset:0] transition-[stroke-dashoffset] duration-350"
          />
        ) : (
          <Icon key="copy" name="copy" />
        )}
      </TooltipAnchor>
      <Tooltip
        unmountOnHide
        portal={false}
        className="ak-layer z-10 text-sm ak-frame-lg/1 px-2 ring shadow-md"
      >
        {state === "idle" ? "Copy" : "Copied"}
      </Tooltip>
    </TooltipProvider>
  );
}
