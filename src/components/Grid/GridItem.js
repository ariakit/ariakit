import PropTypes from "prop-types";
import styled from "styled-components";
import { prop } from "styled-tools";
import as from "../../enhancers/as";
import { value } from "../../utils/styledProps";
import Base from "../Base";

const GridItem = styled(Base)`
  &&& {
    ${value("grid-area", "area")};
    ${value("grid-column", "column")};
    ${value("grid-row", "row")};
    ${value("grid-column-start", "columnStart")};
    ${value("grid-column-end", "columnEnd")};
    ${value("grid-row-start", "rowStart")};
    ${value("grid-row-end", "rowEnd")};
  }
  ${prop("theme.GridItem")};
`;

const valueType = PropTypes.oneOfType([PropTypes.string, PropTypes.number]);

GridItem.propTypes = {
  area: valueType,
  column: valueType,
  row: valueType,
  columnStart: valueType,
  columnEnd: valueType,
  rowStart: valueType,
  rowEnd: valueType
};

export default as("div")(GridItem);
