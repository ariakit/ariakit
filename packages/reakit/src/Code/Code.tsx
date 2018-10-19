import * as React from "react";
import * as PropTypes from "prop-types";
import { theme } from "styled-tools";
import styled from "../styled";
import Box, { BoxProps } from "../Box";

export interface CodeProps extends BoxProps {
  block?: boolean;
  codeClassName?: string;
}

const CodeComponent = (props: CodeProps) => {
  if (props.block) {
    return (
      <Box use="pre" {...props}>
        <code className={props.codeClassName}>{props.children}</code>
      </Box>
    );
  }
  const className = props.codeClassName
    ? `${props.className} ${props.codeClassName}`.trim()
    : `${props.className}`.trim();
  return <Box use="code" {...props} className={className} />;
};

const Code = styled(Box)<CodeProps>`
  ${theme("Code")};
`;

// @ts-ignore
Code.propTypes = {
  block: PropTypes.bool,
  codeClassName: PropTypes.string
};

Code.defaultProps = {
  use: CodeComponent,
  opaque: true,
  palette: "background",
  tone: -2
};

export default Code;
