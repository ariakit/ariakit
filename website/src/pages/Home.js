import React from "react";
import { styled } from "reakit";
import Hero from "../components/Hero";
import HomeExample from "../components/HomeExample";
import CoreLayout from "../layouts/CoreLayout";
import HomeFeatures from "../components/HomeFeatures";

const StyledHero = styled(Hero)`
  margin: 100px 0;
  @media (max-width: 768px) {
    margin: 40px 0;
  }
`;

const StyledHomeFeatures = styled(HomeFeatures)`
  margin: 100px 0 60px;
  @media (max-width: 768px) {
    margin: 40px 0 0;
  }
`;

const Home = () => (
  <CoreLayout>
    <StyledHero />
    <HomeExample />
    <StyledHomeFeatures />
  </CoreLayout>
);

export default Home;
