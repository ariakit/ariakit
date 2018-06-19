import { styled, Flex } from "reakit";

const ContentWrapper = styled(Flex)`
  align-items: center;
  max-width: 1200px;
  padding: 0 16px;
  width: 100%;
  height: 100%;

  @media (max-width: 768px) {
    padding: 0 8px;
  }
`;

export default ContentWrapper;
