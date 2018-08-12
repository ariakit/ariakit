import PropTypes from "prop-types";
import { ifProp, prop } from "styled-tools";
import styled, { css } from "../styled";
import as from "../as";
import Base from "../Base";

const Divider = styled(Base)`
  border: 1px solid currentcolor;
  opacity: 0.2;

  ${ifProp(
    "vertical",
    css`
      margin: 0 1rem;
      min-height: 100%;
      width: 0;
      border-width: 0 0 0 1px;
    `,
    css`
      margin: 1rem 0;
      height: 0;
      border-width: 1px 0 0 0;
    `
  )};

  ${prop("theme.Divider")};
`;

Divider.propTypes = {
  vertical: PropTypes.bool
};

export default as("div")(Divider);
