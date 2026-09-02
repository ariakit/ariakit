/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import {
  Badge,
  BadgeLabel,
} from "@ariakit/ui/components/badge.ariakit.react.tsx";
import { Layer } from "@ariakit/ui/components/layer.ariakit.react.tsx";
import type {
  TableProps,
  TableRows,
} from "@ariakit/ui/components/table.ariakit.react.tsx";
import {
  Table,
  TableCell,
  TableRow,
  TableRowGroup,
} from "@ariakit/ui/components/table.ariakit.react.tsx";
import { Caption, Sample, Samples } from "./gallery.react.tsx";

type ComponentColumn = "component" | "status" | "variants";

const componentRows: TableRows<ComponentColumn> = [
  {
    group: "head",
    component: "Component",
    status: "Status",
    variants: { children: "Variants", numeric: true },
  },
  { component: "Button", status: "Covered", variants: 12 },
  { component: "Glider", status: "Expanded", variants: 6 },
  { component: "Tabs", status: "Expanded", variants: 8 },
  { component: "Table", status: "Covered", variants: 5 },
  {
    group: "foot",
    component: { children: "Visible matrices", header: "row" },
    status: null,
    variants: 31,
  },
];

const manyRows: TableRows<ComponentColumn> = [
  {
    group: "head",
    component: "Component",
    status: "Status",
    variants: { children: "Variants", numeric: true },
  },
  ...Array.from({ length: 24 }, (_, index) => ({
    component: `Component ${index + 1}`,
    status: index % 3 === 0 ? "Expanded" : "Covered",
    variants: (index * 7) % 13,
  })),
  {
    group: "foot",
    component: { children: "Total", header: "row" },
    status: null,
    variants: 24,
  },
];

function DemoTable(props: TableProps<ComponentColumn>) {
  return <Table rows={componentRows} {...props} />;
}

export function TableSection() {
  return (
    <Samples columns="wide">
      <Sample
        title="Declarative rows"
        code="Table rows container={{ $border, $borderInset: 1, $layer }} $borderBlock"
        description="Head, body and foot rows from one array. The container draws the outer border and the cells draw the lines between rows."
      >
        <DemoTable
          container={{ $border: true, $borderInset: 1, $layer: true }}
          $borderBlock
        />
      </Sample>

      <Sample
        title="Composed parts"
        code='TableRowGroup group · TableRow · TableCell header="row" numeric'
        description="The same table written out by hand, with a badge in a cell and row headers in the first column."
      >
        <Table container={{ $border: true, $layer: true }} $borderBlock>
          <TableRowGroup group="head">
            <TableRow>
              <TableCell>Component</TableCell>
              <TableCell>Status</TableCell>
              <TableCell numeric>Variants</TableCell>
            </TableRow>
          </TableRowGroup>
          <TableRowGroup>
            <TableRow>
              <TableCell header="row">Button</TableCell>
              <TableCell>
                <Badge $layer="success">
                  <BadgeLabel>Covered</BadgeLabel>
                </Badge>
              </TableCell>
              <TableCell numeric>12</TableCell>
            </TableRow>
            <TableRow>
              <TableCell header="row">Glider</TableCell>
              <TableCell>
                <Badge $layer="warning">
                  <BadgeLabel>Expanded</BadgeLabel>
                </Badge>
              </TableCell>
              <TableCell numeric>6</TableCell>
            </TableRow>
            <TableRow>
              <TableCell header="row">Tabs</TableCell>
              <TableCell>
                <Badge $layer="brand">
                  <BadgeLabel>In review</BadgeLabel>
                </Badge>
              </TableCell>
              <TableCell numeric>8</TableCell>
            </TableRow>
          </TableRowGroup>
          <TableRowGroup group="foot">
            <TableRow>
              <TableCell header="row" colSpan={2}>
                Visible matrices
              </TableCell>
              <TableCell numeric>26</TableCell>
            </TableRow>
          </TableRowGroup>
        </Table>
      </Sample>

      <Sample
        wide
        title="Borders"
        code="$border · $borderBlock · $borderInline · $borderInset · container $border={2}"
        description="Cell borders are inherited channels, so one prop on the table reaches every cell. The inset pulls the column dividers back from the row edges."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="grid gap-1">
            <Caption>All cell borders</Caption>
            <DemoTable $border container={{ $border: true }} />
          </div>
          <div className="grid gap-1">
            <Caption>Column dividers only, inset</Caption>
            <DemoTable
              $borderInline
              $borderInset={2}
              container={{ $border: true }}
            />
          </div>
          <div className="grid gap-1">
            <Caption>No cell borders, 2px container</Caption>
            <DemoTable container={{ $border: 2, $layer: true }} />
          </div>
          <div className="grid gap-1">
            <Caption>Row borders, no container border</Caption>
            <DemoTable $borderBlock />
          </div>
        </div>
      </Sample>

      <Sample
        title="Sticky head and foot"
        code='container={{ className: "max-h-64" }} head={{ $sticky: "top" }} foot={{ $sticky: "bottom" }}'
        description="The row groups stick to the scroller's edges. Scroll the table to check the bands."
      >
        <Table
          rows={manyRows}
          // The scroller inherits its cap from the container.
          container={{ $border: true, $layer: true, className: "max-h-64" }}
          head={{ $sticky: "top" }}
          foot={{ $sticky: "bottom", $lightnessOffset: 0.5 }}
          $borderBlock
        />
      </Sample>

      <Sample
        wide
        title="Density"
        code="$p={1} · $p={5} · $px={6} $py={1}"
        description="The cell padding goes through the frame's registered channel, so every cell takes the same length. Per-axis channels resolve in each cell."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <DemoTable
            $p={1}
            $borderBlock
            container={{ $border: true, $layer: true }}
          />
          <DemoTable
            $p={5}
            $borderBlock
            container={{ $border: true, $layer: true }}
          />
          <DemoTable
            $px={6}
            $py={1}
            $borderBlock
            container={{ $border: true, $layer: true }}
          />
          <DemoTable
            $borderBlock
            container={{ $border: true, $layer: true, $rounded: "none" }}
            className="text-sm"
          />
        </div>
      </Sample>

      <Sample
        wide
        title="Rows and head"
        code="row={{ $hover: false }} · head={{ $layer: 'brand' }} · head={{ $lightnessOffset: 2 }}"
        description="Body rows tint on hover unless told not to. The head band is a layer of its own."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <DemoTable
            row={{ $hover: false }}
            $borderBlock
            container={{ $border: true, $layer: true }}
          />
          <DemoTable
            head={{ $layer: "brand" }}
            $borderBlock
            container={{ $border: true, $layer: true }}
          />
          <DemoTable
            head={{ $lightnessOffset: 2 }}
            foot={{ $lightnessOffset: 2 }}
            $borderBlock
            container={{ $border: true, $layer: true, $rounded: "2xl" }}
          />
          <DemoTable
            row={{ $hoverOffset: 2 }}
            $border
            $borderInset={1}
            container={{ $border: true, $layer: true, $edge: "brand" }}
          />
        </div>
      </Sample>

      <Sample
        wide
        title="On layers"
        code="Table inside Layer"
        description="The container, the bands and the grid lines read the surface around them."
      >
        <div className="grid gap-3 lg:grid-cols-2">
          <Layer $invert className="grid gap-2 rounded-xl p-4">
            <Caption>Inverted</Caption>
            <DemoTable
              $borderBlock
              container={{ $border: true, $layer: true }}
            />
          </Layer>
          <Layer $layer="brand" className="grid gap-2 rounded-xl p-4">
            <Caption>Brand</Caption>
            <DemoTable
              $borderBlock
              container={{ $border: true, $layer: true }}
            />
          </Layer>
        </div>
      </Sample>
    </Samples>
  );
}
