import * as React from "react";
import { render } from "react-testing-library";
import { ToolbarButton } from "../ToolbarButton";

const props = {
  refs: [],
  activeRef: null,
  lastActiveRef: null,
  getFirst: jest.fn(),
  register: jest.fn(),
  unregister: jest.fn(),
  moveTo: jest.fn(),
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
      role="button"
      tabindex="-1"
    >
      button
    </button>
  </div>
</body>
`);
});
