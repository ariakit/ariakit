import React from "react";
import PropTypes from "prop-types";
import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Base from "../Base";

const Component = props => {
  if (props.block) {
    return (
      <Base as="pre" {...props}>
        <code className={props.codeClassName}>{props.children}</code>
      </Base>
    );
  }
  const className = props.codeClassName
    ? `${props.className} ${props.codeClassName}`.trim()
    : `${props.className}`.trim();
  return <Base as="code" {...props} className={className} />;
};

const Code = styled(Base)`
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
