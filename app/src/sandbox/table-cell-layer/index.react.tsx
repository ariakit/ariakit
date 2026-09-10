import {
  Table,
  TableCell,
  TableRow,
  TableRowGroup,
} from "@ariakit/ui/components/table.ariakit.react";
import { useState } from "react";

export default function Example() {
  const [selected, setSelected] = useState(false);
  // The narrow container makes the pinned cell overlap the scrolling cells.
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
            {/* A modifier enables the layer unless it is explicitly false. */}
            <TableCell $lighten>Modified surface</TableCell>
            <TableCell $lighten $layer={false}>
              Disabled surface
            </TableCell>
          </TableRow>
        </TableRowGroup>
      </Table>
    </div>
  );
}
