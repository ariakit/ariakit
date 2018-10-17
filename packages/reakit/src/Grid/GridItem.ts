import * as PropTypes from "prop-types";
import { theme } from "styled-tools";
import { value } from "../_utils/styledProps";
import styled from "../styled";
import Box, { BoxProps } from "../Box";

export interface GridItemProps extends BoxProps {
  area?: string | number;
  column?: string | number;
  row?: string | number;
  columnStart?: string | number;
  columnEnd?: string | number;
  rowStart?: string | number;
  rowEnd?: string | number;
}

const GridItem = styled(Box)<GridItemProps>`
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

// @ts-ignore
GridItem.propTypes = {
  area: valueType,
  column: valueType,
  row: valueType,
  columnStart: valueType,
  columnEnd: valueType,
  rowStart: valueType,
  rowEnd: valueType
};

export default GridItem;
