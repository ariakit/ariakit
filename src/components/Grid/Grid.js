import PropTypes from "prop-types";
import styled from "styled-components";
import as from "../../enhancers/as";
import { bool, value } from "../../utils/styledProps";
import Base from "../Base";

const Grid = styled(Base)`
  display: grid;
  &&& {
    ${bool("grid-auto-flow", ["row", "column", "dense"])}
    ${value("grid-gap", "gap")}
    ${value("grid-template", "template")}
    ${value("grid-template-areas", "areas")}
    ${value("grid-template-columns", "columns")}
    ${value("grid-template-rows", "rows")}
    ${value("grid-auto-columns", "autoColumns")}
    ${value("grid-auto-rows", "autoRows")}
  }
`;

const valueType = PropTypes.oneOfType([PropTypes.string, PropTypes.number]);

Grid.propTypes = {
  row: PropTypes.bool,
  column: PropTypes.bool,
  dense: PropTypes.bool,
  gap: valueType,
  template: valueType,
  templateAreas: valueType,
  templateColumns: valueType,
  templateRows: valueType,
  autoColumns: valueType,
  autoRows: valueType
};

export default as("div")(Grid);
