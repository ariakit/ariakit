import { Button } from "@ariakit/ui/components/button.ariakit.react";
import { Input } from "@ariakit/ui/components/input.ariakit.react";
import type { TableRows } from "@ariakit/ui/components/table.ariakit.react";
import { Table } from "@ariakit/ui/components/table.ariakit.react";
import { useState } from "react";
import MixedRowKeys from "./mixed-row-keys.react.tsx";

export default function Example() {
  const [added, setAdded] = useState(false);
  const [rows, setRows] = useState<TableRows<0 | "hours" | "notes">>([
    {
      // Zero is a stable key, including when the row moves away from index 0.
      key: 0,
      0: "Ada",
      hours: 12,
      notes: {
        children: <Input aria-label="Ada notes" defaultValue="Design review" />,
      },
    },
    {
      key: "grace",
      0: "Grace",
      hours: 7,
      notes: {
        children: <Input aria-label="Grace notes" defaultValue="Testing" />,
      },
    },
  ]);

  return (
    <div className="grid gap-4">
      <div className="flex gap-2">
        <Button onClick={() => setRows((rows) => rows.toReversed())}>
          Reverse rows
        </Button>
        <Button
          disabled={added}
          onClick={() => {
            setAdded(true);
            setRows((rows) => [
              {
                key: "katherine",
                0: "Katherine",
                // No hours have been recorded yet; the notes keep their column.
                notes: {
                  children: (
                    <Input aria-label="Katherine notes" defaultValue="" />
                  ),
                },
              },
              ...rows,
            ]);
          }}
        >
          Add contributor
        </Button>
      </div>
      <Table
        aria-label="Team hours"
        $border
        rows={[
          {
            key: "head",
            group: "head",
            0: "Contributor",
            hours: "Hours",
            notes: "Notes",
          },
          ...rows,
          {
            key: "total",
            group: "foot",
            0: { children: "Total", header: "row" },
            hours: 19,
            notes: null,
          },
        ]}
      />
      <MixedRowKeys />
    </div>
  );
}
