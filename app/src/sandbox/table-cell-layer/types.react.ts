import type {
  Table,
  TableProps,
  TableRow,
  TableRows,
} from "@ariakit/ui/components/table.ariakit.react";
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
