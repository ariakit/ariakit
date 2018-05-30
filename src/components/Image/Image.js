import styled from "styled-components";
import PropTypes from "prop-types";
import as from "../../enhancers/as";
import { bool, value } from "../../utils/styledProps";
import Base from "../Base";

const Image = styled(Base)`
  display: block;
  max-width: 100%;
  &&& {
    ${"" /* ${bool("grid-auto-flow", ["row", "column", "dense"])}
    ${value("grid-gap", "gap")} */};
  }
`;

// const valueType = PropTypes.oneOfType([PropTypes.string, PropTypes.number]);

Image.propTypes = {
  src: PropTypes.string
};

export default as("img")(Image);
