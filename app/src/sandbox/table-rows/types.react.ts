import type { TableRow } from "@ariakit/ui/components/table.ariakit.react";
import type { ReactElement } from "react";
import { expectTypeOf } from "vitest";

// https://github.com/ariakit/ariakit/pull/5240#discussion_r3974212082
expectTypeOf<{ key: 0; 0: string; hours: number }>().toExtend<
  TableRow<0 | "hours">
>();
expectTypeOf<{ key: string; name: string }>().toExtend<TableRow<"name">>();
expectTypeOf<{ key: { children: string } }>().not.toExtend<TableRow<"key">>();
expectTypeOf<{ key: ReactElement }>().not.toExtend<TableRow<"key">>();
