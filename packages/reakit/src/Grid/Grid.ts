import * as PropTypes from "prop-types";
import { theme } from "styled-tools";
import { bool, value } from "../_utils/styledProps";
import styled from "../styled";
import use from "../use";
import Box, { BoxProps } from "../Box";

export interface GridProps extends BoxProps {
  row?: boolean;
  column?: boolean;
  dense?: boolean;
  gap?: string | number;
  template?: string | number;
  templateAreas?: string | number;
  templateColumns?: string | number;
  templateRows?: string | number;
  autoColumns?: string | number;
  autoRows?: string | number;
}

const Grid = styled(Box)<GridProps>`
  display: grid;
  &&& {
    ${bool("grid-auto-flow", ["row", "column", "dense"])}
    ${value("grid-gap", "gap")}
    ${value("grid-template", "template")}
    ${value("grid-template-areas", "templateAreas")}
    ${value("grid-template-columns", "templateColumns")}
    ${value("grid-template-rows", "templateRows")}
    ${value("grid-auto-columns", "autoColumns")}
    ${value("grid-auto-rows", "autoRows")}
  }
  ${theme("Grid")};
`;

const valueType = PropTypes.oneOfType([PropTypes.string, PropTypes.number]);

// @ts-ignore
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

export default use(Grid, "div");
