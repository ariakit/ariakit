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
import { Checkbox } from "@ariakit/ui/components/checkbox.ariakit.react.tsx";
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

type WideColumn =
  | ComponentColumn
  | "owner"
  | "package"
  | "coverage"
  | "updated"
  | "size"
  | "notes";

const wideHead: TableRows<WideColumn>[number] = {
  group: "head",
  component: "Component",
  status: "Status",
  variants: { children: "Variants", numeric: true },
  owner: "Owner",
  package: "Package",
  coverage: { children: "Coverage", numeric: true },
  updated: "Updated",
  size: { children: "Size", numeric: true },
  notes: "Notes",
};

const wideBody: TableRows<WideColumn> = [
  [
    "Button",
    "Covered",
    12,
    "Diego",
    "@ariakit/ui",
    "98%",
    "2026-08-30",
    "4.1 kB",
    "Bevel and flat kinds, all sizes",
  ],
  [
    "Checkbox",
    "Covered",
    7,
    "Diego",
    "@ariakit/ui",
    "96%",
    "2026-08-28",
    "2.3 kB",
    "Shares the choice mask with the radio",
  ],
  [
    "Disclosure",
    "Expanded",
    9,
    "Diego",
    "@ariakit/ui",
    "91%",
    "2026-09-02",
    "5.6 kB",
    "Guides, split layout, nested groups",
  ],
  [
    "Glider",
    "Expanded",
    6,
    "Diego",
    "@ariakit/ui",
    "88%",
    "2026-09-01",
    "3.0 kB",
    "Anchor positioned, hover and focus states",
  ],
  [
    "List",
    "Covered",
    11,
    "Diego",
    "@ariakit/ui",
    "97%",
    "2026-09-05",
    "6.2 kB",
    "Markers, guides and disclosure rows",
  ],
  [
    "Nav",
    "Covered",
    8,
    "Diego",
    "@ariakit/ui",
    "94%",
    "2026-09-04",
    "4.8 kB",
    "Collapses with the sidebar rail",
  ],
  [
    "Sidebar",
    "Expanded",
    5,
    "Diego",
    "@ariakit/ui",
    "90%",
    "2026-09-08",
    "3.4 kB",
    "Panel, disclosure or drawer by breakpoint",
  ],
  [
    "Table",
    "Covered",
    6,
    "Diego",
    "@ariakit/ui",
    "95%",
    "2026-09-08",
    "5.1 kB",
    "Border channels, sticky groups and cells",
  ],
  [
    "Tabs",
    "Expanded",
    8,
    "Diego",
    "@ariakit/ui",
    "89%",
    "2026-09-06",
    "7.7 kB",
    "Folder tabs with a scroll timeline",
  ],
  [
    "Tooltip",
    "Covered",
    4,
    "Diego",
    "@ariakit/ui",
    "99%",
    "2026-08-25",
    "1.9 kB",
    "Popover surface at a lighter shadow",
  ],
].map(
  ([
    component,
    status,
    variants,
    owner,
    pkg,
    coverage,
    updated,
    size,
    notes,
  ]) => ({
    component,
    status,
    variants,
    owner,
    package: pkg,
    coverage,
    updated,
    size,
    notes,
  }),
);

const wideRows: TableRows<WideColumn> = [wideHead, ...wideBody];

// The pin on the head cell reaches the whole column.
const pinnedRows: TableRows<WideColumn> = [
  { ...wideHead, component: { children: "Component", $sticky: "start" } },
  ...wideBody,
];

function DemoTable(props: TableProps<ComponentColumn>) {
  return <Table rows={componentRows} {...props} />;
}

interface ComponentEntry {
  component: string;
  status: string;
  variants: number;
}

const components: ComponentEntry[] = [
  { component: "Button", status: "Covered", variants: 12 },
  { component: "Glider", status: "Expanded", variants: 6 },
  { component: "Tabs", status: "Expanded", variants: 8 },
  { component: "Table", status: "Covered", variants: 5 },
];

const sortedRows: TableRows<ComponentColumn> = [
  {
    group: "head",
    component: { children: "Component", sort: "ascending" },
    status: { children: "Status", sort: "none" },
    variants: { children: "Variants", numeric: true, sort: "none" },
  },
  ...components,
];

const sortedByVariantsRows: TableRows<ComponentColumn> = [
  {
    group: "head",
    component: { children: "Component", sort: "none" },
    status: "Status",
    variants: { children: "Variants", numeric: true, sort: "descending" },
  },
  ...components,
];

interface StateTableProps extends TableProps<ComponentColumn> {
  /** Whether a checkbox column leads the rows. */
  checkboxes?: boolean;
  /** The indexes of the selected rows. */
  selected?: number[];
  /** The index of the row with keyboard focus. */
  focusedRow?: number;
  /** The row index and column of the cell with keyboard focus. */
  focusedCell?: [row: number, column: keyof ComponentEntry];
}

/**
 * The component table written out by hand, with its rows and cells in the
 * states the sample asks for. The focus attribute is the one Ariakit sets on a
 * focused element, so the static rows paint the real state.
 */
function StateTable({
  checkboxes,
  selected = [],
  focusedRow,
  focusedCell,
  ...props
}: StateTableProps) {
  const selectable = checkboxes || selected.length > 0;
  const isSelected = (index: number) => selected.includes(index);
  const isFocused = (index: number, column: keyof ComponentEntry) =>
    focusedCell?.[0] === index && focusedCell[1] === column;
  const allSelected = selected.length === components.length;
  return (
    <Table container={{ $border: true, $layer: true }} $borderBlock {...props}>
      <TableRowGroup group="head">
        <TableRow>
          {checkboxes && (
            <TableCell $fit>
              {/* The head is text-sm, so 1em would draw a smaller box than
                  the column's; a length keeps the select-all on its axis. */}
              <Checkbox
                aria-label="Select all rows"
                className="[--size:1rem]"
                checked={allSelected ? true : selected.length ? "mixed" : false}
              />
            </TableCell>
          )}
          <TableCell $grow={checkboxes}>Component</TableCell>
          <TableCell>Status</TableCell>
          <TableCell numeric>Variants</TableCell>
        </TableRow>
      </TableRowGroup>
      <TableRowGroup>
        {components.map((entry, index) => (
          <TableRow
            key={entry.component}
            selected={selectable ? isSelected(index) : undefined}
            data-focus-visible={focusedRow === index || undefined}
          >
            {checkboxes && (
              <TableCell $fit>
                <Checkbox
                  aria-label={`Select ${entry.component}`}
                  checked={isSelected(index)}
                />
              </TableCell>
            )}
            <TableCell
              header="row"
              data-focus-visible={isFocused(index, "component") || undefined}
            >
              {entry.component}
            </TableCell>
            <TableCell
              data-focus-visible={isFocused(index, "status") || undefined}
            >
              {entry.status}
            </TableCell>
            <TableCell
              numeric
              data-focus-visible={isFocused(index, "variants") || undefined}
            >
              {entry.variants}
            </TableCell>
          </TableRow>
        ))}
      </TableRowGroup>
    </Table>
  );
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
        title="Focus"
        code="TableCell data-focus-visible · TableRow data-focus-visible"
        description="Keyboard focus draws the brand ring inside a cell, which the arrow keys walk in a grid of cells, or around a row, which they walk in a grid of rows. At a table corner the ring follows the container's rounding. The attribute is the one Ariakit sets on a focused element, so the static samples paint the real state."
      >
        <div className="grid items-start gap-4 lg:grid-cols-2">
          <div className="grid gap-1">
            <Caption>Focused cell</Caption>
            <StateTable focusedCell={[1, "status"]} />
          </div>
          <div className="grid gap-1">
            <Caption>Focused row, at the table's corner</Caption>
            <StateTable focusedRow={3} />
          </div>
        </div>
      </Sample>

      <Sample
        wide
        title="Selected rows"
        code='Table role="grid" > TableRow selected · TableCell $fit > Checkbox · TableCell $grow'
        description="A selected row mixes the brand colour into its surface, on the layer channel, so the hover still steps on top of it: hover a selected row. The lines beside it keep the table's colour, as they do beside a hovered row. With a checkbox column, the head cell fits its select-all and one column takes the surplus width. Rows are selectable in a grid, so both tables take the grid role."
      >
        <div className="grid items-start gap-4 lg:grid-cols-2">
          <div className="grid gap-1">
            <Caption>With a checkbox column</Caption>
            <StateTable role="grid" checkboxes selected={[0, 2]} />
          </div>
          <div className="grid gap-1">
            <Caption>Without one, two rows in a run</Caption>
            <StateTable role="grid" selected={[1, 2]} />
          </div>
        </div>
      </Sample>

      <Sample
        wide
        title="Sortable headers"
        code='TableCell sort="ascending" · sort="none" · numeric sort="descending"'
        description="A sortable column header holds a button that covers the cell, with the label where a plain header puts it and the indicator after it: faint chevrons while the column is not sorted, an arrow once it is, turned around for a descending sort. In a numeric column the indicator leads, so the label stays on the digits. Hover or tab to a header to see it come up."
      >
        <div className="grid items-start gap-4 lg:grid-cols-2">
          <div className="grid gap-1">
            <Caption>Sorted by the first column</Caption>
            <Table
              rows={sortedRows}
              $borderBlock
              container={{ $border: true, $layer: true }}
            />
          </div>
          <div className="grid gap-1">
            <Caption>Sorted by a numeric column, descending</Caption>
            <Table
              rows={sortedByVariantsRows}
              $borderBlock
              container={{ $border: true, $layer: true }}
            />
          </div>
        </div>
      </Sample>

      <Sample
        wide
        title="Horizontal scroll"
        code='className="whitespace-nowrap" · head cell $sticky="start" · head={{ $sticky: "top" }}'
        description="Columns wider than the container scroll sideways inside it. The second table pins the column that names the rows: in declarative rows a $sticky on the head cell pins the whole column, and the head sticks to the top as well. Hover a row while it is scrolled."
      >
        <div className="grid items-start gap-4 lg:grid-cols-2">
          <div className="grid gap-1">
            <Caption>Scrolls sideways</Caption>
            <Table
              rows={wideRows}
              className="whitespace-nowrap"
              $borderBlock
              container={{ $border: true, $layer: true }}
            />
          </div>
          <div className="grid gap-1">
            <Caption>Pinned first column and sticky head</Caption>
            <Table
              rows={pinnedRows}
              className="whitespace-nowrap"
              $borderBlock
              head={{ $sticky: "top" }}
              container={{ $border: true, $layer: true, className: "max-h-64" }}
            />
          </div>
        </div>
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
