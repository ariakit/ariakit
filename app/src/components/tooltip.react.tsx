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
import {
  TooltipAnchor,
  TooltipArrow,
  TooltipProvider,
  Tooltip as UiTooltip,
} from "@ariakit/ui/ariakit/tooltip.react.tsx";
import type { TooltipProps as UiTooltipProps } from "@ariakit/ui/ariakit/tooltip.react.tsx";
import { clsx } from "clsx";
import type { ReactElement, ReactNode } from "react";
import { getPortalRoot } from "../lib/get-portal-root.ts";

export interface TooltipProps extends Omit<
  UiTooltipProps,
  "title" | "children"
> {
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
    <TooltipProvider store={store} placement={placement} timeout={250}>
      <TooltipAnchor data-open={open || undefined} render={children} />
      <UiTooltip
        unmountOnHide
        portalElement={getPortalRoot}
        // The frame padding shrinks so the floating plus badge stays
        // concentric with the tooltip corner; the real padding comes from the
        // plain classes below.
        $p={plus ? 0.5 : undefined}
        {...props}
        className={clsx("max-w-80", plus && "p-1 px-2", props.className)}
      >
        {arrow && <TooltipArrow />}
        {plus ? (
          <>
            <div className="float-end -m-0.5 -me-1.5 ms-1.5 ak-layer ak-layer-primary ak-layer-mix-15 ak-frame ak-frame-full/px font-medium px-1 ak-frame-border ak-edge-primary ak-edge-20 border-dashed">
              <span className="ak-text ak-text-primary">Plus</span>
            </div>
            {title}
          </>
        ) : (
          title
        )}
      </UiTooltip>
    </TooltipProvider>
  );
}
