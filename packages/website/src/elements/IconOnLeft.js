import { styled, Base } from "reakit";

const IconOnLeft = styled(Base)`
  > svg:first-child,
  > div:first-child > svg {
    margin-right: 0.68em;
  }
`;

export default IconOnLeft;
