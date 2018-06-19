import React from "react";
import { styled } from "reakit";
import Hero from "../components/Hero";
import HomeExample from "../components/HomeExample";
import Credits from "../components/Credits";
import CoreLayout from "../layouts/CoreLayout";
import HomeFeatures from "../components/HomeFeatures";

const StyledHero = styled(Hero)`
  margin: 160px 0 100px;
  @media (max-width: 768px) {
    margin: 100px 0 40px;
  }
`;

const StyledHomeFeatures = styled(HomeFeatures)`
  margin: 100px 0;
  @media (max-width: 768px) {
    margin: 40px 0;
  }
`;

const Home = () => (
  <CoreLayout>
    <StyledHero />
    <HomeExample />
    <StyledHomeFeatures />
    <Credits />
  </CoreLayout>
);

export default Home;
