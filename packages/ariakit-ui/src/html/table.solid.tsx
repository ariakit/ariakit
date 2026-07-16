import type { VariantProps } from "clava";
import type { Accessor, ComponentProps } from "solid-js";
import { createContext, splitProps, useContext } from "solid-js";
import { Dynamic } from "solid-js/web";
import {
  table,
  tableCell,
  tableContainer,
  tableFoot,
  tableHead,
  tableRow,
  tableRowGroup,
  tableScroller,
} from "../styles/table.ts";

type TableRowGroupKind = "head" | "body" | "foot";

// Lets rows and cells pick up the enclosing row group's kind without
// repeating the group prop on every descendant. The context carries an
// accessor because Solid providers read their value untracked, so a plain
// value would freeze descendants at the mount-time group.
const defaultTableRowGroup: Accessor<TableRowGroupKind> = () => "body";
const TableRowGroupContext = createContext(defaultTableRowGroup);

export interface TableContainerProps
  extends ComponentProps<"div">, VariantProps<typeof tableContainer> {}

/**
 * Renders the framed wrapper that rounds the table's corners and draws its
 * outer borders. Place a `TableScroller` with the `Table` inside.
 */
export function TableContainer(props: TableContainerProps) {
  const [variantProps, rest] = splitProps(props, tableContainer.html.propKeys);
  return <div {...tableContainer.html(variantProps)} {...rest} />;
}

export interface TableScrollerProps
  extends ComponentProps<"div">, VariantProps<typeof tableScroller> {}

/**
 * Renders the scroll area that lets the table rows scroll under sticky row
 * groups. Must be placed inside a `TableContainer`, wrapping the `Table`.
 */
export function TableScroller(props: TableScrollerProps) {
  const [variantProps, rest] = splitProps(props, tableScroller.html.propKeys);
  return <div {...tableScroller.html(variantProps)} {...rest} />;
}

export interface TableProps
  extends ComponentProps<"table">, VariantProps<typeof table> {}

/**
 * Renders a styled `<table>` element. Compose
 * `TableContainer > TableScroller > Table` for the framed look with rounded
 * corners and outer borders.
 */
export function Table(props: TableProps) {
  const [variantProps, rest] = splitProps(props, table.html.propKeys);
  return <table {...table.html(variantProps)} {...rest} />;
}

export interface TableRowGroupProps
  extends
    ComponentProps<"tbody" | "thead" | "tfoot">,
    VariantProps<typeof tableRowGroup> {
  /** The group of rows to render. */
  group?: TableRowGroupKind;
}

/**
 * Renders `<thead>`, `<tbody>`, or `<tfoot>` based on the `group` prop and
 * provides the group to the `TableRow` and `TableCell` components inside.
 * Must be placed inside a `Table`.
 */
export function TableRowGroup(props: TableRowGroupProps) {
  // The head and foot styles extend the base row group style without adding
  // variants, so the base prop keys split all of them.
  const [localProps, variantProps, rest] = splitProps(
    props,
    ["group"],
    tableRowGroup.html.propKeys,
  );
  const group = () => localProps.group ?? "body";
  const groupStyle = () =>
    group() === "head"
      ? tableHead
      : group() === "foot"
        ? tableFoot
        : tableRowGroup;
  return (
    <TableRowGroupContext.Provider value={group}>
      <Dynamic
        component={
          group() === "head" ? "thead" : group() === "foot" ? "tfoot" : "tbody"
        }
        {...groupStyle().html(variantProps)}
        {...rest}
      />
    </TableRowGroupContext.Provider>
  );
}

export interface TableRowProps
  extends ComponentProps<"tr">, VariantProps<typeof tableRow> {
  /** The group of rows to render. */
  group?: TableRowGroupKind;
}

/**
 * Renders a `<tr>` element. Must be placed inside a `TableRowGroup`, whose
 * group the row inherits so only body rows get the hover tint.
 */
export function TableRow(props: TableRowProps) {
  const context = useContext(TableRowGroupContext);
  const [localProps, variantProps, rest] = splitProps(
    props,
    ["group"],
    tableRow.html.propKeys,
  );
  const group = () => localProps.group ?? context();
  return (
    <tr
      {...tableRow.html({ $hover: group() === "body", ...variantProps })}
      {...rest}
    />
  );
}

// The `$header` and `$numeric` variants are computed from the `header` and
// `numeric` props, so they're omitted from the public props and must not be
// part of the split keys.
const tableCellPropKeys = tableCell.html.propKeys.filter(
  (key) => key !== "$header" && key !== "$numeric",
);

export interface TableCellProps
  extends
    ComponentProps<"td">,
    // The semantic props below compute these variants along with the
    // element and its scope, so they stay in sync.
    Omit<VariantProps<typeof tableCell>, "$header" | "$numeric"> {
  /** Whether the cell is numeric. */
  numeric?: boolean;
  /** Whether the cell is a header. */
  header?: "column" | "row" | boolean;
}

/**
 * Renders a `<th>` or `<td>` element with the matching `scope` attribute
 * based on the `header` prop. Must be placed inside a `TableRow`; cells in a
 * head `TableRowGroup` default to column headers.
 */
export function TableCell(props: TableCellProps) {
  const group = useContext(TableRowGroupContext);
  const [localProps, variantProps, rest] = splitProps(
    props,
    ["numeric", "header"],
    tableCellPropKeys,
  );
  const header = () =>
    localProps.header ?? (group() === "head" ? "column" : false);
  // Only the bare `true` value derives the header kind from the group, so an
  // explicit "row" stays a row header even inside a head group.
  const isColumnHeader = () =>
    header() === "column" || (header() === true && group() === "head");
  const isRowHeader = () =>
    header() === "row" || (header() === true && group() !== "head");

  const getScope = () => {
    if (!header()) return;
    if (isColumnHeader()) return "col";
    if (isRowHeader()) return "row";
    return;
  };

  return (
    <Dynamic
      component={header() ? "th" : "td"}
      scope={getScope()}
      {...tableCell.html({
        $header: isColumnHeader() ? "column" : isRowHeader() ? "row" : false,
        $numeric: !!localProps.numeric,
        ...variantProps,
      })}
      {...rest}
    />
  );
}
