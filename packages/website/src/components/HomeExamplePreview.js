import React from "react";
import { styled, Block, Flex, Grid } from "reakit";

const Wrapper = styled(Flex)`
  width: 400px;
  max-width: calc(100vw - 32px);
  margin: 16px 16px 0;
  flex-direction: column;
  background-color: white;
  border-radius: 10px 10px 0 0;
  overflow: hidden;
  @media (max-width: 764px) {
    margin: 16px 0 0;
  }
`;

const HomeExamplePreview = ({ children, ...props }) => (
  <Wrapper {...props}>
    <Grid
      templateColumns="auto 1fr auto auto"
      gap={16}
      alignItems="center"
      padding={16}
    >
      <Block width={40} height={40} background="#ddd" borderRadius="50%" />
      <Block width={100} height={20} background="#ddd" borderRadius={4} />
      <Block width={30} height={30} background="#ddd" borderRadius="50%" />
      <Block width={30} height={30} background="#ddd" borderRadius="50%" />
    </Grid>
    <Grid
      justifyContent="center"
      justifyItems="center"
      gap={16}
      padding={16}
      background="#ddd"
      paddingBottom={100}
    >
      <Block width={100} height={20} background="#aaa" borderRadius={4} />
      <Block width={200} height={20} background="#ccc" borderRadius={4} />
    </Grid>
    <Grid
      alignSelf="center"
      gap={16}
      margin={16}
      marginTop={-84}
      width="80%"
      border="2px solid #ddd"
      background="white"
      borderRadius={4}
      alignItems="center"
      justifyContent="center"
      height={150}
    >
      {children}
    </Grid>
  </Wrapper>
);

export default HomeExamplePreview;
