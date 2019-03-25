import * as React from "react";
import { render } from "react-testing-library";
import { unstable_Radio as Radio } from "../Radio";

const props: Parameters<typeof Radio>[0] = {
  value: "radio",
  stopId: "radio",
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
  const { baseElement } = render(<Radio {...props} />);
  expect(baseElement).toMatchInlineSnapshot(`
<body>
  <div>
    <input
      aria-checked="false"
      id="radio"
      role="radio"
      tabindex="-1"
      type="radio"
      value="radio"
    />
  </div>
</body>
`);
});
