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

interface CopyCodeProps extends ComponentProps<"button"> {
  text: string;
  label?: string;
  tooltipLabel?: string;
}

export function CopyCode({
  text,
  children,
  label = "Copy",
  tooltipLabel = label,
  ...props
}: CopyCodeProps) {
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
        className="ak-button ak-button-square ak-layer-feature size-9"
        onClick={async () => {
          if (state !== "idle") return;
          await navigator.clipboard.writeText(text);
          setState("copied");
        }}
      >
        {state === "copied" ? (
          <Icon
            key="check"
            name="check"
            className="stroke-[1.5] [stroke-dasharray:1em] starting:[stroke-dashoffset:1em] [stroke-dashoffset:0] transition-[stroke-dashoffset] duration-350"
          />
        ) : (
          <Icon key="copy" name="copy" />
        )}
        <span className="sr-only">{label}</span>
      </TooltipAnchor>
      <Tooltip unmountOnHide className="ak-tooltip">
        {state === "idle" ? tooltipLabel : "Copied"}
      </Tooltip>
    </TooltipProvider>
  );
}
