import styled from "styled-components";
import React from "react";
import PropTypes from "prop-types";
import as from "../../enhancers/as";
import Base from "../Base";
import Block from "../Block";

const Img = styled(Base)`
  display: block;
  max-width: 100%;
`;

const Image = props => {
  if (props.wrapped) {
    return (
      <Block className="foobar">
        <Img {...props} />
      </Block>
    );
  }
  return <Img {...props} />;
};

Image.propTypes = {
  src: PropTypes.string,
  wrapped: PropTypes.bool
};

export default as("img")(Image);
