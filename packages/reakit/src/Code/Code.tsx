import * as React from "react";
import * as PropTypes from "prop-types";
import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Box, { BoxProps } from "../Box";

export interface CodeProps extends BoxProps {
  block?: boolean;
  codeClassName?: string;
  className?: string;
  children?: React.ReactNode;
}

const CodeComponent = (props: CodeProps) => {
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

const Code = styled(Box)<CodeProps>`
  ${theme("Code")};
`;

// @ts-ignore
Code.propTypes = {
  block: PropTypes.bool,
  codeClassName: PropTypes.string
};

Code.defaultProps = {
  opaque: true,
  palette: "background",
  tone: -2
};

export default as(CodeComponent)(Code);
