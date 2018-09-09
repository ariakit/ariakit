import React from "react";
import PropTypes from "prop-types";
import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Box from "../Box";

const Component = props => {
  if (props.block) {
    return (
      <Box as="pre" {...props}>
        <code className={props.codeClassName}>{props.children}</code>
      </Box>
    );
  }
  const className = props.codeClassName
    ? `${props.className} ${props.codeClassName}`.trim()
    : `${props.className}`.trim();
  return <Box as="code" {...props} className={className} />;
};

const Code = styled(Box)`
  ${theme("Code")};
`;

Code.propTypes = {
  block: PropTypes.bool,
  codeClassName: PropTypes.string
};

Code.defaultProps = {
  opaque: true,
  palette: "background",
  tone: -2
};

export default as(Component)(Code);
