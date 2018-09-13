import * as PropTypes from "prop-types";
import { theme } from "styled-tools";
import { value } from "../_utils/styledProps";
import styled from "../styled";
import as from "../as";
import Box from "../Box";

export interface GridItemProps {
  area: string | number;
  column: string | number;
  row: string | number;
  columnStart: string | number;
  columnEnd: string | number;
  rowStart: string | number;
  rowEnd: string | number;
}

const GridItem = styled(Box)`
  &&& {
    ${value("grid-area", "area")};
    ${value("grid-column", "column")};
    ${value("grid-row", "row")};
    ${value("grid-column-start", "columnStart")};
    ${value("grid-column-end", "columnEnd")};
    ${value("grid-row-start", "rowStart")};
    ${value("grid-row-end", "rowEnd")};
  }
  ${theme("GridItem")};
`;

const valueType = PropTypes.oneOfType([PropTypes.string, PropTypes.number]);

GridItem.propTypes = {
  // @ts-ignore
  area: valueType,
  column: valueType,
  row: valueType,
  columnStart: valueType,
  columnEnd: valueType,
  rowStart: valueType,
  rowEnd: valueType
};

export default as("div")(GridItem);
