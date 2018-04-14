import React from "react";
import { transform } from "babel-standalone";

console.log(
  transform(
    `import React from "react";
import { Button, Popover } from "reas";

const Component = () => (
  <Button>
    Button
    <Popover visible>
      <Popover.Arrow />
      Popover
    </Popover>
  </Button>
);
`,
    require("../../../.babelrc")
  )
);

const Preview = () => <div>oi</div>;

export default Preview;
