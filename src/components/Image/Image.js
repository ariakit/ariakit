import styled from "styled-components";
import PropTypes from "prop-types";
import as from "../../enhancers/as";
import Base from "../Base";

const Image = styled(Base)`
  display: block;
  max-width: 100%;
`;

Image.propTypes = {
  src: PropTypes.string
};

export default as("img")(Image);
