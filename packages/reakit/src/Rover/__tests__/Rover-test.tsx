import * as React from "react";
import { render } from "react-testing-library";
import { Rover } from "../Rover";

const props: Parameters<typeof Rover>[0] = {
  stopId: "rover",
  unstable_stops: [],
  unstable_currentId: null,
  unstable_pastId: null,
  unstable_register: jest.fn(),
  unstable_unregister: jest.fn(),
  unstable_move: jest.fn(),
  unstable_next: jest.fn(),
  unstable_previous: jest.fn(),
  unstable_first: jest.fn(),
  unstable_last: jest.fn()
};

test("render", () => {
  const { baseElement } = render(<Rover {...props}>rover</Rover>);
  expect(baseElement).toMatchInlineSnapshot(`
<body>
  <div>
    <button
      id="rover"
      tabindex="-1"
    >
      rover
    </button>
  </div>
</body>
`);
});

test("render currentId equals to stopId", () => {
  const { baseElement } = render(
    <Rover {...props} unstable_currentId="rover">
      rover
    </Rover>
  );
  expect(baseElement).toMatchInlineSnapshot(`
<body>
  <div>
    <button
      id="rover"
      tabindex="0"
    >
      rover
    </button>
  </div>
</body>
`);
});
