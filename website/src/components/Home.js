import React from "react";
import { Flex } from "reas";
import HomeBanner from "./HomeBanner";
import HomeExample from "./HomeExample";
import Credits from "./Credits";

const Wrapper = Flex.extend`
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  font-family: sans-serif;
`;

const Home = () => (
  <Wrapper>
    <HomeBanner />
    <HomeExample />
    <Credits />
  </Wrapper>
);

export default Home;
