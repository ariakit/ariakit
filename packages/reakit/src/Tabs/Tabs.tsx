import { theme } from "styled-tools";
import styled from "../styled";
import Box, { BoxProps } from "../Box";

export interface TabsProps extends BoxProps {}

const Tabs = styled(Box)<TabsProps>`
  ${theme("Tabs")};
`;

Tabs.defaultProps = {
  use: "ul",
  role: "tablist"
};

export default Tabs;
