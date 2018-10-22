import { theme } from "styled-tools";
import styled from "../styled";
import use from "../use";
import Box, { BoxProps } from "../Box";

export interface TabsProps extends BoxProps {}

const Tabs = styled(Box)<TabsProps>`
  ${theme("Tabs")};
`;

Tabs.defaultProps = {
  role: "tablist"
};

export default use(Tabs, "ul");
