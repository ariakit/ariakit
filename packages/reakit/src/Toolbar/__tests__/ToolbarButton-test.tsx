import * as React from "react";
import { render } from "react-testing-library";

import { ToolbarButton } from "../ToolbarButton";

const props: Parameters<typeof ToolbarButton>[0] = {
  stopId: "rover",
  stops: [],
  currentId: null,
  pastId: null,
  register: jest.fn(),
  unregister: jest.fn(),
  move: jest.fn(),
  next: jest.fn(),
  previous: jest.fn(),
  first: jest.fn(),
  last: jest.fn()
};

test("render", () => {
  const { baseElement } = render(
    <ToolbarButton {...props}>button</ToolbarButton>
  );
  expect(baseElement).toMatchInlineSnapshot(`
<body>
  <div>
    <button
      id="rover"
      role="button"
      tabindex="-1"
    >
      button
    </button>
  </div>
</body>
`);
});
