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
import { Select, SelectItem } from "@ariakit/ui/ariakit/select.react.tsx";

const fruits = ["Apple", "Banana", "Cherry"];

export function CompareSelectLegacy() {
  return (
    <ak.SelectProvider defaultValue="Apple">
      {/* Children mirror the old wrapper structure; a childless ak.Select
          would also render Ariakit's built-in arrow next to the mask arrow */}
      <ak.Select className="ak-select ak-layer ak-layer-6 after:ak-select-arrow w-40">
        <span className="flex-1 text-start">
          <ak.SelectValue />
        </span>
      </ak.Select>
      <ak.SelectPopover
        gutter={8}
        shift={-3}
        className="ak-select-popover data-open:ak-select-popover_open not-data-open:ak-select-popover_closed origin-(--popover-transform-origin) w-40"
      >
        {fruits.map((fruit) => (
          <ak.SelectItem
            key={fruit}
            value={fruit}
            className="ak-select-item data-focus-visible:ak-select-item_focus before:ak-select-item-check"
          />
        ))}
      </ak.SelectPopover>
    </ak.SelectProvider>
  );
}

export function CompareSelectNew() {
  return (
    <Select
      defaultValue="Apple"
      className="w-40"
      popover={{ className: "w-40" }}
    >
      {fruits.map((fruit) => (
        <SelectItem key={fruit} value={fruit} />
      ))}
    </Select>
  );
}
