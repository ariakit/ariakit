import React from "react";
import { Block, Flex, Grid } from "reas";
import Example from "./Example";

const Wrapper = Flex.extend`
  width: 400px;
  max-width: calc(100vw - 32px);
  margin: 0 16px;
  flex-direction: column;
  background-color: white;
  border-radius: 10px 10px 0 0;
  overflow: hidden;
`;

const HomeExampleUI = props => (
  <Wrapper {...props}>
    <Grid
      columns="auto 1fr auto auto"
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
      <Example />
    </Grid>
  </Wrapper>
);

export default HomeExampleUI;
