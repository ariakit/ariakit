import React from "react";
import PropTypes from "prop-types";
import FaExternalLink from "react-icons/lib/fa/external-link";
import as, { styled, Inline, InlineFlex } from "../../src";

const Wrapper = styled(InlineFlex)`
  text-decoration: none;
  font-weight: 500;
  color: #4dbcfc !important;

  &:hover {
    text-decoration: underline !important;
  }
`;

const Link = ({ blank, children, ...props }) => (
  <Wrapper {...props} {...(blank ? { target: "_blank" } : {})}>
    {children}
    {blank && (
      <Inline marginLeft="0.35em">
        <FaExternalLink />
      </Inline>
    )}
  </Wrapper>
);

Link.propTypes = {
  blank: PropTypes.bool,
  children: PropTypes.node.isRequired
};

export default as("a")(Link);
