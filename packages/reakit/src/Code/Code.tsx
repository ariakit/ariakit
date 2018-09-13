import * as React from "react";
import * as PropTypes from "prop-types";
import { theme } from "styled-tools";
import styled from "../styled";
import as, { AllProps } from "../as";
import Box from "../Box";

export type CodeProps = AllProps & {
  block?: boolean;
  codeClassName?: string;
};

const Component = (props: CodeProps) => {
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

export default as(Component)(Code);
