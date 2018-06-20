import React from "react";
import PropTypes from "prop-types";
import { styled, Flex } from "reakit";
import { prop, ifProp } from "styled-tools";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ScrollContainer from "../containers/ScrollContainer";

const Wrapper = styled(Flex)`
  flex-direction: column;
  background-color: white;
  color: ${prop("theme.black")};
  align-items: center;
  min-height: 100vh;
  width: 100%;
`;

const StyledHeader = styled(Header)`
  position: fixed;
  top: 0;
  left: 0;
  ${ifProp("shadowed", "box-shadow: 0 0 1px rgba(0, 0, 0, 0.25)")};
`;

const CoreLayout = ({ children, ...props }) => (
  <Wrapper {...props}>
    <ScrollContainer>
      {({ y }) => <StyledHeader shadowed={y > 0} />}
    </ScrollContainer>
    {children}
    <Footer />
  </Wrapper>
);

CoreLayout.propTypes = {
  children: PropTypes.node
};

export default CoreLayout;
