import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import * as React from "react";
import { createRender } from "../react-utils/create-render.ts";
import { isIterable } from "../react-utils/is-iterable.ts";
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

/**
 * Collects the union of column keys across all rows, preserving the first
 * appearance order (head rows first) so every row renders the same cells in
 * the same positions regardless of its own key order or missing columns.
 */
function getColumnKeys<K extends keyof any>(rows?: TableRows<K>) {
  const keys = new Set<string>();
  for (const row of rows ?? []) {
    for (const key of Object.keys(row)) {
      if (key === "group") continue;
      keys.add(key);
    }
  }
  return [...keys];
}

export type TableRow<K extends keyof any> = {
  group?: TableRowGroupKind;
  // Partial: a row may omit columns (or set them to null) and still render
  // an empty cell in the right position.
} & Partial<Record<K, React.ReactNode | TableCellProps>>;

export type TableRows<K extends keyof any> = TableRow<K>[];

const TableRowGroupContext = React.createContext<TableRowGroupKind>("body");

export interface TableProps<K extends keyof any>
  extends React.ComponentProps<"table">, VariantProps<typeof table> {
  /** Custom container element or props to render a `TableContainer`. */
  container?: React.ReactElement | TableContainerProps;
  /** Custom scroller element or props to render a `TableScroller`. */
  scroller?: React.ReactElement | TableScrollerProps;
  /** Custom head row group element or props to render a `TableRowGroup`. */
  head?: React.ReactElement | TableRowGroupProps;
  /** Custom body row group element or props to render a `TableRowGroup`. */
  body?: React.ReactElement | TableRowGroupProps;
  /** Custom foot row group element or props to render a `TableRowGroup`. */
  foot?: React.ReactElement | TableRowGroupProps;
  /** Custom row element or props to render a `TableRow` for body rows. */
  row?: React.ReactElement | TableRowProps;
  /** Custom row element or props to render a `TableRow` for head rows. */
  headRow?: React.ReactElement | TableRowProps;
  /** Custom row element or props to render a `TableRow` for foot rows. */
  footRow?: React.ReactElement | TableRowProps;
  /**
   * Declarative rows data. Keys map to columns; values are cell content or
   * props.
   */
  rows?: TableRows<K>;
}

/**
 * Composable table with optional container/scroller and declarative rows.
 * @example
 * <Table>
 *   <TableRowGroup group="head">
 *     <TableRow>
 *       <TableCell header>Name</TableCell>
 *       <TableCell header numeric>Age</TableCell>
 *     </TableRow>
 *   </TableRowGroup>
 *   <TableRowGroup>
 *     <TableRow>
 *       <TableCell>Ada</TableCell>
 *       <TableCell numeric>37</TableCell>
 *     </TableRow>
 *   </TableRowGroup>
 * </Table>
 * @example
 * <Table
 *   rows={[
 *     { group: "head", name: "Name", age: { children: "Age", numeric: true } },
 *     { name: "Ada", age: 37 },
 *   ]}
 * />
 */
export function Table<K extends keyof any>({
  children,
  container,
  scroller,
  head,
  body,
  foot,
  row,
  headRow = row,
  footRow = row,
  rows,
  ...props
}: TableProps<K>) {
  const [variantProps, rest] = splitProps(props, table);
  const containerEl = createRender(TableContainer, container);
  const scrollerEl = createRender(TableScroller, scroller);
  const headEl = createRender(TableRowGroup, head, { group: "head" });
  const bodyEl = createRender(TableRowGroup, body);
  const footEl = createRender(TableRowGroup, foot, { group: "foot" });
  const rowEl = createRender(TableRow, row);
  const headRowEl = createRender(TableRow, headRow, { group: "head" });
  const footRowEl = createRender(TableRow, footRow, { group: "foot" });
  const headRows = rows?.filter((row) => row.group === "head");
  const bodyRows = rows?.filter((row) => row.group === "body" || !row.group);
  const footRows = rows?.filter((row) => row.group === "foot");
  const columnKeys = getColumnKeys([
    ...(headRows ?? []),
    ...(bodyRows ?? []),
    ...(footRows ?? []),
  ]);

  const getRowElement = (row: TableRow<K>) => {
    if (row.group === "head") return headRowEl;
    if (row.group === "foot") return footRowEl;
    return rowEl;
  };

  // Rows are caller-controlled records: inherited properties are not part
  // of the declarative contract, so a sparse row must not render a value
  // from its prototype chain.
  const getCell = (row: TableRow<K>, key: K) => {
    if (!Object.hasOwn(row, key)) return undefined;
    return row[key];
  };

  const isNumericColumn = (row: TableRow<K>, key: K) => {
    const cell = getCell(row, key);
    if (!cell) return false;
    if (typeof cell !== "object") return false;
    if (React.isValidElement<TableCellProps>(cell)) {
      return Boolean(cell.props.numeric);
    }
    if (isIterable(cell)) return false;
    if (!Object.hasOwn(cell, "numeric")) return false;
    return Boolean((cell as TableCellProps).numeric);
  };

  const renderRow = (row: TableRow<K>, index: number) => {
    const rowElement = getRowElement(row);
    return (
      <ak.Role key={index} render={rowElement}>
        {columnKeys.map((key) => {
          // Missing and null columns still emit an empty cell so every
          // following cell stays under its header.
          const value = getCell(row, key as K) ?? { children: null };
          const tableCellElement = createRender<TableCellProps>(
            TableCell,
            value,
            {
              numeric: !!headRows?.some((row) =>
                isNumericColumn(row, key as K),
              ),
              header: row.group === "head" ? "column" : false,
              children: key,
            },
          );
          return <ak.Role key={key} render={tableCellElement} />;
        })}
      </ak.Role>
    );
  };

  return (
    <ak.Role render={containerEl}>
      <ak.Role render={scrollerEl}>
        <table {...table.jsx(variantProps)} {...rest}>
          {rows?.length ? (
            <>
              {!!headRows?.length && (
                <ak.Role render={headEl}>
                  {headRows.map((row, index) => renderRow(row, index))}
                </ak.Role>
              )}
              {!!(bodyRows?.length || children) && (
                <ak.Role render={bodyEl}>
                  {bodyRows?.map((row, index) => renderRow(row, index))}
                  {children}
                </ak.Role>
              )}
              {!!footRows?.length && (
                <ak.Role render={footEl}>
                  {footRows.map((row, index) => renderRow(row, index))}
                </ak.Role>
              )}
            </>
          ) : (
            children
          )}
        </table>
      </ak.Role>
    </ak.Role>
  );
}

export interface TableContainerProps
  extends React.ComponentProps<"div">, VariantProps<typeof tableContainer> {}

export function TableContainer(props: TableContainerProps) {
  const [variantProps, rest] = splitProps(props, tableContainer);
  return <div {...tableContainer.jsx(variantProps)} {...rest} />;
}

export interface TableScrollerProps
  extends React.ComponentProps<"div">, VariantProps<typeof tableScroller> {}

export function TableScroller(props: TableScrollerProps) {
  const [variantProps, rest] = splitProps(props, tableScroller);
  return <div {...tableScroller.jsx(variantProps)} {...rest} />;
}

export interface TableRowGroupProps
  extends
    React.ComponentProps<"tbody" | "thead" | "tfoot">,
    VariantProps<typeof tableRowGroup> {
  /** The group of rows to render. */
  group?: TableRowGroupKind;
}

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
  extends React.ComponentProps<"tr">, VariantProps<typeof tableRow> {
  /** The group of rows to render. */
  group?: TableRowGroupKind;
}

export function TableRow({ group, ...props }: TableRowProps) {
  const contextGroup = React.useContext(TableRowGroupContext);
  group = group ?? contextGroup;
  const [variantProps, rest] = splitProps(props, tableRow);
  return (
    <tr
      {...tableRow.jsx({ $hover: group === "body", ...variantProps })}
      {...rest}
    />
  );
}

export interface TableCellProps
  extends
    React.ComponentProps<"td">,
    // The semantic props below compute these variants along with the
    // element and its scope, so they stay in sync.
    Omit<VariantProps<typeof tableCell>, "$header" | "$numeric"> {
  /** Whether the cell is numeric. */
  numeric?: boolean;
  /** Whether the cell is a header. */
  header?: "column" | "row" | boolean;
}

export function TableCell({ numeric, header, ...props }: TableCellProps) {
  const group = React.useContext(TableRowGroupContext);
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
