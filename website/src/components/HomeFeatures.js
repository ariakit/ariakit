import React from "react";
import { as, styled, Grid, Paragraph } from "reakit";
import ContentWrapper from "../elements/ContentWrapper";
import Heading from "../elements/Heading";
import Link2 from "../elements/Link";

const Wrapper = styled(ContentWrapper)`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 30px;
  align-items: start;
  max-width: 960px;
  align-content: baseline;

  @media (max-width: 768px) {
    grid-gap: 20px;
    grid-template-columns: 1fr;
  }
`;

const Feature = styled(Grid)`
  text-align: center;
`;

const Title = styled(as("h3")(Heading))`
  font-weight: 500;
`;

const HomeFeatures = props => (
  <Wrapper {...props}>
    <Feature>
      <Title>Composable</Title>
      <Paragraph>
        ReaKit is built with composition in mind. You can leverage any component
        or container to create something new.
      </Paragraph>
    </Feature>
    <Feature>
      <Title>Accessible</Title>
      <Paragraph>
        All components are WAI-ARIA compliant by default. ReaKit adds proper
        roles and interactions to the components out of the box.
      </Paragraph>
    </Feature>
    <Feature>
      <Title>Reliable</Title>
      <Paragraph>
        All components are in accordance with the{" "}
        <Link2
          href="https://medium.freecodecamp.org/introducing-the-single-element-pattern-dfbd2c295c5d"
          target="_blank"
        >
          Single Element Pattern
        </Link2>, which makes them resemble native HTML elements as most as
        possible.
      </Paragraph>
    </Feature>
  </Wrapper>
);

export default HomeFeatures;
