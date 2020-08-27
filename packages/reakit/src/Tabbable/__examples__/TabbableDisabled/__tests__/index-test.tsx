import * as React from "react";
import { render, axe } from "reakit-test-utils";
import TabbableDisabled from "..";

test("renders with no a11y violations", async () => {
  const { baseElement } = render(<TabbableDisabled />);
  expect(await axe(baseElement)).toHaveNoViolations();
});
