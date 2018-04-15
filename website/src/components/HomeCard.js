import React from "react";
import PropTypes from "prop-types";
import { Block, Flex } from "reas";

const Wrapper = Flex.extend`
  flex-direction: column;
`;

const Title = Block.as("h2").extend`
  font-family: Georgia, serif;
  font-weight: 400;
  font-size: 32px;
  text-align: center;
  margin-bottom: 30px;
`;

const HomeCard = ({ title, children, ...props }) => (
  <Wrapper {...props}>
    <Title>{title}</Title>
    {children}
  </Wrapper>
);

HomeCard.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node
};

export default HomeCard;
