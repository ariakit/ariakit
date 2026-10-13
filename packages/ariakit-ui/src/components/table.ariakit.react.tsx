import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import { ArrowUp, ChevronsUpDown } from "lucide-react";
import * as React from "react";
import {
  createOptionalRender,
  createRender,
} from "../react-utils/create-render.react.ts";
import { isIterable } from "../react-utils/is-iterable.ts";
import {
  table,
  tableCaption,
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

// Head-cell props shared by the column in declarative rows.
const COLUMN_PROPS = ["numeric", "$sticky", "$fit", "$grow"] as const;

type ColumnProps = Pick<TableCellProps, (typeof COLUMN_PROPS)[number]>;

/** Collects columns in first-appearance order so sparse rows stay aligned. */
function getColumnKeys<K extends string | number>(rows?: TableRows<K>) {
  const keys = new Set<string>();
  for (const row of rows ?? []) {
    for (const key of Object.keys(row)) {
      if (key === "group") continue;
      if (key === "key") continue;
      keys.add(key);
    }
  }
  return [...keys];
}

// Only TableCell elements replace cells; other elements render inside them.
function isTableCellElement(
  value: unknown,
): value is React.ReactElement<TableCellProps> {
  return React.isValidElement(value) && value.type === TableCell;
}

export type TableRow<K extends string | number> = {
  /**
   * Row group to render in. Defaults to `"body"`. This reserved field does not
   * render a column.
   */
  group?: TableRowGroupKind;
  /**
   * Stable identity within the row group, so edits and component state survive
   * reordering. This reserved field does not render a column. Rows without a
   * key use their position.
   */
  key?: React.Key;
  // Missing columns still render empty cells to preserve alignment.
} & Partial<Record<K, React.ReactNode | TableCellProps>>;

export type TableRows<K extends string | number> = TableRow<K>[];

const TableRowGroupContext = React.createContext<TableRowGroupKind>("body");

interface TableCellContextType {
  numeric: boolean;
  sort?: TableSortValue;
}

const TableCellContext = React.createContext<TableCellContextType>({
  numeric: false,
});

export interface TableProps<K extends string | number>
  extends React.ComponentProps<"table">, VariantProps<typeof table> {
  /**
   * Visible table name, or an element or props for `TableCaption`. An element
   * replaces the caption; use a props object with `children` for rich text.
   * Omit it or pass `null` or `false` to render no caption.
   */
  caption?: React.ReactNode | TableCaptionProps;
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
  /**
   * Custom element or props for `TableRow`. Also supplies the default for
   * `headRow` and `footRow`.
   */
  row?: React.ReactElement | TableRowProps;
  /**
   * Custom row element or props for head rows. Defaults to `row`, with the
   * `group` set to `"head"` unless the custom row overrides it.
   */
  headRow?: React.ReactElement | TableRowProps;
  /**
   * Custom row element or props for foot rows. Defaults to `row`, with the
   * `group` set to `"foot"` unless the custom row overrides it.
   */
  footRow?: React.ReactElement | TableRowProps;
  /**
   * Row data whose keys map to columns, except for the reserved `group` and
   * `key` fields. Values can be cell content, `TableCell` props, or a
   * `TableCell` element that replaces the cell. Other elements render inside a
   * cell. Missing columns render empty cells.
   */
  rows?: TableRows<K>;
}

/**
 * Renders a table from children or row data, with a `TableContainer` and a
 * `TableScroller`. Use `container` and `scroller` to configure these wrappers.
 * @example
 * <Table caption="People">
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
 *   caption="People"
 *   rows={[
 *     { group: "head", name: "Name", age: { children: "Age", numeric: true } },
 *     { key: "ada", name: "Ada", age: 37 },
 *   ]}
 * />
 */
export function Table<K extends string | number>({
  children,
  caption,
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
  const captionEl = createOptionalRender(TableCaption, caption);
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

  // Sparse rows must not render inherited values as cells.
  const getCell = (row: TableRow<K>, key: K) => {
    if (!Object.hasOwn(row, key)) return undefined;
    return row[key];
  };

  const getCellProps = (row: TableRow<K>, key: K) => {
    const cell = getCell(row, key);
    if (!cell) return;
    if (typeof cell !== "object") return;
    if (isTableCellElement(cell)) return cell.props;
    if (React.isValidElement(cell)) return;
    if (isIterable(cell)) return;
    return cell as TableCellProps;
  };

  // Keep empty cells aligned and wrap elements that cannot replace a cell.
  const getCellValue = (row: TableRow<K>, key: K) => {
    const value = getCell(row, key);
    if (value == null) return { children: null };
    if (isTableCellElement(value)) return value;
    if (React.isValidElement(value)) return { children: value };
    return value;
  };

  // Share column formatting from head cells. Sorting stays on the header.
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

  const columns = columnKeys.map((key) => ({
    key,
    props: getColumnProps(key as K),
  }));

  const renderRow = (row: TableRow<K>, index: number) => {
    const rowElement = getRowElement(row);
    // Keep explicit keys separate from positions in mixed keyed/unkeyed rows.
    const key = row.key == null ? `index:${index}` : `key:${row.key}`;
    return (
      <ak.Role key={key} render={rowElement}>
        {columns.map(({ key, props: columnProps }) => {
          const value = getCellValue(row, key as K);
          const tableCellElement = createRender<TableCellProps>(
            TableCell,
            value,
            {
              ...columnProps,
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
          {captionEl}
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

export interface TableCaptionProps
  extends React.ComponentProps<"caption">, VariantProps<typeof tableCaption> {}

/**
 * Renders the visible native table name.
 * @example
 * <Table
 *   caption={<TableCaption>People</TableCaption>}
 *   rows={[
 *     { group: "head", name: "Name" },
 *     { key: "ada", name: "Ada" },
 *   ]}
 * />
 */
export function TableCaption(props: TableCaptionProps) {
  const [variantProps, rest] = splitProps(props, tableCaption);
  return <caption {...tableCaption.jsx(variantProps)} {...rest} />;
}

export interface TableContainerProps
  extends React.ComponentProps<"div">, VariantProps<typeof tableContainer> {}

/**
 * Renders the outer frame around a table and its scroller.
 * @example
 * <Table
 *   caption="People"
 *   container={<TableContainer $rounded="lg" />}
 *   rows={[
 *     { group: "head", name: "Name" },
 *     { key: "ada", name: "Ada" },
 *   ]}
 * />
 */
export function TableContainer(props: TableContainerProps) {
  const [variantProps, rest] = splitProps(props, tableContainer);
  return <div {...tableContainer.jsx(variantProps)} {...rest} />;
}

export interface TableScrollerProps
  extends React.ComponentProps<"div">, VariantProps<typeof tableScroller> {}

/**
 * Renders a scrollable viewport around a table.
 * @example
 * <Table
 *   caption="People"
 *   scroller={<TableScroller style={{ maxHeight: 320 }} />}
 *   rows={[
 *     { group: "head", name: "Name" },
 *     { key: "ada", name: "Ada" },
 *   ]}
 * />
 */
export function TableScroller(props: TableScrollerProps) {
  const [variantProps, rest] = splitProps(props, tableScroller);
  return <div {...tableScroller.jsx(variantProps)} {...rest} />;
}

export interface TableRowGroupProps
  extends
    React.ComponentProps<"tbody" | "thead" | "tfoot">,
    VariantProps<typeof tableRowGroup> {
  /**
   * Selects the `thead`, `tbody`, or `tfoot` element and its styles. Defaults
   * to `"body"`.
   */
  group?: TableRowGroupKind;
}

/**
 * Renders a head, body, or foot group and shares it with its rows and cells.
 * @example
 * <Table
 *   caption="People"
 *   head={<TableRowGroup $sticky="top" />}
 *   rows={[
 *     { group: "head", name: "Name" },
 *     { key: "ada", name: "Ada" },
 *   ]}
 * />
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
  extends React.ComponentProps<"tr">, VariantProps<typeof tableRow> {
  /**
   * Row group used for default hover and selection styles. Inherits from
   * `TableRowGroup`, or defaults to `"body"` outside a group.
   */
  group?: TableRowGroupKind;
  /**
   * Sets the row's `aria-selected` state. Use `role="grid"` on a table with
   * selectable rows. Omit it for rows that cannot be selected.
   */
  selected?: boolean;
}

/**
 * Renders a table row with styles from its row group.
 * @example
 * <Table
 *   caption="People"
 *   row={<TableRow $hover={false} />}
 *   rows={[
 *     { group: "head", name: "Name" },
 *     { key: "ada", name: "Ada" },
 *   ]}
 * />
 */
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
        // Only body rows get hover and selection styles by default.
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
    // Semantic props keep styles, element, and scope in sync.
    Omit<VariantProps<typeof tableCell>, "$header" | "$numeric"> {
  /**
   * Aligns content to the end and uses tabular digits. Defaults to `false`.
   * Cells in `rows` inherit this setting from their column's head cell.
   */
  numeric?: boolean;
  /**
   * Renders a `th` with column or row scope. Defaults to `"column"` in a head
   * group and `false` elsewhere. `true` selects column scope in a head group
   * and row scope elsewhere.
   */
  header?: "column" | "row" | boolean;
  /**
   * Sets `aria-sort` and wraps a column header's content in `TableSortButton`.
   * Use `"none"` for an unsorted column. Does not sort the data. Ignored on
   * cells that are not column headers.
   */
  sort?: TableSortValue;
  /**
   * Custom element or props for `TableSortButton`. Used only on a column header
   * with `sort` set.
   */
  sortButton?: React.ReactElement | TableSortButtonProps;
}

/**
 * Renders a data or header cell with optional numeric and sorting styles.
 * @example
 * <Table caption="People">
 *   <TableRowGroup>
 *     <TableRow>
 *       <TableCell header="row">Ada</TableCell>
 *       <TableCell numeric>37</TableCell>
 *     </TableRow>
 *   </TableRowGroup>
 * </Table>
 */
export function TableCell({
  numeric,
  header,
  sort,
  sortButton,
  ...props
}: TableCellProps) {
  const group = React.useContext(TableRowGroupContext);
  header = header ?? (group === "head" ? "column" : false);
  // Explicit header kinds override the row group's default.
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
 * Renders a button across a sortable column header. Handle its click to sort
 * the data and update the cell's `sort` prop.
 * @example
 * <Table caption="People">
 *   <TableRowGroup group="head">
 *     <TableRow>
 *       <TableCell sort="ascending" sortButton={<TableSortButton disabled />}>
 *         Name
 *       </TableCell>
 *     </TableRow>
 *   </TableRowGroup>
 *   <TableRowGroup>
 *     <TableRow><TableCell>Ada</TableCell></TableRow>
 *   </TableRowGroup>
 * </Table>
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
 * Shows chevrons for an unsorted column or an arrow for its sort direction.
 * Children replace the icon. The indicator is hidden from assistive technology.
 * @example
 * <Table caption="People">
 *   <TableRowGroup group="head">
 *     <TableRow>
 *       <TableCell
 *         sort="ascending"
 *         sortButton={
 *           <TableSortButton disabled indicator={<TableSortIndicator />} />
 *         }
 *       >
 *         Name
 *       </TableCell>
 *     </TableRow>
 *   </TableRowGroup>
 *   <TableRowGroup>
 *     <TableRow><TableCell>Ada</TableCell></TableRow>
 *   </TableRowGroup>
 * </Table>
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
