/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import * as ak from "@ariakit/react";
import { Badge, BadgeLabel } from "@ariakit/ui/components/badge.ariakit.react";
import {
  Button,
  ButtonSlot,
} from "@ariakit/ui/components/button.ariakit.react";
import { Checkbox } from "@ariakit/ui/components/checkbox.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import { Input } from "@ariakit/ui/components/input.ariakit.react";
import type { TableRows } from "@ariakit/ui/components/table.ariakit.react";
import {
  Table,
  TableCaption,
  TableCell,
  TableRow,
  TableRowGroup,
} from "@ariakit/ui/components/table.ariakit.react";
import { Pencil } from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";
import {
  Example,
  ExampleGrid,
} from "#app/components/ariakit-ui-example.react.tsx";

// Migrated from the table-cell-layer sandbox with the same markup and state.
function TableCellLayer({ colored = false }: { colored?: boolean }) {
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
        container={{
          $border: true,
          $edge: colored ? "brand" : undefined,
          $edgeWeight: colored ? "bold" : undefined,
          className: "max-w-80",
        }}
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

type ComponentColumn = "component" | "status" | "variants";

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

function sumVariants(entries: readonly ComponentEntry[]) {
  return entries.reduce((total, entry) => total + entry.variants, 0);
}

const componentHead = {
  group: "head",
  component: "Component",
  status: "Status",
  variants: { children: "Variants", numeric: true },
} satisfies TableRows<ComponentColumn>[number];

// Head, body and foot rows from one array. The foot total is the sum of the
// body's variants column.
const componentRows: TableRows<ComponentColumn> = [
  componentHead,
  ...components,
  {
    group: "foot",
    component: { children: "Total", header: "row" },
    status: null,
    variants: sumVariants(components),
  },
];

// Every @ariakit/ui component module, so the capped scroller has real rows to
// scroll through.
const allComponents: ComponentEntry[] = [
  { component: "Badge", status: "Covered", variants: 5 },
  { component: "Button", status: "Covered", variants: 12 },
  { component: "Checkbox", status: "Covered", variants: 7 },
  { component: "Code", status: "Covered", variants: 3 },
  { component: "Combobox", status: "Expanded", variants: 9 },
  { component: "Dialog", status: "Covered", variants: 6 },
  { component: "Disclosure", status: "Expanded", variants: 9 },
  { component: "Frame", status: "Covered", variants: 8 },
  { component: "Heading", status: "Covered", variants: 2 },
  { component: "Input", status: "Covered", variants: 5 },
  { component: "Kbd", status: "Covered", variants: 2 },
  { component: "Layer", status: "Covered", variants: 10 },
  { component: "Link", status: "Covered", variants: 3 },
  { component: "List", status: "Expanded", variants: 11 },
  { component: "Nav", status: "Covered", variants: 8 },
  { component: "Option", status: "Covered", variants: 4 },
  { component: "Popover", status: "Covered", variants: 4 },
  { component: "Progress", status: "Expanded", variants: 5 },
  { component: "Prose", status: "Covered", variants: 2 },
  { component: "Radio", status: "Covered", variants: 6 },
  { component: "Separator", status: "Covered", variants: 4 },
  { component: "Table", status: "Covered", variants: 6 },
  { component: "Tabs", status: "Expanded", variants: 8 },
  { component: "Text", status: "Covered", variants: 5 },
  { component: "Tooltip", status: "Covered", variants: 3 },
];

const allComponentRows: TableRows<ComponentColumn> = [
  componentHead,
  ...allComponents,
  {
    group: "foot",
    component: { children: "Total", header: "row" },
    status: null,
    variants: sumVariants(allComponents),
  },
];

type DetailColumn =
  | ComponentColumn
  | "owner"
  | "package"
  | "coverage"
  | "updated"
  | "size"
  | "notes";

interface ComponentDetails extends ComponentEntry {
  owner: string;
  package: string;
  coverage: string;
  updated: string;
  size: string;
  notes: string;
}

const componentDetails: ComponentDetails[] = [
  {
    component: "Button",
    status: "Covered",
    variants: 12,
    owner: "Diego",
    package: "@ariakit/ui",
    coverage: "98%",
    updated: "2026-08-30",
    size: "4.1 kB",
    notes: "Bevel and flat kinds, all sizes",
  },
  {
    component: "Checkbox",
    status: "Covered",
    variants: 7,
    owner: "Diego",
    package: "@ariakit/ui",
    coverage: "96%",
    updated: "2026-08-28",
    size: "2.3 kB",
    notes: "Shares the choice mask with the radio",
  },
  {
    component: "Disclosure",
    status: "Expanded",
    variants: 9,
    owner: "Diego",
    package: "@ariakit/ui",
    coverage: "91%",
    updated: "2026-09-02",
    size: "5.6 kB",
    notes: "Guides, split layout, nested groups",
  },
  {
    component: "Glider",
    status: "Expanded",
    variants: 6,
    owner: "Diego",
    package: "@ariakit/ui",
    coverage: "88%",
    updated: "2026-09-01",
    size: "3.0 kB",
    notes: "Anchor positioned, hover and focus states",
  },
  {
    component: "List",
    status: "Covered",
    variants: 11,
    owner: "Diego",
    package: "@ariakit/ui",
    coverage: "97%",
    updated: "2026-09-05",
    size: "6.2 kB",
    notes: "Markers, guides and disclosure rows",
  },
  {
    component: "Nav",
    status: "Covered",
    variants: 8,
    owner: "Diego",
    package: "@ariakit/ui",
    coverage: "94%",
    updated: "2026-09-04",
    size: "4.8 kB",
    notes: "Current page links and collapsible groups",
  },
  {
    component: "Table",
    status: "Covered",
    variants: 6,
    owner: "Diego",
    package: "@ariakit/ui",
    coverage: "95%",
    updated: "2026-09-08",
    size: "5.1 kB",
    notes: "Border channels, sticky groups and cells",
  },
  {
    component: "Tabs",
    status: "Expanded",
    variants: 8,
    owner: "Diego",
    package: "@ariakit/ui",
    coverage: "89%",
    updated: "2026-09-06",
    size: "7.7 kB",
    notes: "Folder tabs with a scroll timeline",
  },
  {
    component: "Tooltip",
    status: "Covered",
    variants: 4,
    owner: "Diego",
    package: "@ariakit/ui",
    coverage: "99%",
    updated: "2026-08-25",
    size: "1.9 kB",
    notes: "Popover surface at a lighter shadow",
  },
];

// A $sticky on a head cell pins its whole column, and the head sticks to the
// top as well. All nine columns are needed for the table to overflow the box.
const pinnedStartRows: TableRows<DetailColumn> = [
  {
    group: "head",
    component: { children: "Component", $sticky: "start" },
    status: "Status",
    variants: { children: "Variants", numeric: true },
    owner: "Owner",
    package: "Package",
    coverage: { children: "Coverage", numeric: true },
    updated: "Updated",
    size: { children: "Size", numeric: true },
    notes: "Notes",
  },
  ...componentDetails,
];

type ActionColumn =
  | ComponentColumn
  | "package"
  | "updated"
  | "notes"
  | "actions";

// An element other than a TableCell is the cell's content, so the Button goes
// in the pinned cell rather than replacing it.
const pinnedEndRows: TableRows<ActionColumn> = [
  {
    group: "head",
    component: "Component",
    status: "Status",
    variants: { children: "Variants", numeric: true },
    package: "Package",
    updated: "Updated",
    notes: "Notes",
    actions: { children: "Actions", $sticky: "end", $fit: true },
  },
  ...componentDetails.slice(0, 5).map((entry) => ({
    component: entry.component,
    status: entry.status,
    variants: entry.variants,
    package: entry.package,
    updated: entry.updated,
    notes: entry.notes,
    actions: (
      <Button aria-label={`Edit ${entry.component}`} $p={1}>
        <ButtonSlot>
          <Pencil />
        </ButtonSlot>
      </Button>
    ),
  })),
];

const sortedByNameRows: TableRows<ComponentColumn> = [
  {
    group: "head",
    component: {
      children: "Component",
      sort: "ascending",
    },
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

type ReviewColumn = "reviewer" | "hours" | "notes";

const reviewRows: TableRows<ReviewColumn> = [
  {
    group: "head",
    reviewer: { children: "Reviewer", $grow: true },
    // A TableCell element is the cell itself, and its column props reach the
    // whole column.
    hours: (
      <TableCell numeric $fit>
        Hours
      </TableCell>
    ),
    notes: "Notes",
  },
  {
    key: "linus",
    reviewer: "Linus",
    hours: 5,
    notes: <Input aria-label="Linus notes" defaultValue="API review" />,
  },
  {
    key: "margaret",
    reviewer: "Margaret",
    hours: 3,
    notes: <Input aria-label="Margaret notes" defaultValue="Docs" />,
  },
  {
    group: "foot",
    // A numeric row header lines the label up with the total beside it.
    reviewer: { children: "Total", header: "row", numeric: true },
    hours: 8,
    notes: null,
  },
];

// An element other than a TableCell is the content of its column's cell.
const statusRows: TableRows<"component" | "status"> = [
  { group: "head", component: "Component", status: "Status" },
  {
    key: "button",
    component: "Button",
    status: (
      <Badge $layer="success">
        <BadgeLabel>Covered</BadgeLabel>
      </Badge>
    ),
  },
  {
    key: "tabs",
    component: "Tabs",
    status: (
      <Badge $layer="warning">
        <BadgeLabel>Partial</BadgeLabel>
      </Badge>
    ),
  },
];

interface PreScrolledProps {
  left: number;
  top: number;
  children?: ReactNode;
}

/**
 * Scrolls the table inside it once it mounts, so the screenshot shows a pinned
 * column and a sticky head over the content that scrolled under them. At zero
 * offsets a pinned table looks like any other.
 */
function PreScrolled({ left, top, children }: PreScrolledProps) {
  // A ref on this wrapper rather than on the scroller part, which is a plain
  // function component.
  const ref = (element: HTMLDivElement | null) => {
    const scroller = element?.querySelector("table")?.parentElement;
    if (!scroller) return;
    scroller.scrollLeft = left;
    scroller.scrollTop = top;
  };
  return (
    <div ref={ref} className="min-w-0">
      {children}
    </div>
  );
}

/**
 * A grid whose cells are the focus stops: the arrow keys walk the cells and the
 * checkboxes toggle the selection. The selection starts on two adjacent rows so
 * the page renders the same state every time.
 */
function SelectedRowsGrid() {
  const [selected, setSelected] = useState(["Glider", "Tabs"]);
  const allSelected = selected.length === components.length;
  const toggle = (name: string, checked: boolean) => {
    setSelected((current) => {
      const others = current.filter((entry) => entry !== name);
      if (!checked) return others;
      return [...others, name];
    });
  };
  return (
    <ak.CompositeProvider>
      <ak.Composite
        role="grid"
        render={
          <Table aria-label="Select components" container={{ $border: true }} />
        }
      >
        <TableRowGroup group="head">
          <ak.CompositeRow render={<TableRow />}>
            <TableCell $fit>
              <ak.CompositeItem
                render={
                  <Checkbox
                    aria-label="Select all rows"
                    checked={
                      allSelected ? true : selected.length ? "mixed" : false
                    }
                    onChange={(event) => {
                      const { checked } = event.currentTarget;
                      setSelected(
                        checked
                          ? components.map((entry) => entry.component)
                          : [],
                      );
                    }}
                  />
                }
              />
            </TableCell>
            <ak.CompositeItem render={<TableCell $grow />}>
              Component
            </ak.CompositeItem>
            <ak.CompositeItem render={<TableCell />}>Status</ak.CompositeItem>
            <ak.CompositeItem render={<TableCell numeric />}>
              Variants
            </ak.CompositeItem>
          </ak.CompositeRow>
        </TableRowGroup>
        <TableRowGroup>
          {components.map((entry) => {
            const isSelected = selected.includes(entry.component);
            return (
              <ak.CompositeRow
                key={entry.component}
                render={<TableRow selected={isSelected} />}
              >
                <TableCell $fit>
                  <ak.CompositeItem
                    render={
                      <Checkbox
                        aria-label={`Select ${entry.component}`}
                        checked={isSelected}
                        onChange={(event) => {
                          toggle(entry.component, event.currentTarget.checked);
                        }}
                      />
                    }
                  />
                </TableCell>
                <ak.CompositeItem render={<TableCell header="row" />}>
                  {entry.component}
                </ak.CompositeItem>
                <ak.CompositeItem render={<TableCell />}>
                  {entry.status}
                </ak.CompositeItem>
                <ak.CompositeItem render={<TableCell numeric />}>
                  {entry.variants}
                </ak.CompositeItem>
              </ak.CompositeRow>
            );
          })}
        </TableRowGroup>
      </ak.Composite>
    </ak.CompositeProvider>
  );
}

function CellEdgeOverride() {
  const [border, setBorder] = useState(true);
  return (
    <div className="grid gap-3">
      <label className="flex items-center gap-2">
        <Checkbox
          checked={border}
          onChange={(event) => setBorder(event.currentTarget.checked)}
        />
        Show all borders on Failed cells
      </label>
      {[false, true].map((colored) => (
        <Table
          key={`${colored}`}
          aria-label={colored ? "Colored cell edges" : "Plain cell edges"}
          container={{
            $border: true,
            $edge: colored ? "brand" : undefined,
            $edgeWeight: colored ? "bold" : undefined,
          }}
          rows={[
            { group: "head", status: "Status", note: "Note" },
            {
              status: (
                <TableCell
                  $edge="danger"
                  $edgeRaw
                  $border={border ? undefined : false}
                  tabIndex={0}
                >
                  <span className="text-danger">Failed</span>
                </TableCell>
              ),
              note: <TableCell $border>Needs review</TableCell>,
            },
            {
              status: (
                <TableCell
                  $edge="warning"
                  $edgeRaw
                  $border={2}
                  $focus={false}
                  tabIndex={0}
                >
                  Warning
                </TableCell>
              ),
              note: "Check details",
            },
            {
              status: "Pending",
              note: <TableCell $edgeWeight="bold">Ready to test</TableCell>,
            },
          ]}
        />
      ))}
    </div>
  );
}

function CaptionOptions() {
  const [format, setFormat] = useState("Props");
  const captions = [
    { name: "Text", caption: "Component inventory" },
    {
      name: "Props",
      caption: {
        children: <strong>Component inventory</strong>,
        $text: "brand",
      },
    },
    {
      name: "Element",
      caption: <TableCaption>Component inventory</TableCaption>,
    },
    { name: "Zero", caption: 0 },
    { name: "Hidden", caption: false },
  ];
  const caption = captions.find(({ name }) => name === format)?.caption;
  return (
    <div className="grid gap-3">
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Caption format"
      >
        {captions.map(({ name }) => (
          <Button
            key={name}
            $size="sm"
            $p={1}
            aria-pressed={format === name}
            onClick={() => setFormat(name)}
          >
            {name}
          </Button>
        ))}
      </div>
      <Table
        caption={caption}
        container={{ $border: true }}
        $p={2}
        rows={[{ component: "Button", status: "Covered" }]}
      >
        <TableRow>
          <TableCell>Tabs</TableCell>
          <TableCell>Expanded</TableCell>
        </TableRow>
      </Table>
    </div>
  );
}

export default function TableExamples() {
  return (
    <ExampleGrid>
      <Example
        title="Declarative rows"
        description="Head, body and foot rows come from one array. A head cell sets the format of its whole column."
        stretch
        code={`
          <Table caption="Component coverage" rows={[…]} container={{ $border: true }} />
        `}
      >
        <Table
          caption="Component coverage"
          rows={componentRows}
          container={{ $border: true }}
        />
      </Example>

      <Example
        title="Composed parts"
        description="A table written out by hand, with row headers, badges in cells and a foot cell that spans two columns."
        stretch
        code={`
          <Table caption="Component review" container={{ $border: true }}>
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
                <TableCell header="row">Total</TableCell>
                <TableCell numeric>26</TableCell>
              </TableRow>
            </TableRowGroup>
          </Table>
        `}
      >
        <Table caption="Component review" container={{ $border: true }}>
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
                Total
              </TableCell>
              <TableCell numeric>26</TableCell>
            </TableRow>
          </TableRowGroup>
        </Table>
      </Example>

      <Example
        title="Elements as cell content"
        description="A value in declarative rows can be an element. A badge goes inside the cell of its column, like any other content."

        stretch
        code={`
          <Table container={{ $border: true }}>
            <TableRowGroup group="head">
              <TableRow>
                <TableCell>Component</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableRowGroup>
            <TableRowGroup>
              <TableRow>
                <TableCell>Button</TableCell>
                <TableCell>
                  <Badge $layer="success">
                    <BadgeLabel>Covered</BadgeLabel>
                  </Badge>
                </TableCell>
              </TableRow>
            </TableRowGroup>
          </Table>
        `}
      >
        <Table
          aria-label="Component status"
          rows={statusRows}
          container={{ $border: true }}
        />
      </Example>

      <Example
        title="Inputs in cells"
        description="A cell element in the head sets its whole column. Each row has a key, so its input stays with it when the rows change."

        stretch
        code={`
          <Table container={{ $border: true }}>
            <TableRowGroup group="head">
              <TableRow>
                <TableCell $grow>Reviewer</TableCell>
                <TableCell numeric $fit>Hours</TableCell>
                <TableCell>Notes</TableCell>
              </TableRow>
            </TableRowGroup>
            <TableRowGroup>
              <TableRow>
                <TableCell $grow>Linus</TableCell>
                <TableCell numeric $fit>5</TableCell>
                <TableCell>
                  <Input />
                </TableCell>
              </TableRow>
            </TableRowGroup>
            <TableRowGroup group="foot">
              <TableRow>
                <TableCell header="row" numeric $grow>Total</TableCell>
                <TableCell numeric $fit>8</TableCell>
                <TableCell />
              </TableRow>
            </TableRowGroup>
          </Table>
        `}
      >
        <Table
          aria-label="Review notes"
          rows={reviewRows}
          container={{ $border: true }}
        />
      </Example>

      <Example
        title="Outer border with row lines"
        description="The container draws its outer border and the lines between rows, but no lines between columns."
        stretch
        code={`
          <Table rows={[…]} container={{ $border: true }} $borderInline={false} />
        `}
      >
        <Table
          aria-label="Component coverage"
          rows={componentRows}
          container={{ $border: true }}
          $borderInline={false}
        />
      </Example>

      <Example
        title="Brand grid lines"
        description="The container's edge color and weight reach the lines between cells. Hover a row to see its tint behind the lines."
        stretch
        code={`
          <Table rows={[…]} container={{ $border: true, $edge: "brand", $edgeWeight: "bold" }} />
        `}
      >
        <Table
          aria-label="Brand component coverage"
          rows={componentRows}
          container={{ $border: true, $edge: "brand", $edgeWeight: "bold" }}
        />
      </Example>

      <Example
        title="Grid edge override"
        description="The table sets the grid color and opacity while the container keeps its brand border."
        stretch
        code={`
          <Table rows={[…]} $edge="danger" $edgeWeight={25} container={{ $border: true, $edge: "brand", $edgeWeight: "bold" }} />
        `}
      >
        <Table
          aria-label="Review grid edges"
          rows={componentRows}
          $edge="danger"
          $edgeWeight={25}
          container={{ $border: true, $edge: "brand", $edgeWeight: "bold" }}
        />
      </Example>

      <Example
        title="Cell edge override"
        description="Cell edge variants show all four borders automatically. Set $border to false for grid lines only, true for a full border, or a number for its width."
        stretch
        code={`
          <TableCell $edge="danger" $edgeRaw>Failed</TableCell>
          <TableCell $edge="danger" $edgeRaw $border={false}>Grid lines only</TableCell>
        `}
      >
        <CellEdgeOverride />
      </Example>

      <Example
        title="Caption options"
        description="A caption gives the table a visible native name. Pass text, props for rich content, or a TableCaption element."
        stretch
        code={`
          <Table caption={{ children: <strong>Component inventory</strong>, $text: "brand" }} rows={[…]} />
        `}
      >
        <CaptionOptions />
      </Example>

      <Example
        title="Header control sizes"
        description="Choices in a smaller head label keep the table's size. An explicit slot size or button size still applies."
        stretch
        code={`
          <Table className="text-xl" rows={[…]} />
        `}
      >
        <Table
          aria-label="Large table controls"
          className="text-xl"
          container={{ $border: true }}
          rows={[
            {
              group: "head",
              choice: <Checkbox aria-label="Header choice" />,
              small: <Checkbox $size="sm" aria-label="Small header choice" />,
              action: (
                <Button $size="xs">
                  <ButtonSlot>
                    <Pencil />
                  </ButtonSlot>
                  Edit header
                </Button>
              ),
            },
            {
              choice: <Checkbox aria-label="Body choice" />,
              small: <Checkbox $size="sm" aria-label="Small body choice" />,
              action: (
                <Button $size="xs">
                  <ButtonSlot>
                    <Pencil />
                  </ButtonSlot>
                  Edit row
                </Button>
              ),
            },
          ]}
        />
      </Example>

      <Example
        title="Nested table edges"
        description="A table inside a colored grid starts with its own edge color and weight."
        stretch
        code={`
          <Table container={{ $border: true, $edge: "brand", $edgeWeight: "bold" }}>
            <TableRowGroup><TableRow><TableCell>
              <Table rows={[…]} container={{ $border: true }} />
            </TableCell></TableRow></TableRowGroup>
          </Table>
        `}
      >
        <Table
          aria-label="Project groups"
          container={{ $border: true, $edge: "brand", $edgeWeight: "bold" }}
          rows={[
            { group: "head", project: "Project", components: "Components" },
            {
              project: "Website",
              components: (
                <Table
                  aria-label="Nested component coverage"
                  rows={[
                    ...statusRows,
                    {
                      group: "foot",
                      component: "Total",
                      status: "2 components",
                    },
                  ]}
                  container={{ $border: true }}
                />
              ),
            },
          ]}
        />
      </Example>

      <Example
        title="Colored cell layers"
        description="Grid lines keep the requested edge through cells with a custom or disabled layer, including selected and hovered rows."
        stretch
        code={`
          <Table container={{ $border: true, $edge: "brand", $edgeWeight: "bold" }}>
            <TableRowGroup><TableRow><TableCell $layer={false}>Row surface</TableCell></TableRow></TableRowGroup>
          </Table>
        `}
      >
        <TableCellLayer colored />
      </Example>

      <Example
        title="Row lines only"
        description="Only the lines between rows, with no outer border, for a table that sits flush on its surface."
        stretch
        code={`
          <Table rows={[…]} $borderBlock />
        `}
      >
        <Table
          aria-label="Component coverage"
          rows={componentRows}
          $borderBlock
        />
      </Example>

      <Example
        title="Outer border only"
        description="A thicker outer border and no lines inside the table."
        stretch
        code={`
          <Table rows={[…]} container={{ $border: 2 }} $border={false} />
        `}
      >
        <Table
          aria-label="Component coverage"
          rows={componentRows}
          container={{ $border: 2 }}
          $border={false}
        />
      </Example>

      <Example
        title="Inset column dividers"
        description="The lines between columns stop short of the lines between rows, so each one reads as a separate stroke."
        stretch
        code={`
          <Table rows={[…]} container={{ $border: true }} $borderInset={2} />
        `}
      >
        <Table
          aria-label="Component coverage"
          rows={componentRows}
          container={{ $border: true }}
          $borderInset={2}
        />
      </Example>

      <Example
        title="Brand head"
        description="The head band is a surface of its own, so a color on it tints only the head."
        stretch
        code={`
          <Table rows={[…]} container={{ $border: true }} head={{ $layer: "brand" }} />
        `}
      >
        <Table
          aria-label="Component coverage"
          rows={componentRows}
          container={{ $border: true }}
          head={{ $layer: "brand" }}
        />
      </Example>

      <Example
        title="Sticky head and foot"
        description="In a scroller with a height cap, the head stays at the top and the foot at the bottom while the rows scroll under them."
        stretch
        code={`
          <Table rows={[…]} container={{ $border: true }} head={{ $sticky: "top" }} foot={{ $sticky: "bottom", $lightnessOffset: 0.5 }} />
        `}
      >
        <Table
          aria-label="All components"
          rows={allComponentRows}
          // The scroller inherits its height cap from the container.
          container={{ $border: true, className: "max-h-64" }}
          head={{ $sticky: "top" }}
          foot={{ $sticky: "bottom", $lightnessOffset: 0.5 }}
        />
      </Example>

      <Example
        title="Pinned first column"
        description="A wide table scrolls sideways under a pinned first column and a sticky head. It starts scrolled, so the rows pass under both."

        wide
        stretch
        code={`
          <Table container={{ $border: true }}>
            <TableRowGroup group="head" $sticky="top">
              <TableRow>
                <TableCell $sticky="start">Component</TableCell>
                <TableCell>Status</TableCell>
                <TableCell numeric>Variants</TableCell>
                <TableCell>Notes</TableCell>
              </TableRow>
            </TableRowGroup>
            <TableRowGroup>
              <TableRow>
                <TableCell $sticky="start">Disclosure</TableCell>
                <TableCell>Expanded</TableCell>
                <TableCell numeric>9</TableCell>
                <TableCell>Guides, split layout</TableCell>
              </TableRow>
            </TableRowGroup>
          </Table>
        `}
      >
        <PreScrolled left={160} top={80}>
          <Table
            aria-label="Component details"
            className="whitespace-nowrap"
            rows={pinnedStartRows}
            container={{ $border: true, className: "max-h-64" }}
            head={{ $sticky: "top" }}
          />
        </PreScrolled>
      </Example>

      <Example
        title="Pinned end column"
        description="An actions column stays at the end edge while the other columns scroll under it. It draws the line before it itself."

        wide
        stretch
        code={`
          <Table container={{ $border: true }}>
            <TableRowGroup group="head">
              <TableRow>
                <TableCell>Component</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell $sticky="end" $fit>Actions</TableCell>
              </TableRow>
            </TableRowGroup>
            <TableRowGroup>
              <TableRow>
                <TableCell>Button</TableCell>
                <TableCell>Bevel and flat kinds</TableCell>
                <TableCell $sticky="end" $fit>
                  <Button $p={1}>
                    <ButtonSlot>
                      <Pencil />
                    </ButtonSlot>
                  </Button>
                </TableCell>
              </TableRow>
            </TableRowGroup>
          </Table>
        `}
      >
        <Table
          aria-label="Component actions"
          className="whitespace-nowrap"
          rows={pinnedEndRows}
          container={{ $border: true }}
        />
      </Example>

      <Example
        title="Right to left"
        description="In a right-to-left table, the pinned actions column sits at the left edge and draws the line on its right side."
        stretch
        code={`
          <div dir="rtl">
            <Table container={{ $border: true }}>
              <TableRowGroup group="head">
                <TableRow>
                  <TableCell>المكون</TableCell>
                  <TableCell>الحالة</TableCell>
                  <TableCell $sticky="end" $fit>إجراءات</TableCell>
                </TableRow>
              </TableRowGroup>
              <TableRowGroup>
                <TableRow>
                  <TableCell header="row">Button</TableCell>
                  <TableCell>مغطى</TableCell>
                  <TableCell $sticky="end" $fit>
                    <Button $p={1}>
                      <ButtonSlot>
                        <Pencil />
                      </ButtonSlot>
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell header="row">Tabs</TableCell>
                  <TableCell>موسع</TableCell>
                  <TableCell $sticky="end" $fit>
                    <Button $p={1}>
                      <ButtonSlot>
                        <Pencil />
                      </ButtonSlot>
                    </Button>
                  </TableCell>
                </TableRow>
              </TableRowGroup>
            </Table>
          </div>
        `}
      >
        <div dir="rtl" lang="ar">
          <Table
            aria-label="إجراءات المكونات"
            className="whitespace-nowrap"
            container={{ $border: true }}
          >
            <TableRowGroup group="head">
              <TableRow>
                <TableCell>المكون</TableCell>
                <TableCell>الحالة</TableCell>
                <TableCell $sticky="end" $fit>
                  إجراءات
                </TableCell>
              </TableRow>
            </TableRowGroup>
            <TableRowGroup>
              <TableRow>
                <TableCell header="row">Button</TableCell>
                <TableCell>مغطى</TableCell>
                <TableCell $sticky="end" $fit>
                  <Button aria-label="تعديل Button" $p={1}>
                    <ButtonSlot>
                      <Pencil />
                    </ButtonSlot>
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell header="row">Tabs</TableCell>
                <TableCell>موسع</TableCell>
                <TableCell $sticky="end" $fit>
                  <Button aria-label="تعديل Tabs" $p={1}>
                    <ButtonSlot>
                      <Pencil />
                    </ButtonSlot>
                  </Button>
                </TableCell>
              </TableRow>
            </TableRowGroup>
          </Table>
        </div>
      </Example>

      <Example
        title="Sortable headers"
        description="A sortable header is a button that covers the cell. The sorted column shows an arrow, and the other columns show faint chevrons."

        stretch
        code={`
          <Table container={{ $border: true }}>
            <TableRowGroup group="head">
              <TableRow>
                <TableCell sort="ascending">Component</TableCell>
                <TableCell sort="none">Status</TableCell>
                <TableCell numeric sort="none">Variants</TableCell>
              </TableRow>
            </TableRowGroup>
            <TableRowGroup>
              <TableRow>
                <TableCell>Button</TableCell>
                <TableCell>Covered</TableCell>
                <TableCell numeric>12</TableCell>
              </TableRow>
            </TableRowGroup>
          </Table>
        `}
      >
        <Table
          aria-label="Components sorted by name"
          rows={sortedByNameRows}
          container={{ $border: true }}
        />
      </Example>

      <Example
        title="Descending numeric sort"
        description="A descending sort turns the arrow around. In a numeric column the arrow comes first, so the label stays over the digits."

        stretch
        code={`
          <Table container={{ $border: true }}>
            <TableRowGroup group="head">
              <TableRow>
                <TableCell sort="none">Component</TableCell>
                <TableCell>Status</TableCell>
                <TableCell numeric sort="descending">Variants</TableCell>
              </TableRow>
            </TableRowGroup>
            <TableRowGroup>
              <TableRow>
                <TableCell>Button</TableCell>
                <TableCell>Covered</TableCell>
                <TableCell numeric>12</TableCell>
              </TableRow>
            </TableRowGroup>
          </Table>
        `}
      >
        <Table
          aria-label="Components sorted by variants"
          rows={sortedByVariantsRows}
          container={{ $border: true }}
        />
      </Example>

      <Example
        title="Selected rows"
        description="A grid whose cells take focus with the arrow keys. Selected rows take a brand tint, and the checkbox column is only as wide as its content."

        wide
        stretch
        code={`
          <ak.Composite render={<Table container={{ $border: true }} />}>
            <TableRowGroup group="head">
              <ak.CompositeRow render={<TableRow />}>
                <TableCell $fit>
                  <ak.CompositeItem render={<Checkbox checked="mixed" />} />
                </TableCell>
                <ak.CompositeItem render={<TableCell $grow />}>Component</ak.CompositeItem>
                <ak.CompositeItem render={<TableCell />}>Status</ak.CompositeItem>
                <ak.CompositeItem render={<TableCell numeric />}>Variants</ak.CompositeItem>
              </ak.CompositeRow>
            </TableRowGroup>
            <TableRowGroup>
              <ak.CompositeRow render={<TableRow selected />}>
                <TableCell $fit>
                  <ak.CompositeItem render={<Checkbox checked />} />
                </TableCell>
                <ak.CompositeItem render={<TableCell header="row" />}>Glider</ak.CompositeItem>
                <ak.CompositeItem render={<TableCell />}>Expanded</ak.CompositeItem>
                <ak.CompositeItem render={<TableCell numeric />}>6</ak.CompositeItem>
              </ak.CompositeRow>
            </TableRowGroup>
          </ak.Composite>
        `}
      >
        <SelectedRowsGrid />
      </Example>

      <Example
        title="Focusable rows"
        description="A grid whose rows take focus with the arrow keys. The ring goes around the whole row and follows the rounded corner of the last row."
        stretch
        code={`
          <ak.CompositeProvider>
            <ak.Composite render={<Table container={{ $border: true }} />}>
              <TableRowGroup group="head">
                <TableRow>
                  <TableCell>Component</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell numeric>Variants</TableCell>
                </TableRow>
              </TableRowGroup>
              <TableRowGroup>
                <ak.CompositeItem render={<TableRow />}>
                  <TableCell header="row">Button</TableCell>
                  <TableCell>Covered</TableCell>
                  <TableCell numeric>12</TableCell>
                </ak.CompositeItem>
                <ak.CompositeItem render={<TableRow />}>
                  <TableCell header="row">Glider</TableCell>
                  <TableCell>Expanded</TableCell>
                  <TableCell numeric>6</TableCell>
                </ak.CompositeItem>
                <ak.CompositeItem render={<TableRow />}>
                  <TableCell header="row">Tabs</TableCell>
                  <TableCell>Expanded</TableCell>
                  <TableCell numeric>8</TableCell>
                </ak.CompositeItem>
                <ak.CompositeItem render={<TableRow />}>
                  <TableCell header="row">Table</TableCell>
                  <TableCell>Covered</TableCell>
                  <TableCell numeric>5</TableCell>
                </ak.CompositeItem>
              </TableRowGroup>
            </ak.Composite>
          </ak.CompositeProvider>
        `}
      >
        <ak.CompositeProvider>
          <ak.Composite
            role="grid"
            render={
              <Table
                aria-label="Open a component"
                container={{ $border: true }}
              />
            }
          >
            <TableRowGroup group="head">
              <TableRow>
                <TableCell>Component</TableCell>
                <TableCell>Status</TableCell>
                <TableCell numeric>Variants</TableCell>
              </TableRow>
            </TableRowGroup>
            <TableRowGroup>
              {components.map((entry) => (
                <ak.CompositeItem key={entry.component} render={<TableRow />}>
                  <TableCell header="row">{entry.component}</TableCell>
                  <TableCell>{entry.status}</TableCell>
                  <TableCell numeric>{entry.variants}</TableCell>
                </ak.CompositeItem>
              ))}
            </TableRowGroup>
          </ak.Composite>
        </ak.CompositeProvider>
      </Example>

      <Example
        title="Compact density"
        description="Less padding on both axes. The smaller head text still pads like a body row."
        stretch
        code={`
          <Table rows={[…]} container={{ $border: true }} $p={1} />
        `}
      >
        <Table
          aria-label="Component coverage"
          rows={componentRows}
          container={{ $border: true }}
          $p={1}
        />
      </Example>

      <Example
        title="Wide side padding"
        description="More space at the sides of each cell, with the default space above and below."
        stretch
        code={`
          <Table rows={[…]} container={{ $border: true }} $px="xl" />
        `}
      >
        <Table
          aria-label="Component coverage"
          rows={componentRows}
          container={{ $border: true }}
          $px="xl"
        />
      </Example>

      <Example
        title="On a brand layer"
        description="The container, the head band and the lines take their colors from the brand surface under the table."
        stretch
        code={`
          <Frame $layer="brand" $rounded="xl" $p={4}>
            <Table rows={[…]} container={{ $border: true }} />
          </Frame>
        `}
      >
        <Frame $layer="brand" $rounded="xl" $p={4}>
          <Table
            aria-label="Component coverage"
            rows={componentRows}
            container={{ $border: true }}
          />
        </Frame>
      </Example>

      {/*
        Regression fixtures: Table scenarios migrated from the table-cell-layer
        and table-rows sandboxes, plus element values in declarative rows.
      */}
      <Example
        title="Table cell layer"

        wide
        stretch
        code={`
          <Table $border>
            <TableRowGroup>
              <TableRow>
                <TableCell $sticky="start">Pinned name</TableCell>
                <TableCell>Row surface</TableCell>
                <TableCell $layer="brand">Custom surface</TableCell>
                <TableCell $lighten>Modified surface</TableCell>
                <TableCell $lighten $layer={false}>Disabled surface</TableCell>
              </TableRow>
            </TableRowGroup>
          </Table>
        `}
      >
        <TableCellLayer />
      </Example>
      <Example
        title="Table rows"

        wide
        stretch
        code={`
          <Button>Reverse rows</Button>
          <Button>Add contributor</Button>
          <Table $border />
        `}
      >
        <TableRowsFixture />
      </Example>
      <Example
        title="Mixed row keys"

        wide
        stretch
        code={`
          <Button>Reverse task rows</Button>
          <Table />
        `}
      >
        <MixedRowKeys />
      </Example>
      <Example
        title="Element cell values"
        wide
        stretch
        code={`
          <Table $border rows={[…]} container={{ $border: true }} />
        `}
      >
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
