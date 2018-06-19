import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { ifProp, prop } from "styled-tools";
import as from "../../enhancers/as";
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
  background-color: rgba(0, 0, 0, 0.05);
  font-family: monospace;
  white-space: pre-wrap;
  word-wrap: break-word;
  padding: ${ifProp("block", "0", "0.25em 0.35em")};

  code {
    display: block;
    padding: 1em;
  }

  ${prop("theme.Code")};
`;

Code.propTypes = {
  block: PropTypes.bool,
  codeClassName: PropTypes.string
};

export default as(Component)(Code);
