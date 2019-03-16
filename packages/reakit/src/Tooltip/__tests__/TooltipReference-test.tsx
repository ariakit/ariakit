import * as React from "react";
import { render } from "react-testing-library";
import { TooltipReference } from "../TooltipReference";

const props = {
  refId: "tooltip",
  show: jest.fn(),
  hide: jest.fn()
};

test("render", () => {
  const { baseElement } = render(
    <TooltipReference {...props}>reference</TooltipReference>
  );
  expect(baseElement).toMatchInlineSnapshot(`
<body>
  <div>
    <div
      aria-describedby="tooltip"
      tabindex="0"
    >
      reference
    </div>
  </div>
</body>
`);
});
