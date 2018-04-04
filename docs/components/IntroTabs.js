import React from "react";
import PropTypes from "prop-types";
import as, { Flex, Button, Tabs } from "../../src";
import Brackets from "./Brackets";

const Bullets = Flex.extend`
  align-items: center;
  > * {
    margin: 8px;
  }
`;

const Bullet = Button.extend`
  border: none;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  min-width: auto;
  background-color: rgba(255, 255, 255, 0.1);

  &:hover {
    background-color: rgba(255, 255, 255, 0.5);
  }

  &.active {
    background-color: white;
  }
`;

const Navigation = Flex.extend`
  align-items: center;
  justify-content: center;
  margin: 32px 0;
`;

const IntroTabs = ({ tabs, items, ...props }) => (
  <Navigation {...props}>
    <Brackets as={[Button, Tabs.Previous]} {...tabs} pos="left" />
    <Bullets as={Tabs}>
      {items.map((_, i) => (
        <Bullet key={`bullet-${i}`} as={Tabs.Tab} tab={`tab${i}`} {...tabs} />
      ))}
    </Bullets>
    <Brackets as={[Button, Tabs.Next]} {...tabs} pos="right" />
  </Navigation>
);

IntroTabs.propTypes = {
  tabs: PropTypes.object.isRequired,
  items: PropTypes.array.isRequired
};

export default as("div")(IntroTabs);
