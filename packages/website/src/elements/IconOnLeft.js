import { styled, Box } from "reakit";

const IconOnLeft = styled(Box)`
  > svg:first-child,
  > div:first-child > svg {
    margin-right: 0.68em;
  }
`;

export default IconOnLeft;
