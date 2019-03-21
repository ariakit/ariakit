import * as React from "react";
import { render } from "react-testing-library";
import { Rover } from "../Rover";

const props: Parameters<typeof Rover>[0] = {
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
  const { baseElement } = render(<Rover {...props}>rover</Rover>);
  expect(baseElement).toMatchInlineSnapshot(`
<body>
  <div>
    <button
      id="rover"
      role="button"
      tabindex="-1"
      type="button"
    >
      rover
    </button>
  </div>
</body>
`);
});

test("render currentId equals to stopId", () => {
  const { baseElement } = render(
    <Rover {...props} currentId="rover">
      rover
    </Rover>
  );
  expect(baseElement).toMatchInlineSnapshot(`
<body>
  <div>
    <button
      id="rover"
      role="button"
      tabindex="0"
      type="button"
    >
      rover
    </button>
  </div>
</body>
`);
});
