import * as ak from "@ariakit/react";
import type { ReactElement, ReactNode } from "react";
import { cn } from "../lib/cn.ts";

export interface TooltipProps
  extends Omit<ak.TooltipProps, "title" | "children"> {
  placement?: ak.TooltipProviderProps["placement"];
  title: ReactNode;
  children: ReactElement;
}

export function Tooltip({
  title,
  children,
  placement,
  ...props
}: TooltipProps) {
  const store = ak.useTooltipStore();
  const open = ak.useStoreState(store, "open");
  return (
    <ak.TooltipProvider store={store} placement={placement}>
      <ak.TooltipAnchor data-open={open || undefined} render={children} />
      <ak.Tooltip
        unmountOnHide
        {...props}
        className={cn("ak-tooltip", props.className)}
      >
        {title}
      </ak.Tooltip>
    </ak.TooltipProvider>
  );
}
