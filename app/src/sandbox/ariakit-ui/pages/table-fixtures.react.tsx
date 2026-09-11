/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { Badge, BadgeLabel } from "@ariakit/ui/components/badge.ariakit.react";
import { Button } from "@ariakit/ui/components/button.ariakit.react";
import { Input } from "@ariakit/ui/components/input.ariakit.react";
import type { TableRows } from "@ariakit/ui/components/table.ariakit.react";
import {
  Table,
  TableCell,
  TableRow,
  TableRowGroup,
} from "@ariakit/ui/components/table.ariakit.react";
import { useState } from "react";
import { Example, ExampleGrid } from "../example.react.tsx";

// Migrated from the table-cell-layer sandbox with the same markup and state.
function TableCellLayer() {
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

// Migrated from the table-rows sandbox with the same markup and state. The
// mixed-keys table that rendered below it is its own fixture now. The narrow
// container is new: the columns scroll under the pinned names, so the captures
// show whether the names stay pinned in the head, the body and the foot.
function TableRowsFixture() {
  const [pinned, setPinned] = useState(true);
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
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          tabIndex={0}
          checked={pinned}
          onChange={(event) => setPinned(event.target.checked)}
        />
        Pin contributor names
      </label>
      <Table
        aria-label="Team hours"
        $border
        className="min-w-[32rem]"
        container={{ $border: true, className: "max-w-80" }}
        rows={[
          {
            key: "head",
            group: "head",
            0: {
              children: "Contributor",
              $sticky: pinned ? "start" : undefined,
              $grow: true,
            },
            hours: (
              <TableCell numeric $fit>
                Hours
              </TableCell>
            ),
            notes: "Notes",
          },
          ...rows,
          {
            key: "total",
            group: "foot",
            // Align the total label toward the value beside it.
            0: { children: "Total", header: "row", numeric: true },
            hours: 19,
            notes: null,
          },
        ]}
      />
    </div>
  );
}

// Migrated from table-rows/mixed-row-keys.react.tsx with the same markup and
// state.
function MixedRowKeys() {
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

// Declarative values that are elements. A TableCell element is the cell itself;
// a Badge or a Button is the content of the cell its column renders, and must
// not land in the row beside the cells.
const elementValueRows: TableRows<"name" | "status" | "action"> = [
  {
    group: "head",
    name: "Name",
    status: "Status",
    action: { children: "Action", $fit: true },
  },
  {
    key: "ada",
    name: <TableCell header="row">Ada</TableCell>,
    status: (
      <Badge $layer="success">
        <BadgeLabel>Active</BadgeLabel>
      </Badge>
    ),
    action: <Button>Edit Ada</Button>,
  },
];

export function TableFixturesExamples() {
  return (
    <ExampleGrid>
      <Example
        title="Table cell layer"
        code={
          <Table $border>
            <TableRowGroup>
              <TableRow>
                <TableCell $sticky="start">Pinned name</TableCell>
                <TableCell>Row surface</TableCell>
                <TableCell $layer="brand">Custom surface</TableCell>
                <TableCell $lighten>Modified surface</TableCell>
                <TableCell $lighten $layer={false}>
                  Disabled surface
                </TableCell>
              </TableRow>
            </TableRowGroup>
          </Table>
        }
        wide
        stretch
      >
        <TableCellLayer />
      </Example>
      <Example
        title="Table rows"
        code={
          <>
            <Button>Reverse rows</Button>
            <Button>Add contributor</Button>
            <Table $border />
          </>
        }
        wide
        stretch
      >
        <TableRowsFixture />
      </Example>
      <Example
        title="Mixed row keys"
        code={
          <>
            <Button>Reverse task rows</Button>
            <Table />
          </>
        }
        wide
        stretch
      >
        <MixedRowKeys />
      </Example>
      <Example title="Element cell values" wide stretch>
        <Table
          aria-label="Element values"
          $border
          rows={elementValueRows}
          container={{ $border: true }}
        />
      </Example>
    </ExampleGrid>
  );
}

export default TableFixturesExamples;
