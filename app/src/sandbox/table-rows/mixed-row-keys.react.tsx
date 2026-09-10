import { Button } from "@ariakit/ui/components/button.ariakit.react";
import { Input } from "@ariakit/ui/components/input.ariakit.react";
import type { TableRows } from "@ariakit/ui/components/table.ariakit.react";
import { Table } from "@ariakit/ui/components/table.ariakit.react";
import { useState } from "react";

export default function MixedRowKeys() {
  const [rows, setRows] = useState<TableRows<"name" | "notes">>([
    {
      // A draft without an ID uses its position beside an identified record.
      name: "Draft task",
      notes: {
        children: <Input aria-label="Draft task notes" defaultValue="Draft" />,
      },
    },
    {
      key: 0,
      name: "Assigned task",
      notes: {
        children: (
          <Input aria-label="Assigned task notes" defaultValue="Assigned" />
        ),
      },
    },
  ]);
  return (
    <section className="grid gap-4">
      <Button onClick={() => setRows((rows) => rows.toReversed())}>
        Reverse task rows
      </Button>
      <Table aria-label="Task notes" rows={rows} />
    </section>
  );
}
