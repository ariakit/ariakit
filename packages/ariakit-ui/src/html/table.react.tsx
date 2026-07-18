import type { VariantProps } from "clava";
import { splitProps } from "clava";
import type { ComponentProps } from "react";
import { createContext, useContext } from "react";
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
// repeating the group prop on every descendant.
const TableRowGroupContext = createContext<TableRowGroupKind>("body");

export interface TableContainerProps
  extends ComponentProps<"div">, VariantProps<typeof tableContainer> {}

/**
 * Renders the framed wrapper that rounds the table's corners and draws its
 * outer borders. Place a `TableScroller` with the `Table` inside.
 */
export function TableContainer(props: TableContainerProps) {
  const [variantProps, rest] = splitProps(props, tableContainer);
  return <div {...tableContainer.jsx(variantProps)} {...rest} />;
}

export interface TableScrollerProps
  extends ComponentProps<"div">, VariantProps<typeof tableScroller> {}

/**
 * Renders the scroll area that lets the table rows scroll under sticky row
 * groups. Must be placed inside a `TableContainer`, wrapping the `Table`.
 */
export function TableScroller(props: TableScrollerProps) {
  const [variantProps, rest] = splitProps(props, tableScroller);
  return <div {...tableScroller.jsx(variantProps)} {...rest} />;
}

export interface TableProps
  extends ComponentProps<"table">, VariantProps<typeof table> {}

/**
 * Renders a styled `<table>` element. Compose
 * `TableContainer > TableScroller > Table` for the framed look with rounded
 * corners and outer borders.
 */
export function Table(props: TableProps) {
  const [variantProps, rest] = splitProps(props, table);
  return <table {...table.jsx(variantProps)} {...rest} />;
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
export function TableRowGroup({
  group = "body",
  ...props
}: TableRowGroupProps) {
  const Component =
    group === "head" ? "thead" : group === "foot" ? "tfoot" : "tbody";
  const groupStyle =
    group === "head" ? tableHead : group === "foot" ? tableFoot : tableRowGroup;
  const [variantProps, rest] = splitProps(props, groupStyle);
  return (
    <TableRowGroupContext.Provider value={group}>
      <Component {...groupStyle.jsx(variantProps)} {...rest} />
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
export function TableRow({ group, ...props }: TableRowProps) {
  const contextGroup = useContext(TableRowGroupContext);
  group = group ?? contextGroup;
  const [variantProps, rest] = splitProps(props, tableRow);
  return (
    <tr
      {...tableRow.jsx({
        ...variantProps,
        $hover: variantProps.$hover ?? group === "body",
      })}
      {...rest}
    />
  );
}

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
export function TableCell({ numeric, header, ...props }: TableCellProps) {
  const group = useContext(TableRowGroupContext);
  header = header ?? (group === "head" ? "column" : false);
  // Only the bare `true` value derives the header kind from the group, so an
  // explicit "row" stays a row header even inside a head group.
  const isColumnHeader =
    header === "column" || (header === true && group === "head");
  const isRowHeader = header === "row" || (header === true && group !== "head");
  const Component = header ? "th" : "td";
  const [variantProps, rest] = splitProps(props, tableCell);

  const getScope = () => {
    if (!header) return;
    if (isColumnHeader) return "col";
    if (isRowHeader) return "row";
    return;
  };

  return (
    <Component
      scope={getScope()}
      {...tableCell.jsx({
        $header: isColumnHeader ? "column" : isRowHeader ? "row" : false,
        $numeric: !!numeric,
        ...variantProps,
      })}
      {...rest}
    />
  );
}
