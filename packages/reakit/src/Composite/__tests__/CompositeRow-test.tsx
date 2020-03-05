import * as React from "react";
import { render } from "reakit-test-utils";
import {
  unstable_CompositeRowProps,
  unstable_CompositeRow as CompositeRow
} from "../CompositeRow";

const props: unstable_CompositeRowProps = {
  registerRow: jest.fn(),
  unregisterRow: jest.fn()
};

test("render", () => {
  const { container } = render(<CompositeRow {...props} id="1" />);
  expect(container).toMatchInlineSnapshot(`
    <div>
      <div
        id="1"
        role="group"
      />
    </div>
  `);
});

test("render without state props", () => {
  // @ts-ignore
  const { container } = render(<CompositeRow id="1" />);
  expect(container).toMatchInlineSnapshot(`
<div>
  <div
    id="1"
    role="group"
  />
</div>
`);
});
