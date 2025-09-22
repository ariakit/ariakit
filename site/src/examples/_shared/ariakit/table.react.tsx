import * as ak from "@ariakit/react";
import clsx from "clsx";
import * as React from "react";
import { createRenderElement } from "#app/examples/_shared/react/utils.ts";

type TableRowGroup = "head" | "body" | "foot";

export type TableRow<K extends keyof any> = {
  group?: TableRowGroup;
} & Record<K, React.ReactNode | TableCellProps>;

const TableRowGroupContext = React.createContext<TableRowGroup>("body");

export interface TableProps<K extends keyof any>
  extends React.ComponentProps<"table"> {
  container?: React.ReactElement | TableContainerProps;
  scroller?: React.ReactElement | TableScrollerProps;
  head?: React.ReactElement | TableRowGroupProps;
  body?: React.ReactElement | TableRowGroupProps;
  foot?: React.ReactElement | TableRowGroupProps;
  row?: React.ReactElement | TableRowProps;
  headRow?: React.ReactElement | TableRowProps;
  footRow?: React.ReactElement | TableRowProps;
  rows?: TableRow<K>[];
}

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
  const containerEl = createRenderElement(TableContainer, container);
  const scrollerEl = createRenderElement(TableScroller, scroller);
  const headEl = createRenderElement(TableRowGroup, head, { group: "head" });
  const bodyEl = createRenderElement(TableRowGroup, body);
  const footEl = createRenderElement(TableRowGroup, foot, { group: "foot" });
  const rowEl = createRenderElement(TableRow, row);
  const headRowEl = createRenderElement(TableRow, headRow, { group: "head" });
  const footRowEl = createRenderElement(TableRow, footRow, { group: "foot" });
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
    if (typeof cell === "string") return false;
    if (!("numeric" in cell)) return false;
    return cell.numeric;
  };

  const renderRow = (row: TableRow<K>, index: number) => {
    const rowElement = getRowElement(row);
    return (
      <ak.Role key={index} render={rowElement}>
        {Object.entries(row).map(([key, value]) => {
          if (key === "group") return null;
          if (value == null) return null;
          const tableCellElement = createRenderElement(TableCell, value, {
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
              {!!bodyRows?.length && (
                <ak.Role render={bodyEl}>
                  {bodyRows.map((row, index) => renderRow(row, index))}
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
  numeric?: boolean;
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
  return (
    <Component
      {...props}
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
