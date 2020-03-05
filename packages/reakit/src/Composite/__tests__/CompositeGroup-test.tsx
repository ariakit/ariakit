import * as React from "react";
import { render } from "reakit-test-utils";
import {
  unstable_CompositeGroupProps,
  unstable_CompositeGroup as CompositeGroup
} from "../CompositeGroup";

const props: unstable_CompositeGroupProps = {
  registerGroup: jest.fn(),
  unregisterGroup: jest.fn()
};

test("render", () => {
  const { container } = render(<CompositeGroup {...props} id="1" />);
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
  const { container } = render(<CompositeGroup id="1" />);
  expect(container).toMatchInlineSnapshot(`
<div>
  <div
    id="1"
    role="group"
  />
</div>
`);
});
