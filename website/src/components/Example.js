import React from "react";
import { Button, Popover } from "reas";

const Example = () => (
  <Popover.State>
    {({ toggle, visible }) => (
      <Button onClick={toggle}>
        Click me
        <Popover visible={visible}>
          <Popover.Arrow />
          Popover
        </Popover>
      </Button>
    )}
  </Popover.State>
);

export default Example;
