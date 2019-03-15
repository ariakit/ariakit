import * as React from "react";
import { render } from "react-testing-library";
import { Rover } from "../Rover";

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
  const { baseElement } = render(<Rover {...props}>rover</Rover>);
  expect(baseElement).toMatchInlineSnapshot(`
<body>
  <div>
    <button
      role="button"
      tabindex="-1"
    >
      rover
    </button>
  </div>
</body>
`);
});

test("render activeRef equals to refId", () => {
  const { baseElement } = render(
    <Rover {...props} activeRef="a" refId="a">
      rover
    </Rover>
  );
  expect(baseElement).toMatchInlineSnapshot(`
<body>
  <div>
    <button
      role="button"
      tabindex="0"
    >
      rover
    </button>
  </div>
</body>
`);
});
