// Type contracts of the declarative Table rows, migrated from the
// table-cell-layer and table-rows sandboxes. pnpm tsc checks this file; it
// renders nothing.
import type {
  Table,
  TableProps,
  TableRow,
  TableRows,
} from "@ariakit/ui/components/table.ariakit.react";
import type { ReactElement } from "react";
import { expectTypeOf } from "vitest";

// https://github.com/ariakit/ariakit/pull/5240#discussion_r3974019393
expectTypeOf<{ name: string; 0: number }>().toExtend<TableRow<"name" | 0>>();
expectTypeOf<TableProps<"name" | 0>["rows"]>().toEqualTypeOf<
  TableRows<"name" | 0> | undefined
>();
// @ts-expect-error Symbol keys are not enumerated as table columns.
expectTypeOf<TableRow<symbol>>();
// @ts-expect-error Symbol keys are not enumerated as table columns.
expectTypeOf<TableRows<symbol>>();
// @ts-expect-error Symbol keys are not enumerated as table columns.
expectTypeOf<TableProps<symbol>>();
// @ts-expect-error Symbol keys are not enumerated as table columns.
expectTypeOf<typeof Table<symbol>>();

// https://github.com/ariakit/ariakit/pull/5240#discussion_r3974212082
expectTypeOf<{ key: 0; 0: string; hours: number }>().toExtend<
  TableRow<0 | "hours">
>();
expectTypeOf<{ key: string; name: string }>().toExtend<TableRow<"name">>();
expectTypeOf<{ key: { children: string } }>().not.toExtend<TableRow<"key">>();
expectTypeOf<{ key: ReactElement }>().not.toExtend<TableRow<"key">>();
