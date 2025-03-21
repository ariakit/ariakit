import type { ComponentProps } from "react";
import { useEffect, useState } from "react";
import { Icon } from "../icons/icon.react.tsx";
import { cn } from "../lib/cn.ts";
import { Tooltip } from "./tooltip.react.tsx";

interface CopyCodeProps extends ComponentProps<"button"> {
  text: string;
  label?: string;
  title?: string;
}

export function CopyCode({
  text,
  children,
  label = "Copy code",
  title = label,
  ...props
}: CopyCodeProps) {
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
    <Tooltip title={state === "idle" ? title : "Copied"} placement="left">
      <button
        {...props}
        className={cn(
          "ak-button ak-button-square ak-layer-pop size-9",
          props.className,
        )}
        onClick={async (event) => {
          props.onClick?.(event);
          if (event.defaultPrevented) return;
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
      </button>
    </Tooltip>
  );
}
