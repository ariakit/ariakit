import React from "react";
import BarsIcon from "react-icons/lib/fa/bars";
import { Flex, Button, Popover } from "reas";

const Wrapper = Flex.extend`
  width: 400px;
  height: 300px;
  align-items: flex-start;
`;

const Toolbar = Flex.extend`
  background-color: #eee;
  width: 100%;
  padding: 8px;
  justify-content: flex-end;
`;

const HomeExampleUI = props => (
  <Wrapper {...props}>
    <Toolbar>
      <Popover.State>
        {popover => (
          <Button as={Popover.Toggle} {...popover}>
            <BarsIcon />
            <Popover gutter="4px" align="end" {...popover}>
              dsdsa
            </Popover>
          </Button>
        )}
      </Popover.State>
    </Toolbar>
  </Wrapper>
);

export default HomeExampleUI;
