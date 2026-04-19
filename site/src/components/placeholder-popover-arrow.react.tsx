/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { POPOVER_ARROW_PATH } from "@ariakit/react-core/popover/popover-arrow-path";
import { useId } from "react";

export interface PopupArrowProps {
  position: "top" | "right" | "bottom" | "left";
  size?: number;
}

export function PlaceholderPopoverArrow({
  position,
  size = 30,
}: PopupArrowProps) {
  const maskId = useId();
  const halfDefaultSize = 30 / 2;
  const rotateMap = {
    top: `rotate(180 ${halfDefaultSize} ${halfDefaultSize})`,
    right: `rotate(-90 ${halfDefaultSize} ${halfDefaultSize})`,
    bottom: `rotate(0 ${halfDefaultSize} ${halfDefaultSize})`,
    left: `rotate(90 ${halfDefaultSize} ${halfDefaultSize})`,
  };
  const transform = rotateMap[position];
  const strokeWidth = 2 * (30 / size);
  return (
    <div
      style={{ [position]: "100%", fontSize: size, strokeWidth }}
      className="size-[1em] absolute fill-(--ak-layer) stroke-(--ak-layer-border) left-1/2 -translate-x-1/2"
    >
      <svg display="block" viewBox="0 0 30 30">
        <g transform={transform}>
          <path fill="none" d={POPOVER_ARROW_PATH} mask={`url(#${maskId})`} />
          <path stroke="none" d={POPOVER_ARROW_PATH} />
          <mask id={maskId} maskUnits="userSpaceOnUse">
            <rect
              x="-15"
              y="0"
              width="60"
              height="30"
              fill="white"
              stroke="black"
            />
          </mask>
        </g>
      </svg>
    </div>
  );
}
