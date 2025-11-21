import * as ak from "@ariakit/react";
import clsx from "clsx";
import * as React from "react";
import { createRender } from "#app/examples/_lib/react-utils/create-render.ts";
import { isIterable } from "#app/examples/_lib/react-utils/is-iterable.ts";

type TableRowGroup = "head" | "body" | "foot";

export type TableRow<K extends keyof any> = {
  group?: TableRowGroup;
} & Record<K, React.ReactNode | TableCellProps>;

export type TableRows<K extends keyof any> = TableRow<K>[];

const TableRowGroupContext = React.createContext<TableRowGroup>("body");

export interface TableProps<K extends keyof any>
  extends React.ComponentProps<"table"> {
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

  const getRowElement = (row: TableRow<K>) => {
    if (row.group === "head") return headRowEl;
    if (row.group === "foot") return footRowEl;
    return rowEl;
  };

  const isNumericColumn = (row: TableRow<K>, key: K) => {
    const cell = row[key];
    if (!cell) return false;
    if (typeof cell !== "object") return false;
    if (React.isValidElement<TableCellProps>(cell)) {
      return Boolean(cell.props.numeric);
    }
    if (isIterable(cell)) return false;
    if (React.isValidElement<any>(cell)) return false;
    if (!Object.hasOwn(cell, "numeric")) return false;
    return Boolean(cell.numeric);
  };

  const renderRow = (row: TableRow<K>, index: number) => {
    const rowElement = getRowElement(row);
    return (
      <ak.Role key={index} render={rowElement}>
        {Object.entries(row).map(([key, value]) => {
          if (key === "group") return null;
          if (value == null) return null;
          const tableCellElement = createRender(TableCell, value, {
            numeric: !!headRows?.some((row) => isNumericColumn(row, key as K)),
            header: row.group === "head" ? "column" : false,
            children: key,
          } as const);
          return <ak.Role key={key} render={tableCellElement} />;
        })}
      </ak.Role>
    );
  };

  return (
    <ak.Role render={containerEl}>
      <ak.Role render={scrollerEl}>
        <table {...props} className={clsx("ak-table", props.className)}>
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

export interface TableContainerProps extends React.ComponentProps<"div"> {}

export function TableContainer(props: TableContainerProps) {
  return (
    <div {...props} className={clsx("ak-table-container", props.className)} />
  );
}

export interface TableScrollerProps extends React.ComponentProps<"div"> {}

export function TableScroller(props: TableScrollerProps) {
  return (
    <div {...props} className={clsx("ak-table-scroller", props.className)} />
  );
}

export interface TableRowGroupProps
  extends React.ComponentProps<"tbody" | "thead" | "tfoot"> {
  /** The group of rows to render. */
  group?: TableRowGroup;
}

export function TableRowGroup({
  group = "body",
  ...props
}: TableRowGroupProps) {
  const Component =
    group === "head" ? "thead" : group === "foot" ? "tfoot" : "tbody";
  return (
    <TableRowGroupContext.Provider value={group}>
      <Component
        {...props}
        className={clsx(
          group === "body" && "ak-table-rowgroup",
          group === "head" && `ak-table-head`,
          group === "foot" && `ak-table-foot`,
          props.className,
        )}
      />
    </TableRowGroupContext.Provider>
  );
}

export interface TableRowProps extends React.ComponentProps<"tr"> {
  /** The group of rows to render. */
  group?: TableRowGroup;
}

export function TableRow({ group, ...props }: TableRowProps) {
  const contextGroup = React.useContext(TableRowGroupContext);
  group = group ?? contextGroup;
  return (
    <tr
      {...props}
      className={clsx(
        group === "body" && "ak-table-row",
        group === "head" && `ak-table-head-row`,
        group === "foot" && `ak-table-foot-row`,
        props.className,
      )}
    />
  );
}

export interface TableCellProps extends React.ComponentProps<"td"> {
  /** Whether the cell is numeric. */
  numeric?: boolean;
  /** Whether the cell is a header. */
  header?: "column" | "row" | boolean;
}

export function TableCell({ numeric, header, ...props }: TableCellProps) {
  const contextGroup = React.useContext(TableRowGroupContext);
  const group = contextGroup ?? "body";
  header = header ?? (group === "head" ? "column" : false);
  const isColumnHeader = header === "column" || (header && group === "head");
  const isRowHeader =
    header === "row" || (header && !isColumnHeader && group !== "head");
  const Component = header ? "th" : "td";

  const getScope = () => {
    if (!header) return;
    if (isColumnHeader) return "col";
    if (isRowHeader) return "row";
    return;
  };

  return (
    <Component
      {...props}
      scope={getScope()}
      className={clsx(
        !header && "ak-table-cell",
        isColumnHeader && "ak-table-column-header",
        isRowHeader && "ak-table-row-header",
        numeric && "ak-table-numeric",
        props.className,
      )}
    />
  );
}
