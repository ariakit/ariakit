import React from "react";
import { Flex, Block, Grid } from "../../../src";

const Wrapper = Flex.extend`
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 80px;
  & > * {
    max-width: 1200px;
  }
  @media (max-width: 1024px) {
    padding: 40px;
  }
  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const Banner = Flex.extend`
  padding-top: 200px;
  position: relative;
  align-items: flex-end;
  @media (max-width: 768px) {
    padding-top: 50px;
    align-items: center;
    flex-direction: column;
  }
`;

const BannerRight = Block.extend`
  margin-left: 330px;
  @media (max-width: 768px) {
    margin-left: 0;
    margin-top: 240px;
  }
  @media (max-width: 360px) {
    margin-left: 0;
    margin-top: 180px;
  }
`;

const Buttons = Block.extend`
  margin: 100px 0;
  @media (max-width: 768px) {
    margin: 40px 0;
  }
`;

const Cards = Grid.extend`
  padding: 80px;
  background-color: #f6f6f6;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  grid-gap: 20px;
  @media (max-width: 768px) {
    grid-auto-flow: row;
    grid-auto-rows: 1fr;
  }
`;

const HomeLayout = ({ bannerLeft, bannerRight, middle, cards, ...props }) => (
  <Wrapper {...props}>
    <Banner>
      {bannerLeft}
      <BannerRight>{bannerRight}</BannerRight>
    </Banner>
    <Buttons>{middle}</Buttons>
    <Cards>{cards}</Cards>
  </Wrapper>
);

export default HomeLayout;
