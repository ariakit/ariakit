import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import { ArrowUp, ChevronsUpDown } from "lucide-react";
import * as React from "react";
import { createRender } from "../react-utils/create-render.react.ts";
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
  tableSortButton,
  tableSortIndicator,
} from "../styles/table.ts";

type TableRowGroupKind = "head" | "body" | "foot";

export type TableSortValue = "ascending" | "descending" | "none";

// The cell props a head cell sets for its whole column in declarative rows (see
// getColumnProps in Table).
const COLUMN_PROPS = ["numeric", "$sticky", "$fit", "$grow"] as const;

type ColumnProps = Pick<TableCellProps, (typeof COLUMN_PROPS)[number]>;

/**
 * Collects the union of column keys across all rows, preserving the first
 * appearance order (head rows first) so every row renders the same cells in the
 * same positions regardless of its own key order or missing columns.
 */
function getColumnKeys<K extends string | number>(rows?: TableRows<K>) {
  const keys = new Set<string>();
  for (const row of rows ?? []) {
    for (const key of Object.keys(row)) {
      if (key === "group") continue;
      keys.add(key);
    }
  }
  return [...keys];
}

export type TableRow<K extends string | number> = {
  group?: TableRowGroupKind;
  // Partial: a row may omit columns (or set them to null) and still render an
  // empty cell in the right position.
} & Partial<Record<K, React.ReactNode | TableCellProps>>;

export type TableRows<K extends string | number> = TableRow<K>[];

const TableRowGroupContext = React.createContext<TableRowGroupKind>("body");

interface TableCellContextType {
  numeric: boolean;
  sort?: TableSortValue;
}

// What a cell tells the sort button and the indicator inside it.
const TableCellContext = React.createContext<TableCellContextType>({
  numeric: false,
});

export interface TableProps<K extends string | number>
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
 * Composable table with declarative rows, always wrapped in a `TableContainer`
 * and a `TableScroller`. Pass `container` or `scroller` to configure them, or
 * compose the parts by hand for a table without them.
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
export function Table<K extends string | number>({
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

  // Rows are caller-controlled records: inherited properties are not part of
  // the declarative contract, so a sparse row must not render a value from its
  // prototype chain.
  const getCell = (row: TableRow<K>, key: K) => {
    if (!Object.hasOwn(row, key)) return undefined;
    return row[key];
  };

  // The props of a cell given as an element or as a props object; content given
  // any other way has none.
  const getCellProps = (row: TableRow<K>, key: K) => {
    const cell = getCell(row, key);
    if (!cell) return;
    if (typeof cell !== "object") return;
    if (React.isValidElement<TableCellProps>(cell)) return cell.props;
    if (isIterable(cell)) return;
    return cell as TableCellProps;
  };

  // A column takes its number format, its pin and its width from its head cell,
  // so the declarative rows set each once instead of on every cell. A sort
  // stays with the head cell: only a column header takes it.
  const getColumnProps = (key: K) => {
    const columnProps: ColumnProps = {};
    for (const row of headRows ?? []) {
      const cellProps = getCellProps(row, key);
      if (!cellProps) continue;
      for (const prop of COLUMN_PROPS) {
        if (!Object.hasOwn(cellProps, prop)) continue;
        if (!cellProps[prop]) continue;
        Object.assign(columnProps, { [prop]: cellProps[prop] });
      }
    }
    return columnProps;
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
              ...getColumnProps(key as K),
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
  /**
   * Whether the row is selected, which the row says with `aria-selected`. Rows
   * are selectable in a grid, so a table that selects rows takes `role="grid"`.
   */
  selected?: boolean;
}

export function TableRow({ group, selected, ...props }: TableRowProps) {
  const contextGroup = React.useContext(TableRowGroupContext);
  group = group ?? contextGroup;
  const isBody = group === "body";
  const [variantProps, rest] = splitProps(props, tableRow);
  return (
    <tr
      aria-selected={selected}
      {...tableRow.jsx({
        ...variantProps,
        // The head and foot bands take neither the hover nor the selection
        // tint.
        $hover: variantProps.$hover ?? isBody,
        $selected: variantProps.$selected ?? isBody,
      })}
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
  /**
   * Makes a column header sortable and says how its column is sorted: the
   * header takes `aria-sort`, and a `TableSortButton` wraps its content with
   * the indicator for the state. `"none"` is a sortable column the table is not
   * sorted by. Only a column header takes it.
   */
  sort?: TableSortValue;
  /** Custom sort button element or props to render a `TableSortButton`. */
  sortButton?: React.ReactElement | TableSortButtonProps;
}

export function TableCell({
  numeric,
  header,
  sort,
  sortButton,
  ...props
}: TableCellProps) {
  const group = React.useContext(TableRowGroupContext);
  header = header ?? (group === "head" ? "column" : false);
  // Only the bare `true` value derives the header kind from the group, so an
  // explicit "row" stays a row header even inside a head group.
  const isColumnHeader =
    header === "column" || (header === true && group === "head");
  const isRowHeader = header === "row" || (header === true && group !== "head");
  const Component = header ? "th" : "td";
  const sortable = sort != null && isColumnHeader;
  const [variantProps, rest] = splitProps(props, tableCell);
  const sortButtonEl = createRender(TableSortButton, sortButton);
  const contextValue = React.useMemo(
    () => ({ numeric: !!numeric, sort: sortable ? sort : undefined }),
    [numeric, sortable, sort],
  );

  const getScope = () => {
    if (!header) return;
    if (isColumnHeader) return "col";
    if (isRowHeader) return "row";
    return;
  };

  return (
    <TableCellContext.Provider value={contextValue}>
      <Component
        scope={getScope()}
        aria-sort={sortable ? sort : undefined}
        {...tableCell.jsx({
          $header: isColumnHeader ? "column" : isRowHeader ? "row" : false,
          $numeric: !!numeric,
          ...variantProps,
        })}
        {...rest}
      >
        {sortable ? (
          <ak.Role render={sortButtonEl}>{rest.children}</ak.Role>
        ) : (
          rest.children
        )}
      </Component>
    </TableCellContext.Provider>
  );
}

export interface TableSortButtonProps
  extends ak.ButtonProps, VariantProps<typeof tableSortButton> {
  /**
   * The indicator after the label. Defaults to a `TableSortIndicator`; pass
   * `null` for none.
   */
  indicator?: React.ReactNode;
}

/**
 * The control of a sortable column header, which `TableCell` renders when it
 * takes `sort`. It runs edge to edge over the cell, so the whole header is the
 * target, and keeps the label where a plain header puts it.
 */
export function TableSortButton({
  indicator = <TableSortIndicator />,
  ...props
}: TableSortButtonProps) {
  const cell = React.useContext(TableCellContext);
  const [variantProps, rest] = splitProps(props, tableSortButton);
  return (
    <ak.Button
      {...tableSortButton.jsx({
        ...variantProps,
        $numeric: variantProps.$numeric ?? cell.numeric,
      })}
      {...rest}
    >
      {rest.children}
      {indicator}
    </ak.Button>
  );
}

export interface TableSortIndicatorProps
  extends
    React.ComponentProps<"span">,
    VariantProps<typeof tableSortIndicator> {}

/**
 * The sort indicator of a `TableSortButton`: chevrons while the column is not
 * sorted, an arrow once it is, which the header's `aria-sort` turns around for
 * a descending sort. Children replace the glyph.
 */
export function TableSortIndicator(props: TableSortIndicatorProps) {
  const { sort } = React.useContext(TableCellContext);
  const [variantProps, rest] = splitProps(props, tableSortIndicator);
  const sorted = sort === "ascending" || sort === "descending";
  return (
    // The header's aria-sort already says the direction.
    <ak.Role.span
      aria-hidden
      {...tableSortIndicator.jsx(variantProps)}
      {...rest}
    >
      {rest.children ?? (sorted ? <ArrowUp /> : <ChevronsUpDown />)}
    </ak.Role.span>
  );
}
