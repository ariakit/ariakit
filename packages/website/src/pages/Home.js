import React from "react";
import { styled } from "reakit";
import { Helmet } from "react-helmet";
import Hero from "../components/Hero";
import HomeExample from "../components/HomeExample";
import CoreLayout from "../layouts/CoreLayout";
import HomeFeatures from "../components/HomeFeatures";
import NewsletterForm from "../components/NewsletterForm";

const StyledHero = styled(Hero)`
  margin: 100px 0;
  @media (max-width: 768px) {
    margin: 40px 0;
  }
`;

const StyledHomeFeatures = styled(HomeFeatures)`
  margin: 100px 0 70px;
  @media (max-width: 768px) {
    margin: 40px 0 20px;
  }
`;

const StyledNewsletterForm = styled(NewsletterForm)`
  margin: 50px 0 0;
`;

const Home = () => (
  <CoreLayout>
    <Helmet>
      <title>Reakit</title>
    </Helmet>
    <StyledHero />
    <HomeExample />
    <StyledHomeFeatures />
    <StyledNewsletterForm />
  </CoreLayout>
);

export default Home;
