/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */

import { Table } from "@ariakit/ui/ariakit/table.react.tsx";
import { Table as LegacyTable } from "#app/examples/_lib/ariakit/table.react.tsx";

const rows = [
  {
    group: "head" as const,
    item: "Item",
    price: { children: "Price", numeric: true },
  },
  { item: "Compass", price: 24 },
  { item: "Lantern", price: 39 },
  { item: "Rope (30 m)", price: 55 },
  { group: "foot" as const, item: "Total", price: 118 },
];

export function CompareTableLegacy() {
  return (
    <div className="flex flex-col gap-8 w-full">
      <LegacyTable<"item" | "price">
        className="ak-table-border-y"
        rows={rows}
      />
      <LegacyTable<"item" | "price">
        className="ak-table-border-y ak-table-px-6"
        container={{ className: "rounded-none ak-table-border-t" }}
        rows={rows.slice(0, 4)}
      />
    </div>
  );
}

export function CompareTableNew() {
  return (
    <div className="flex flex-col gap-8 w-full">
      <Table<"item" | "price"> $border="y" rows={rows} />
      <Table<"item" | "price">
        $border="y"
        $px={6}
        container={{ className: "rounded-none", $border: "t" }}
        rows={rows.slice(0, 4)}
      />
    </div>
  );
}
