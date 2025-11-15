/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import * as ak from "@ariakit/react";
import clsx from "clsx";
import type { ReactElement, ReactNode } from "react";
import { getPortalRoot } from "../lib/get-portal-root.ts";

export interface TooltipProps
  extends Omit<ak.TooltipProps, "title" | "children"> {
  placement?: ak.TooltipProviderProps["placement"];
  children: ReactElement;
  title: ReactNode;
  plus?: boolean;
  arrow?: boolean;
}

export function Tooltip({
  title,
  children,
  placement,
  plus,
  arrow,
  ...props
}: TooltipProps) {
  const store = ak.useTooltipStore();
  const open = ak.useStoreState(store, "open");
  return (
    <ak.TooltipProvider store={store} placement={placement} timeout={250}>
      <ak.TooltipAnchor data-open={open || undefined} render={children} />
      <ak.Tooltip
        unmountOnHide
        portalElement={getPortalRoot}
        {...props}
        className={clsx(
          "ak-tooltip data-open:ak-tooltip_open not-data-open:ak-tooltip_closed max-w-80 origin-(--popover-transform-origin)",
          plus && "ak-frame-force-tooltip/0.5 p-1 px-2",
          props.className,
        )}
      >
        {arrow && <ak.TooltipArrow className="ak-tooltip-arrow" />}
        {plus ? (
          <>
            <div className="float-end -m-0.5 -me-1.5 ms-1.5 ak-layer-mix-primary/15 ak-text-primary ak-frame/px font-medium px-1 ak-frame-border ak-edge-primary/20 border-dashed">
              Plus
            </div>
            {title}
          </>
        ) : (
          title
        )}
      </ak.Tooltip>
    </ak.TooltipProvider>
  );
}
