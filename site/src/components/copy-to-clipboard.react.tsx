import { Tooltip, TooltipAnchor, TooltipProvider } from "@ariakit/react";
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
  const [state, setState] = useState<"idle" | "copying" | "copied">("idle");

  const icon = state === "idle" ? "copy" : "check";

  useEffect(() => {
    if (state !== "copied") return;
    const timeout = setTimeout(() => setState("idle"), 1000);
    return () => clearTimeout(timeout);
  }, [state]);

  return (
    <TooltipProvider>
      <TooltipAnchor
        render={<button {...props} />}
        className="ak-layer-current hover:ak-layer-pop ak-frame-lg/2.5"
        onClick={async () => {
          if (state !== "idle") return;
          await navigator.clipboard.writeText(text);
          setState("copied");
        }}
      >
        <span className="sr-only">Copy to clipboard</span>
        <Icon name={icon} className="text-[1.25rem]" />
      </TooltipAnchor>
      <Tooltip className="ak-layer z-10 text-sm ak-frame-lg/1 px-2 ring shadow">
        {state === "idle" ? "Copy to clipboard" : "Copied"}
      </Tooltip>
    </TooltipProvider>
  );
}
