import * as React from "react";
import { render } from "@testing-library/react";
import { TooltipReference } from "../TooltipReference";

const props: Parameters<typeof TooltipReference>[0] = {
  unstable_hiddenId: "tooltip",
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
