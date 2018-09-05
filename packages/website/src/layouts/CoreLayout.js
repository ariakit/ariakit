import React from "react";
import PropTypes from "prop-types";
import { styled, css, Flex } from "reakit";
import { palette, ifProp } from "styled-tools";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ScrollContainer from "../containers/ScrollContainer";

const Wrapper = styled(Flex)`
  flex-direction: column;
  background-color: white;
  color: ${palette("backgroundText", -1)};
  align-items: center;
  min-height: 100vh;
  width: 100%;
`;

const StyledHeader = styled(Header)`
  position: fixed;
  top: 0;
  left: 0;
  height: 60px;
  ${ifProp(
    "shadowed",
    css`
      box-shadow: 0 0 1px ${palette("shadow", -3)};
    `
  )};
`;

const Content = styled(Flex)`
  position: relative;
  flex-direction: column;
  align-items: center;
  margin: 60px 0;
  width: 100%;
`;

const StyledFooter = styled(Footer)`
  margin-top: auto;
`;

const CoreLayout = ({ children, headerShadowed, ...props }) => (
  <Wrapper {...props}>
    {headerShadowed ? (
      <StyledHeader shadowed />
    ) : (
      <ScrollContainer>
        {({ y }) => <StyledHeader shadowed={y > 0} />}
      </ScrollContainer>
    )}
    <Content>{children}</Content>
    <StyledFooter />
  </Wrapper>
);

CoreLayout.propTypes = {
  children: PropTypes.node,
  headerShadowed: PropTypes.bool
};

export default CoreLayout;
