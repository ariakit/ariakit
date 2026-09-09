import {
  Table,
  TableCell,
  TableRow,
  TableRowGroup,
} from "@ariakit/ui/components/table.ariakit.react";
import { useState } from "react";

export default function Example() {
  const [selected, setSelected] = useState(false);
  return (
    <div className="grid gap-4">
      <label>
        <input
          type="checkbox"
          checked={selected}
          onChange={(event) => setSelected(event.target.checked)}
        />
        Select row
      </label>
      <Table
        role="grid"
        $border
        className="min-w-[40rem]"
        container={{ $border: true, className: "max-w-80" }}
      >
        <TableRowGroup>
          <TableRow selected={selected}>
            <TableCell $sticky="start">Pinned name</TableCell>
            <TableCell>Row surface</TableCell>
            <TableCell $layer="brand">Custom surface</TableCell>
          </TableRow>
        </TableRowGroup>
      </Table>
    </div>
  );
}
