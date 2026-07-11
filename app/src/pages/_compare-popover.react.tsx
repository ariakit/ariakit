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
  Popover,
  PopoverArrow,
  PopoverDescription,
  PopoverDisclosure,
  PopoverHeading,
  PopoverProvider,
} from "@ariakit/ui/ariakit/popover.react.tsx";
import {
  Tooltip,
  TooltipAnchor,
  TooltipProvider,
} from "@ariakit/ui/ariakit/tooltip.react.tsx";
import { Button } from "@ariakit/ui/html/button.react.tsx";

export function ComparePopoverLegacy() {
  return (
    <ak.PopoverProvider>
      <ak.PopoverDisclosure className="ak-button ak-layer ak-layer-6">
        Accept invite
      </ak.PopoverDisclosure>
      <ak.Popover className="ak-popover data-open:ak-popover_open not-data-open:ak-popover_closed max-w-80 origin-(--popover-transform-origin) flex flex-col gap-2">
        <ak.PopoverArrow />
        <ak.PopoverHeading className="text-lg font-medium">
          Team meeting
        </ak.PopoverHeading>
        <ak.PopoverDescription className="ak-ink-80">
          We are going to discuss what we have achieved on the project.
        </ak.PopoverDescription>
      </ak.Popover>
    </ak.PopoverProvider>
  );
}

export function ComparePopoverNew() {
  return (
    <PopoverProvider>
      <PopoverDisclosure>Accept invite</PopoverDisclosure>
      <Popover className="max-w-80 flex flex-col gap-2">
        <PopoverArrow />
        <PopoverHeading>Team meeting</PopoverHeading>
        <PopoverDescription>
          We are going to discuss what we have achieved on the project.
        </PopoverDescription>
      </Popover>
    </PopoverProvider>
  );
}

export function CompareTooltipLegacy() {
  return (
    <ak.TooltipProvider>
      <ak.TooltipAnchor
        render={<button className="ak-button ak-layer ak-layer-6" />}
      >
        Hover me
      </ak.TooltipAnchor>
      <ak.Tooltip className="ak-tooltip data-open:ak-tooltip_open not-data-open:ak-tooltip_closed max-w-80 origin-(--popover-transform-origin)">
        Tooltip label
      </ak.Tooltip>
    </ak.TooltipProvider>
  );
}

export function CompareTooltipNew() {
  return (
    <TooltipProvider>
      <TooltipAnchor render={<Button />}>Hover me</TooltipAnchor>
      <Tooltip className="max-w-80">Tooltip label</Tooltip>
    </TooltipProvider>
  );
}
