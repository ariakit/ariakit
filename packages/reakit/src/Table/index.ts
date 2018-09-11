import Table from "./Table";
import TableWrapper from "./TableWrapper";

interface TableComponents {
  Wrapper: typeof TableWrapper;
}

const T = Table as typeof Table & TableComponents;

T.Wrapper = TableWrapper;

export default Table;
